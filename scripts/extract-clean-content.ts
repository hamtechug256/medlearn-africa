import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');

// Extract clean content from raw HTML using a more robust approach
function extractCleanContent(rawHtml: string): { content: string; description: string; wordCount: number } {
  if (!rawHtml) {
    return { content: '', description: '', wordCount: 0 };
  }

  // Find the entry-content div - this is where WordPress puts the actual content
  // Match from entry-content to the closing </article>
  let content = '';
  
  // Strategy 1: Find entry-content clear div
  const entryMatch = rawHtml.match(/<div[^>]*class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
  if (entryMatch) {
    content = entryMatch[1];
  }

  // Strategy 2: If no entry-content, find the article body
  if (!content) {
    const articleMatch = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = articleMatch[1];
      // Remove header from article
      content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/i, '');
    }
  }

  // Strategy 3: Extract text-editor content (Elementor)
  if (!content || content.length < 100) {
    const textWidgets: string[] = [];
    // Match text-editor widget content
    const widgetRegex = /<div[^>]*class="elementor-widget-container"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div|<\/section|<\/article)/gi;
    let match;
    while ((match = widgetRegex.exec(rawHtml)) !== null) {
      const widgetContent = match[1].trim();
      // Only include if it has actual text content (not just scripts or empty)
      const textCheck = widgetContent.replace(/<[^>]+>/g, '').trim();
      if (textCheck.length > 20 && !widgetContent.includes('adsbygoogle')) {
        textWidgets.push(widgetContent);
      }
    }
    if (textWidgets.length > 0) {
      content = textWidgets.join('\n\n');
    }
  }

  // Clean up the content
  // Remove scripts, styles, comments
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<ins[^>]*class="adsbygoogle[^"]*"[^>]*>[\s\S]*?<\/ins>/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove ads divs
  content = content.replace(/<div[^>]*class="[^"]*ad[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove share buttons
  content = content.replace(/<div[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove navigation elements
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
  
  // Remove data attributes for cleaner HTML
  content = content.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');
  content = content.replace(/\s+itemprop="[^"]*"/gi, '');
  content = content.replace(/\s+itemtype="[^"]*"/gi, '');
  content = content.replace(/\s+itemscope="[^"]*"/gi, '');
  
  // Clean up Elementor specific classes and attributes but keep structure
  content = content.replace(/class="elementor-[a-z0-9-]+"/gi, 'class="content-block"');
  content = content.replace(/class="ast-[a-z0-9-]+"/gi, 'class="content-block"');
  
  // Remove empty divs and excessive nesting
  content = content.replace(/<div[^>]*>\s*<\/div>/gi, '');
  content = content.replace(/(<div[^>]*>\s*){3,}/gi, '<div class="content-section">');
  content = content.replace(/(<\/div>\s*){3,}/gi, '</div>');
  
  // Clean up excessive whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  content = content.trim();

  // Extract text for description and word count
  const textOnly = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = textOnly.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Generate a proper description from the first meaningful content
  let description = '';
  if (words.length > 10) {
    description = words.slice(0, 30).join(' ');
    if (words.length > 30) description += '...';
  }

  return { content, description, wordCount };
}

// Check if topic is valid educational content
function isValidTopic(title: string, content: string): boolean {
  const lowerTitle = title.toLowerCase();
  
  // Skip irrelevant patterns
  const skipPatterns = [
    'whatsapp', 'telegram', 'facebook.com', 'instagram', 'twitter', 'tiktok',
    'meta ai', 'privacy policy', 'terms of service', 'contact us',
    'skip to content', '256726113908', '42wao7ewp3hta1', 'admin', 'login',
    'password', 'register', 'sign up', 'about us'
  ];

  for (const pattern of skipPatterns) {
    if (lowerTitle.includes(pattern)) {
      console.log(`  Skipping "${title}" - contains "${pattern}"`);
      return false;
    }
  }

  // Skip if content is too short
  if (content.length < 300) {
    console.log(`  Skipping "${title}" - content too short (${content.length} chars)`);
    return false;
  }

  // Skip if content is mostly navigation
  const navPhrases = ['skip to content', 'home', 'blog', 'about', 'contact'];
  const contentLower = content.toLowerCase();
  let navCount = 0;
  for (const phrase of navPhrases) {
    if (contentLower.includes(phrase)) navCount++;
  }
  
  // If only navigation phrases and no real content
  const textOnly = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (textOnly.length < 200 && navCount >= 3) {
    console.log(`  Skipping "${title}" - appears to be navigation only`);
    return false;
  }

  return true;
}

// Process all topic files
console.log('Scanning topics directory...');
const files = fs.readdirSync(topicsDir).filter(f => f.endsWith('.json'));
console.log(`Found ${files.length} topic files\n`);

const validTopics: any[] = [];
const categories: Record<string, number> = {};

for (const file of files) {
  const filePath = path.join(topicsDir, file);
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const topicData = JSON.parse(rawData);
    
    // Extract clean content
    const { content, description, wordCount } = extractCleanContent(topicData.rawHtml);
    
    // Check validity
    if (!isValidTopic(topicData.title, content)) {
      // Delete invalid file
      fs.unlinkSync(filePath);
      continue;
    }

    // Create clean topic object
    const slug = file.replace('.json', '');
    const cleanTopic = {
      id: slug,
      title: topicData.title,
      filename: topicData.filename,
      category: topicData.category || 'General Nursing',
      description: description || topicData.description || '',
      wordCount,
      images: topicData.images || [],
      content
    };

    // Save cleaned topic (without rawHtml to save space)
    fs.writeFileSync(filePath, JSON.stringify(cleanTopic, null, 2));

    // Add to index
    validTopics.push({
      id: slug,
      title: cleanTopic.title,
      filename: cleanTopic.filename,
      category: cleanTopic.category,
      description: cleanTopic.description,
      wordCount: cleanTopic.wordCount,
      images: cleanTopic.images
    });

    // Track category
    categories[cleanTopic.category] = (categories[cleanTopic.category] || 0) + 1;

    if (validTopics.length % 50 === 0) {
      console.log(`Processed ${validTopics.length} valid topics...`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}

console.log(`\n=== Saving updated files ===`);

// Save topics index
fs.writeFileSync(path.join(dataDir, 'topics-index.json'), JSON.stringify(validTopics, null, 2));

// Save categories
const categoriesList = Object.entries(categories)
  .map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/\//g, '-'),
    name,
    count,
    description: `${name} nursing topics`
  }))
  .sort((a, b) => b.count - a.count);

fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categoriesList, null, 2));

// Save summary
const summary = {
  totalTopics: validTopics.length,
  totalImages: 2990,
  downloadedImages: 2985,
  categories,
  processedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(dataDir, 'summary.json'), JSON.stringify(summary, null, 2));

console.log(`\n=== Done! ===`);
console.log(`Valid topics: ${validTopics.length}`);
console.log(`Categories: ${categoriesList.length}`);
console.log(`\nTop categories:`);
categoriesList.slice(0, 5).forEach(c => console.log(`  ${c.name}: ${c.count} topics`));
