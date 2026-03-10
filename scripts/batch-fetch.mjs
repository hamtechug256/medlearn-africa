import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');
const indexFile = path.join(dataDir, 'topics-index.json');

if (!fs.existsSync(topicsDir)) fs.mkdirSync(topicsDir, { recursive: true });

// Get file list
console.log('Fetching file list...');
const listRes = await fetch('https://api.github.com/repos/hamtechug256/nursing-notes/contents');
const files = (await listRes.json()).filter(f => f.name.endsWith('.html'));
console.log(`Found ${files.length} HTML files`);

// Check progress
let topicsIndex = [];
if (fs.existsSync(indexFile)) {
  topicsIndex = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  console.log(`Resuming from ${topicsIndex.length} topics`);
}

const processedIds = new Set(topicsIndex.map(t => t.id));
const toProcess = files.filter(f => {
  const slug = f.name.replace('.html', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  return !processedIds.has(slug);
});

console.log(`${toProcess.length} files remaining`);

// Process only 50 files at a time
const batch = toProcess.slice(0, 50);
const categoryCounts = {};

for (let i = 0; i < batch.length; i++) {
  const file = batch[i];
  const slug = file.name.replace('.html', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  try {
    const res = await fetch(file.download_url);
    const html = await res.text();
    
    let title = file.name.replace('.html', '').replace(/-/g, ' ');
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) title = titleMatch[1].replace(/<[^>]*>/g, '').replace(/&#038;/g, '&').trim();
    
    let content = '';
    const contentMatch = html.match(/<div[^>]*class="[^"]*elementor[^"]*"[^>]*>([\s\S]+?)<\/section>\s*<\/div>\s*<\/div>/i);
    if (contentMatch) content = contentMatch[0];
    if (!content) {
      const entryMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]+?)<\/div>/i);
      if (entryMatch) content = entryMatch[1];
    }
    
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
    
    const images = [...new Set(html.match(/https?:\/\/[^\s"'>]+\.(?:jpg|jpeg|png|gif|webp)/gi) || [])];
    
    const lowerTitle = title.toLowerCase();
    let category = 'General Nursing';
    if (lowerTitle.includes('anatomy')) category = 'Anatomy & Physiology';
    else if (lowerTitle.includes('pharmacology') || lowerTitle.includes('drug')) category = 'Pharmacology';
    else if (lowerTitle.includes('paediatric') || lowerTitle.includes('child')) category = 'Pediatric Nursing';
    else if (lowerTitle.includes('mental') || lowerTitle.includes('psychiatric')) category = 'Mental Health Nursing';
    else if (lowerTitle.includes('community')) category = 'Community Health';
    else if (lowerTitle.includes('maternal') || lowerTitle.includes('pregnancy')) category = 'Maternal & Child Health';
    else if (lowerTitle.includes('surgical')) category = 'Medical-Surgical Nursing';
    
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const description = content.replace(/<[^>]*>/g, '').substring(0, 200).trim();
    
    fs.writeFileSync(path.join(topicsDir, `${slug}.json`), JSON.stringify({id: slug, title, filename: file.name, category, description, wordCount, images, content}));
    
    topicsIndex.push({id: slug, title, filename: file.name, category, description, wordCount, images});
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    console.log(`${i+1}/${batch.length}: ${title.substring(0, 40)}`);
  } catch (e) {
    console.error(`Error: ${file.name}`);
  }
}

fs.writeFileSync(indexFile, JSON.stringify(topicsIndex, null, 2));
console.log(`Progress: ${topicsIndex.length}/${files.length} topics`);
console.log(`Run again to process remaining ${files.length - topicsIndex.length} files`);
