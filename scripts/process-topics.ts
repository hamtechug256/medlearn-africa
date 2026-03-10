import fs from 'fs';
import path from 'path';

const GITHUB_REPO = 'https://raw.githubusercontent.com/hamtechug256/nursing-notes/main/';
const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');

// Ensure directories exist
if (!fs.existsSync(topicsDir)) {
  fs.mkdirSync(topicsDir, { recursive: true });
}

// Category mapping based on keywords
function categorizeTopic(title: string, content: string): { category: string; categoryId: string } {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  const categoryMap: { keywords: string[]; category: string; categoryId: string }[] = [
    { keywords: ['anatomy', 'physiology', 'body system', 'organ'], category: 'Anatomy & Physiology', categoryId: 'anatomy-physiology' },
    { keywords: ['pharmacology', 'drug', 'medication', 'dose', 'injection'], category: 'Pharmacology', categoryId: 'pharmacology' },
    { keywords: ['paediatric', 'pediatric', 'child', 'infant', 'newborn', 'baby'], category: 'Pediatric Nursing', categoryId: 'pediatric-nursing' },
    { keywords: ['mental', 'psychiatric', 'depression', 'anxiety', 'schizophrenia', 'psychosis'], category: 'Mental Health Nursing', categoryId: 'mental-health' },
    { keywords: ['community', 'public health', 'epidemiology'], category: 'Community Health', categoryId: 'community-health' },
    { keywords: ['maternal', 'pregnancy', 'antenatal', 'postnatal', 'delivery', 'labour', 'obstetric'], category: 'Maternal & Child Health', categoryId: 'maternal-child' },
    { keywords: ['surgical', 'surgery', 'operation', 'preoperative', 'postoperative'], category: 'Medical-Surgical Nursing', categoryId: 'medical-surgical' },
    { keywords: ['emergency', 'trauma', 'accident', 'shock', 'resuscitation'], category: 'Emergency Nursing', categoryId: 'emergency-nursing' },
    { keywords: ['microbiology', 'bacteria', 'virus', 'infection control', 'sterilization'], category: 'Microbiology', categoryId: 'microbiology' },
    { keywords: ['research', 'ethics', 'statistics', 'study'], category: 'Research & Ethics', categoryId: 'research-ethics' },
    { keywords: ['geriatric', 'elderly', 'aged', 'older adult'], category: 'Geriatric Nursing', categoryId: 'geriatric-nursing' },
    { keywords: ['nutrition', 'diet', 'feeding', 'malnutrition'], category: 'Nutrition & Dietetics', categoryId: 'nutrition' },
    { keywords: ['fundamental', 'basic nursing', 'nursing process', 'vital signs'], category: 'Nursing Fundamentals', categoryId: 'nursing-fundamentals' },
    { keywords: ['pathophysiology', 'disease process', 'pathogenesis'], category: 'Pathophysiology', categoryId: 'pathophysiology' },
  ];
  
  for (const mapping of categoryMap) {
    for (const keyword of mapping.keywords) {
      if (lowerTitle.includes(keyword) || lowerContent.includes(keyword)) {
        return { category: mapping.category, categoryId: mapping.categoryId };
      }
    }
  }
  
  return { category: 'General Nursing', categoryId: 'general-nursing' };
}

// Extract content from HTML
function extractContent(html: string): { title: string; content: string; images: string[] } {
  // Extract title
  let title = '';
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                     html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1]
      .replace(/&#038;/g, '&')
      .replace(/&#8211;/g, '-')
      .replace(/&#8217;/g, "'")
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // Extract main content - try multiple selectors
  let content = '';
  
  // Try elementor content first (most common)
  const elementorMatch = html.match(/<div[^>]*class="[^"]*elementor[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/i);
  if (elementorMatch) {
    content = elementorMatch[0];
  }
  
  // Try entry-content
  if (!content) {
    const entryMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/article|<\/main|<footer)/i);
    if (entryMatch) {
      content = entryMatch[1];
    }
  }
  
  // Try article content
  if (!content) {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = articleMatch[1];
    }
  }
  
  // Clean up content
  content = content
    .replace(/Skip to content/gi, '')
    .replace(/Home\s*Apps\s*Features/gi, '')
    .replace(/nursesrevisionuganda\.com/gi, '')
    .replace(/WhatsApp/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract images
  const images: string[] = [];
  const imgMatches = html.match(/https?:\/\/[^\s"'>]+\.(?:jpg|jpeg|png|gif|webp)/gi) || [];
  images.push(...new Set(imgMatches));
  
  return { title, content, images };
}

// Generate slug from filename
function generateSlug(filename: string): string {
  return filename
    .replace('.html', '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function processAllTopics() {
  console.log('Fetching file list from GitHub...');
  
  // Get list of HTML files from GitHub API
  const response = await fetch('https://api.github.com/repos/hamtechug256/nursing-notes/contents');
  const files = await response.json() as { name: string; download_url: string }[];
  
  const htmlFiles = files.filter(f => f.name.endsWith('.html'));
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  const topicsIndex: any[] = [];
  const categories: Record<string, { count: number; name: string }> = {};
  
  let processed = 0;
  
  for (const file of htmlFiles) {
    try {
      console.log(`Processing ${file.name}... (${processed + 1}/${htmlFiles.length})`);
      
      // Download HTML content
      const htmlResponse = await fetch(file.download_url);
      const html = await htmlResponse.text();
      
      // Extract content
      const { title, content, images } = extractContent(html);
      const { category, categoryId } = categorizeTopic(title || file.name, content);
      
      const slug = generateSlug(file.name);
      const wordCount = content.split(/\s+/).length;
      
      // Create topic object
      const topic = {
        id: slug,
        title: title || file.name.replace('.html', '').replace(/-/g, ' '),
        filename: file.name,
        category,
        description: content.substring(0, 200).replace(/<[^>]*>/g, '').trim(),
        wordCount,
        images,
        content
      };
      
      // Save individual topic file
      const topicFile = path.join(topicsDir, `${slug}.json`);
      fs.writeFileSync(topicFile, JSON.stringify(topic, null, 2));
      
      // Add to index (without full content)
      topicsIndex.push({
        id: slug,
        title: topic.title,
        filename: file.name,
        category,
        description: topic.description,
        wordCount,
        images
      });
      
      // Update category count
      if (!categories[categoryId]) {
        categories[categoryId] = { count: 0, name: category };
      }
      categories[categoryId].count++;
      
      processed++;
      
      // Rate limiting
      if (processed % 10 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    } catch (err) {
      console.error(`Error processing ${file.name}:`, err);
    }
  }
  
  // Save topics index
  const indexFile = path.join(dataDir, 'topics-index.json');
  fs.writeFileSync(indexFile, JSON.stringify(topicsIndex, null, 2));
  console.log(`Saved topics index with ${topicsIndex.length} topics`);
  
  // Save categories
  const categoriesList = Object.entries(categories).map(([id, data]) => ({
    id,
    name: data.name,
    count: data.count,
    description: `${data.name} topics`
  }));
  const categoriesFile = path.join(dataDir, 'categories.json');
  fs.writeFileSync(categoriesFile, JSON.stringify(categoriesList, null, 2));
  console.log(`Saved ${categoriesList.length} categories`);
  
  // Save summary
  const summary = {
    totalTopics: topicsIndex.length,
    totalImages: topicsIndex.reduce((sum, t) => sum + t.images.length, 0),
    downloadedImages: 0,
    categories: Object.fromEntries(Object.entries(categories).map(([id, d]) => [d.name, d.count])),
    processedAt: new Date().toISOString()
  };
  const summaryFile = path.join(dataDir, 'summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log('\nDone! Summary:');
  console.log(`- Total topics: ${topicsIndex.length}`);
  console.log(`- Categories: ${categoriesList.length}`);
}

processAllTopics().catch(console.error);
