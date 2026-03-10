import fs from 'fs';
import path from 'path';

const GITHUB_RAW = 'https://raw.githubusercontent.com/hamtechug256/nursing-notes/main/';
const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');

if (!fs.existsSync(topicsDir)) fs.mkdirSync(topicsDir, { recursive: true });

// Get file list
const listRes = await fetch('https://api.github.com/repos/hamtechug256/nursing-notes/contents');
const files = (await listRes.json()).filter(f => f.name.endsWith('.html'));
console.log(`Found ${files.length} HTML files`);

const topicsIndex = [];
const categoryCounts = {};

// Process files
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const slug = file.name.replace('.html', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  try {
    // Download
    const res = await fetch(file.download_url);
    const html = await res.text();
    
    // Extract title
    let title = file.name.replace('.html', '').replace(/-/g, ' ');
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]*>/g, '').replace(/&#038;/g, '&').trim();
    }
    
    // Extract main content - look for elementor or entry-content
    let content = '';
    const contentMatch = html.match(/<div[^>]*class="[^"]*elementor[^"]*"[^>]*>([\s\S]+?)<\/section>\s*<\/div>\s*<\/div>/i);
    if (contentMatch) content = contentMatch[0];
    
    if (!content) {
      const entryMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]+?)<\/div>/i);
      if (entryMatch) content = entryMatch[1];
    }
    
    // Clean content
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    
    // Extract images
    const images = [...new Set(html.match(/https?:\/\/[^\s"'>]+\.(?:jpg|jpeg|png|gif|webp)/gi) || [])];
    
    // Categorize
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    let category = 'General Nursing';
    
    if (lowerTitle.includes('anatomy') || lowerContent.includes('physiology')) category = 'Anatomy & Physiology';
    else if (lowerTitle.includes('pharmacology') || lowerTitle.includes('drug')) category = 'Pharmacology';
    else if (lowerTitle.includes('paediatric') || lowerTitle.includes('child') || lowerTitle.includes('infant')) category = 'Pediatric Nursing';
    else if (lowerTitle.includes('mental') || lowerTitle.includes('psychiatric')) category = 'Mental Health Nursing';
    else if (lowerTitle.includes('community') || lowerTitle.includes('public health')) category = 'Community Health';
    else if (lowerTitle.includes('maternal') || lowerTitle.includes('pregnancy') || lowerTitle.includes('antenatal')) category = 'Maternal & Child Health';
    else if (lowerTitle.includes('surgical') || lowerTitle.includes('surgery')) category = 'Medical-Surgical Nursing';
    
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const description = content.replace(/<[^>]*>/g, '').substring(0, 200).trim();
    
    // Save topic file
    fs.writeFileSync(path.join(topicsDir, `${slug}.json`), JSON.stringify({
      id: slug, title, filename: file.name, category, description, wordCount, images, content
    }));
    
    topicsIndex.push({ id: slug, title, filename: file.name, category, description, wordCount, images });
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    if ((i + 1) % 50 === 0) console.log(`Processed ${i + 1}/${files.length}`);
  } catch (err) {
    console.error(`Error: ${file.name}`);
  }
}

// Save index
fs.writeFileSync(path.join(dataDir, 'topics-index.json'), JSON.stringify(topicsIndex, null, 2));

// Save categories
const categories = Object.entries(categoryCounts).map(([name, count]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name, count: count,
  description: `${name} topics`
}));
fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));

// Save summary
fs.writeFileSync(path.join(dataDir, 'summary.json'), JSON.stringify({
  totalTopics: topicsIndex.length,
  totalImages: topicsIndex.reduce((s, t) => s + t.images.length, 0),
  downloadedImages: 0,
  categories: categoryCounts,
  processedAt: new Date().toISOString()
}, null, 2));

console.log(`Done! ${topicsIndex.length} topics processed`);
