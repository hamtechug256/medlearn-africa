import fs from 'fs';
import path from 'path';
import https from 'https';

const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');

// Topics to fetch from nursesrevisionuganda.com
const topicsToFetch = [
  'abortions', 'hypertension', 'diabetes-mellitus', 'pneumonia', 'meningitis',
  'burns', 'malaria', 'tuberculosis', 'hiv-aids', 'peptic-ulcer-disease',
  'heart-failure', 'asthma', 'chronic-obstructive-pulmonary-disease',
  'renal-failure', 'liver-cirrhosis', 'anemia', 'leukemia', 'epilepsy',
  'stroke', 'parkinsons-disease', 'rheumatoid-arthritis', 'osteoporosis',
  'fractures', 'wound-healing', 'infection-control', 'vital-signs',
  'administration-of-medicine', 'patient-assessment', 'nursing-process',
  'communication-in-nursing', 'medical-asepsis', 'surgical-asepsis',
  'oxygen-therapy', 'catheterization', 'intravenous-therapy', 'blood-transfusion',
  'pain-management', 'palliative-care', 'end-of-life-care', 'mental-health-nursing',
  'psychiatric-nursing', 'substance-abuse', 'depression', 'anxiety-disorders',
  'schizophrenia', 'bipolar-disorder', 'eating-disorders', 'personality-disorders',
  'child-health-nursing', 'immunization', 'nutrition-in-children', 'common-childhood-illnesses',
  'maternal-health', 'antenatal-care', 'intranatal-care', 'postnatal-care',
  'family-planning', 'antenatal-care', 'labour-and-delivery', 'puerperium',
  'breastfeeding', 'neonatal-care', 'community-health-nursing', 'epidemiology',
  'health-education', 'environmental-health', 'occupational-health',
  'first-aid', 'emergency-nursing', 'trauma-care', 'disaster-nursing',
  'pharmacology-basics', 'drug-administration', 'antibiotics', 'analgesics',
  'antidiabetics', 'antihypertensives', 'anticoagulants', 'diuretics',
  'anatomy-physiology-introduction', 'cell-structure', 'tissues', 'integumentary-system',
  'skeletal-system', 'muscular-system', 'nervous-system', 'endocrine-system',
  'cardiovascular-system', 'respiratory-system', 'digestive-system', 'urinary-system',
  'reproductive-system', 'lymphatic-system', 'immune-system',
  'microbiology', 'pathogens', 'infection-process', 'immunology',
  'nursing-ethics', 'professional-conduct', 'patients-rights', 'confidentiality',
  'research-methods', 'evidence-based-practice', 'biostatistics',
  'leadership-management', 'quality-improvement', 'health-policy'
];

// Fetch content from URL
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Extract content from HTML
function extractContent(html: string, slug: string): any {
  // Get title
  const titleMatch = html.match(/<h1[^>]*class="entry-title[^"]*"[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : slug;

  // Get category
  const categoryMatch = html.match(/category-([a-z-]+)/i);
  const category = categoryMatch ? categoryMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General Nursing';

  // Get entry content
  const contentMatch = html.match(/<div[^>]*class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
  let content = contentMatch ? contentMatch[1] : '';

  // Clean up
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  // Get images
  const images: string[] = [];
  const imgRegex = /<img[^>]*src="([^"]+)"/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    if (imgMatch[1].includes('nursesrevisionuganda.com') && !imgMatch[1].includes('pupo-e167')) {
      images.push(imgMatch[1]);
    }
  }

  // Get word count
  const textOnly = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textOnly.split(/\s+/).filter(w => w.length > 0).length;

  // Get description
  const description = textOnly.substring(0, 200) + (textOnly.length > 200 ? '...' : '');

  return { title, category, content, images, wordCount, description };
}

async function main() {
  console.log('Fetching topics from nursesrevisionuganda.com...\n');

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < topicsToFetch.length; i++) {
    const slug = topicsToFetch[i];
    const filePath = path.join(topicsDir, `${slug}.json`);

    // Skip if already exists with content
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (existing.content && existing.content.length > 500) {
          console.log(`[${i + 1}/${topicsToFetch.length}] ✓ ${slug} (already exists)`);
          skipped++;
          continue;
        }
      } catch {}
    }

    console.log(`[${i + 1}/${topicsToFetch.length}] Fetching ${slug}...`);

    try {
      const url = `https://nursesrevisionuganda.com/${slug}/`;
      const html = await fetchUrl(url);

      if (html.includes('404') || html.includes('Page not found') || html.length < 1000) {
        console.log(`  ✗ Not found`);
        failed++;
        continue;
      }

      const topic = extractContent(html, slug);

      if (topic.content.length < 300) {
        console.log(`  ✗ Content too short`);
        failed++;
        continue;
      }

      // Save topic
      const topicData = {
        id: slug,
        title: topic.title,
        filename: `${slug}.html`,
        category: topic.category,
        description: topic.description,
        wordCount: topic.wordCount,
        images: topic.images,
        content: `<div class="topic-body">${topic.content}</div>`,
        rawHtml: html
      };

      fs.writeFileSync(filePath, JSON.stringify(topicData, null, 2));
      console.log(`  ✓ Saved (${topic.wordCount} words, ${topic.images.length} images)`);
      added++;

      // Wait a bit to be nice to the server
      await new Promise(r => setTimeout(r, 500));

    } catch (err: any) {
      console.log(`  ✗ Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done! ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
