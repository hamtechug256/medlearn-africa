import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const GITHUB_API_URL = 'https://api.github.com/repos/hamtechug256/nursing-notes/contents';
const RAW_CONTENT_BASE = 'https://raw.githubusercontent.com/hamtechug256/nursing-notes/master';
const DATA_DIR = '/home/z/my-project/data';
const IMAGES_DIR = '/home/z/my-project/public/images';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
}

interface ProcessedTopic {
  id: string;
  title: string;
  filename: string;
  category: string;
  content: string;
  rawHtml: string;
  images: string[];
  localImages: string[];
  wordCount: number;
  description: string;
}

// Category keywords mapping
const categoryKeywords: Record<string, string[]> = {
  'Medical-Surgical Nursing': ['surgical', 'surgery', 'operation', 'preoperative', 'postoperative', 'wound', 'incision', 'suture', 'anesthesia', 'surgical nursing'],
  'Maternal & Child Health': ['maternal', 'pregnancy', 'prenatal', 'antenatal', 'postnatal', 'labor', 'delivery', 'birth', 'newborn', 'neonate', 'infant', 'breastfeeding', 'obstetric', 'midwife', 'mother', 'child health'],
  'Mental Health Nursing': ['mental', 'psychiatric', 'psychology', 'depression', 'anxiety', 'schizophrenia', 'psychosis', 'therapy', 'counseling', 'behavioral', 'psych', 'suicide', 'substance abuse'],
  'Community Health': ['community', 'public health', 'epidemiology', 'vaccination', 'immunization', 'health promotion', 'primary health care', 'family health', 'environmental health'],
  'Pharmacology': ['pharmacology', 'drug', 'medication', 'medicine', 'dose', 'dosage', 'prescription', 'pharmaceutical', 'antibiotic', 'analgesic', 'pharmacokinetics'],
  'Anatomy & Physiology': ['anatomy', 'physiology', 'body system', 'organ', 'tissue', 'cell', 'muscle', 'bone', 'skeleton', 'nervous system', 'cardiovascular', 'respiratory', 'digestive', 'renal'],
  'Nursing Fundamentals': ['fundamental', 'basic nursing', 'nursing process', 'patient care', 'vital signs', 'hygiene', 'safety', 'infection control', 'documentation', 'assessment', 'nursing skill'],
  'Research & Ethics': ['research', 'ethics', 'study', 'methodology', 'evidence-based', 'ethical', 'consent', 'confidentiality', 'research method', 'nursing research'],
  'Emergency Nursing': ['emergency', 'trauma', 'shock', 'resuscitation', 'first aid', 'critical care', 'icu', 'emergency care', 'triage'],
  'Pediatric Nursing': ['pediatric', 'child', 'children', 'infant', 'adolescent', 'childhood', 'pediatric nursing', 'growth', 'development'],
  'Geriatric Nursing': ['geriatric', 'elderly', 'aging', 'older adult', 'gerontology', 'aged', 'senior'],
  'Nutrition & Dietetics': ['nutrition', 'diet', 'nutrient', 'vitamin', 'mineral', 'feeding', 'diet therapy', 'nutritional'],
  'Microbiology': ['microbiology', 'bacteria', 'virus', 'infection', 'pathogen', 'microorganism', 'sterilization', 'disinfection'],
  'Pathophysiology': ['pathophysiology', 'disease', 'disorder', 'pathology', 'illness', 'condition', 'signs and symptoms']
};

function categorizeTopic(title: string, content: string): string {
  const textToAnalyze = `${title} ${content}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'General Nursing';
}

function extractTitleFromHtml(html: string, filename: string): string {
  // Try to extract title from various HTML elements
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }
  
  // Fallback to filename
  return filename.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
}

function extractContentFromHtml(html: string): string {
  // Remove script and style tags
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Try to find main content area
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }
  
  // Remove common non-content elements
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
  
  // Get text content
  content = content.replace(/<[^>]+>/g, ' ');
  content = content.replace(/\s+/g, ' ').trim();
  
  return content;
}

function extractImagesFromHtml(html: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match = imgRegex.exec(html);
  
  while (match !== null) {
    const src = match[1];
    if (src && !src.startsWith('data:')) {
      images.push(src);
    }
    match = imgRegex.exec(html);
  }
  
  return images;
}

function generateDescription(content: string): string {
  const words = content.split(/\s+/).slice(0, 50);
  let desc = words.join(' ');
  if (desc.length > 200) {
    desc = desc.substring(0, 200) + '...';
  }
  return desc;
}

function fetchUrl(url: string): Promise<string> {
  return new Promise(function(resolve, reject) {
    const client = url.startsWith('https') ? https : http;
    const options: http.RequestOptions = {
      headers: {}
    };
    
    if (url.includes('api.github.com')) {
      options.headers = { 'User-Agent': 'Nursing-Notes-Processor' };
    }
    
    const req = client.get(url, options, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() { resolve(data); });
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

function downloadImage(url: string, outputPath: string): Promise<boolean> {
  return new Promise(function(resolve) {
    const client = url.startsWith('https') ? https : http;
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const file = fs.createWriteStream(outputPath);
    
    client.get(url, function(res) {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, outputPath).then(resolve);
          return;
        }
      }
      
      res.pipe(file);
      file.on('finish', function() {
        file.close();
        resolve(true);
      });
    }).on('error', function() {
      fs.unlink(outputPath, function() {});
      resolve(false);
    });
  });
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🚀 Starting content processing...\n');
  
  // Step 1: Fetch file list from GitHub
  console.log('📁 Fetching file list from GitHub...');
  let files: GitHubFile[];
  
  try {
    const response = await fetchUrl(GITHUB_API_URL);
    files = JSON.parse(response);
  } catch (error) {
    console.error('Failed to fetch file list:', error);
    process.exit(1);
  }
  
  // Filter HTML files
  const htmlFiles = files.filter(function(f) { return f.name.endsWith('.html'); });
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  // Step 2: Process each HTML file
  const topics: ProcessedTopic[] = [];
  const allImages = new Set<string>();
  let processed = 0;
  
  console.log('📄 Processing HTML files...');
  
  for (const file of htmlFiles) {
    processed++;
    process.stdout.write(`\rProcessing: ${processed}/${htmlFiles.length} - ${file.name.substring(0, 40).padEnd(40)}`);
    
    try {
      // Fetch HTML content
      const rawUrl = `${RAW_CONTENT_BASE}/${file.name}`;
      const html = await fetchUrl(rawUrl);
      
      // Extract information
      const title = extractTitleFromHtml(html, file.name);
      const content = extractContentFromHtml(html);
      const images = extractImagesFromHtml(html);
      const category = categorizeTopic(title, content);
      const description = generateDescription(content);
      const wordCount = content.split(/\s+/).length;
      
      // Collect images for download
      images.forEach(function(img) { allImages.add(img); });
      
      const topic: ProcessedTopic = {
        id: generateSlug(title),
        title: title,
        filename: file.name,
        category: category,
        content: content,
        rawHtml: html,
        images: images,
        localImages: [],
        wordCount: wordCount,
        description: description
      };
      
      topics.push(topic);
    } catch (error) {
      console.error(`\nFailed to process ${file.name}:`, error);
    }
  }
  
  console.log('\n\n✅ HTML processing complete!');
  
  // Step 3: Download images
  console.log(`\n🖼️  Downloading ${allImages.size} unique images...`);
  const imageMap = new Map<string, string>(); // original URL -> local path
  let downloaded = 0;
  let failed = 0;
  const imageArray = Array.from(allImages);
  
  for (const imageUrl of imageArray) {
    downloaded++;
    
    // Generate local filename
    let localFilename: string;
    try {
      const urlObj = new URL(imageUrl);
      localFilename = path.basename(urlObj.pathname);
      
      // Ensure unique filename
      if (!localFilename || localFilename.length < 3) {
        localFilename = `image-${downloaded}.png`;
      }
      
      // Handle duplicate filenames
      let counter = 1;
      let finalFilename = localFilename;
      while (fs.existsSync(path.join(IMAGES_DIR, finalFilename))) {
        const ext = path.extname(localFilename);
        const base = path.basename(localFilename, ext);
        finalFilename = `${base}-${counter}${ext}`;
        counter++;
      }
      
      const outputPath = path.join(IMAGES_DIR, finalFilename);
      
      // Resolve relative URLs
      let absoluteUrl = imageUrl;
      if (!imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          absoluteUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          absoluteUrl = `https://raw.githubusercontent.com${imageUrl}`;
        } else {
          absoluteUrl = `https://raw.githubusercontent.com/hamtechug256/nursing-notes/master/${imageUrl}`;
        }
      }
      
      const success = await downloadImage(absoluteUrl, outputPath);
      
      if (success) {
        imageMap.set(imageUrl, `/images/${finalFilename}`);
        process.stdout.write(`\rDownloaded: ${downloaded}/${imageArray.length}  Failed: ${failed}  `);
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }
  
  console.log(`\n\n✅ Image download complete! Downloaded: ${downloaded - failed}, Failed: ${failed}`);
  
  // Step 4: Update local image paths in topics
  console.log('\n📝 Updating image paths in content...');
  for (const topic of topics) {
    topic.localImages = topic.images.map(function(img) { return imageMap.get(img) || img; });
  }
  
  // Step 5: Generate category statistics
  const categoryStats: Record<string, number> = {};
  for (const topic of topics) {
    categoryStats[topic.category] = (categoryStats[topic.category] || 0) + 1;
  }
  
  // Step 6: Save processed data
  console.log('\n💾 Saving processed data...');
  
  // Save all topics
  fs.writeFileSync(
    path.join(DATA_DIR, 'topics.json'),
    JSON.stringify(topics, null, 2)
  );
  
  // Save category list
  const categories = Object.entries(categoryStats).map(function([name, count]) {
    return {
      id: generateSlug(name),
      name: name,
      count: count,
      description: `Explore ${count} topics in ${name}`
    };
  });
  
  fs.writeFileSync(
    path.join(DATA_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );
  
  // Save image mapping
  const imageMapObj: Record<string, string> = {};
  imageMap.forEach(function(value, key) {
    imageMapObj[key] = value;
  });
  
  fs.writeFileSync(
    path.join(DATA_DIR, 'images-map.json'),
    JSON.stringify(imageMapObj, null, 2)
  );
  
  // Save summary
  const summary = {
    totalTopics: topics.length,
    totalImages: allImages.size,
    downloadedImages: downloaded - failed,
    categories: categoryStats,
    processedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(DATA_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\n🎉 Processing complete!');
  console.log('\n📊 Summary:');
  console.log(`   Total Topics: ${topics.length}`);
  console.log(`   Total Images: ${allImages.size}`);
  console.log(`   Categories: ${Object.keys(categoryStats).length}`);
  console.log('\n📁 Data saved to:');
  console.log(`   ${DATA_DIR}/topics.json`);
  console.log(`   ${DATA_DIR}/categories.json`);
  console.log(`   ${DATA_DIR}/summary.json`);
  console.log(`   ${IMAGES_DIR}/ (images)`);
}

main().catch(console.error);
