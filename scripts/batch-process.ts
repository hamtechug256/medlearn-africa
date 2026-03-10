// Batch processor - processes files in batches and saves progress
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const DATA_DIR = '/home/z/my-project/data';
const BATCH_SIZE = 50; // Process 50 files at a time

interface FileInfo {
  name: string;
  size: number;
  url: string;
}

interface Topic {
  id: string;
  title: string;
  filename: string;
  category: string;
  description: string;
  wordCount: number;
  images: string[];
}

// Category keywords
const categoryKeywords: Record<string, string[]> = {
  'Medical-Surgical Nursing': ['surgical', 'surgery', 'operation', 'preoperative', 'postoperative', 'wound', 'incision', 'suture', 'anesthesia', 'burns', 'trauma'],
  'Maternal & Child Health': ['maternal', 'pregnancy', 'prenatal', 'antenatal', 'postnatal', 'labor', 'delivery', 'birth', 'newborn', 'neonate', 'infant', 'breastfeeding', 'obstetric', 'midwife', 'abortion', 'reproductive'],
  'Mental Health Nursing': ['mental', 'psychiatric', 'psychology', 'depression', 'anxiety', 'schizophrenia', 'psychosis', 'therapy', 'counseling', 'behavioral', 'bipolar', 'autism', 'adhd'],
  'Community Health': ['community', 'public health', 'epidemiology', 'vaccination', 'immunization', 'health promotion', 'primary health care', 'cholera', 'malaria', 'hiv'],
  'Pharmacology': ['pharmacology', 'drug', 'medication', 'medicine', 'dose', 'dosage', 'prescription', 'antibiotic', 'analgesic', 'anticonvulsant', 'antidepressant'],
  'Anatomy & Physiology': ['anatomy', 'physiology', 'body system', 'organ', 'tissue', 'cell', 'muscle', 'bone', 'skeleton', 'nervous system', 'cardiovascular', 'respiratory', 'renal', 'lymphatic'],
  'Nursing Fundamentals': ['fundamental', 'basic nursing', 'nursing process', 'patient care', 'vital signs', 'hygiene', 'safety', 'infection control', 'assessment', 'catheterization'],
  'Research & Ethics': ['research', 'ethics', 'study', 'methodology', 'evidence-based', 'ethical', 'consent', 'confidentiality'],
  'Emergency Nursing': ['emergency', 'trauma', 'shock', 'resuscitation', 'first aid', 'critical care', 'icu'],
  'Pediatric Nursing': ['pediatric', 'child', 'children', 'infant', 'adolescent', 'childhood', 'young infant', 'sick child'],
  'Geriatric Nursing': ['geriatric', 'elderly', 'aging', 'older adult', 'gerontology', 'palliative'],
  'Nutrition & Dietetics': ['nutrition', 'diet', 'nutrient', 'vitamin', 'mineral', 'feeding'],
  'Microbiology & Infection': ['microbiology', 'bacteria', 'virus', 'infection', 'pathogen', 'sterilization', 'anthrax', 'brucellosis', 'chicken pox'],
  'Pathophysiology': ['pathophysiology', 'disease', 'disorder', 'pathology', 'illness', 'cancer', 'diabetes', 'hypertension', 'stroke'],
  'Business & Management': ['business', 'enterprise', 'entrepreneurship', 'management', 'planning']
};

function categorizeTopic(title: string): string {
  const text = title.toLowerCase().replace(/-/g, ' ');
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  return 'General Nursing';
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.html$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Nursing-Notes' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractContent(html: string): { content: string; images: string[] } {
  // Remove scripts and styles
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract body
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) content = bodyMatch[1];
  
  // Extract images
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && !match[1].startsWith('data:')) {
      images.push(match[1]);
    }
  }
  
  // Clean content
  content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  return { content, images };
}

async function processBatch(files: FileInfo[], startIdx: number): Promise<Topic[]> {
  const topics: Topic[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const idx = startIdx + i;
    process.stdout.write(`\rProcessing [${idx + 1}]: ${file.name.substring(0, 50).padEnd(50)}`);
    
    try {
      const html = await fetchUrl(file.url);
      const { content, images } = extractContent(html);
      const title = titleFromFilename(file.name);
      const words = content.split(/\s+/);
      
      topics.push({
        id: generateSlug(title) + '-' + idx,
        title,
        filename: file.name,
        category: categorizeTopic(title),
        description: words.slice(0, 40).join(' ') + (words.length > 40 ? '...' : ''),
        wordCount: words.length,
        images
      });
    } catch (err) {
      console.error(`\nFailed: ${file.name}`);
    }
  }
  
  return topics;
}

async function main() {
  // Load file list
  const fileList: FileInfo[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'file-list.json'), 'utf-8'));
  
  // Load existing progress
  let existingTopics: Topic[] = [];
  const topicsPath = path.join(DATA_DIR, 'topics-index.json');
  if (fs.existsSync(topicsPath)) {
    existingTopics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
  }
  
  const startFrom = existingTopics.length;
  const totalFiles = fileList.length;
  
  console.log(`📚 Total files: ${totalFiles}`);
  console.log(`✅ Already processed: ${startFrom}`);
  
  if (startFrom >= totalFiles) {
    console.log('\n✨ All files already processed!');
    return;
  }
  
  // Process remaining files
  const remaining = fileList.slice(startFrom);
  const toProcess = remaining.slice(0, BATCH_SIZE);
  
  console.log(`\n🔄 Processing batch of ${toProcess.length} files...\n`);
  
  const newTopics = await processBatch(toProcess, startFrom);
  const allTopics = [...existingTopics, ...newTopics];
  
  // Save progress
  fs.writeFileSync(topicsPath, JSON.stringify(allTopics, null, 2));
  
  // Generate categories
  const categoryStats: Record<string, number> = {};
  for (const topic of allTopics) {
    categoryStats[topic.category] = (categoryStats[topic.category] || 0) + 1;
  }
  
  const categories = Object.entries(categoryStats).map(([name, count]) => ({
    id: generateSlug(name),
    name,
    count,
    description: `Explore ${count} topics in ${name}`
  }));
  
  fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
  
  console.log(`\n\n✅ Processed ${newTopics.length} new topics`);
  console.log(`📊 Total topics: ${allTopics.length}`);
  console.log(`📁 Categories: ${categories.length}`);
  
  if (startFrom + BATCH_SIZE < totalFiles) {
    console.log(`\n⏳ Run again to process remaining ${totalFiles - startFrom - BATCH_SIZE} files`);
  } else {
    console.log('\n🎉 All files processed!');
  }
}

main().catch(console.error);
