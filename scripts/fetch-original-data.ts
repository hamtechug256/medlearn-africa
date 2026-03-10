import fs from 'fs';
import path from 'path';
import https from 'https';

const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');
const rawDir = path.join(dataDir, 'raw-html');

// Ensure directories exist
if (!fs.existsSync(topicsDir)) {
  fs.mkdirSync(topicsDir, { recursive: true });
}
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

// Fetch file from URL
async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching file list from GitHub...');
  
  // Get the list of HTML files from the GitHub API
  const apiUrl = 'https://api.github.com/repos/hamtechug256/nursing-notes/contents';
  
  const data = await fetchUrl(apiUrl + '?per_page=100');
  const files = JSON.parse(data);
  
  const htmlFiles = files.filter((f: any) => f.name.endsWith('.html'));
  console.log(`Found ${htmlFiles.length} HTML files on GitHub`);
  
  // Download each HTML file
  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const filePath = path.join(rawDir, file.name);
    
    if (fs.existsSync(filePath)) {
      console.log(`[${i + 1}/${htmlFiles.length}] Already have ${file.name}`);
      continue;
    }
    
    console.log(`[${i + 1}/${htmlFiles.length}] Downloading ${file.name}...`);
    
    try {
      const html = await fetchUrl(file.download_url);
      fs.writeFileSync(filePath, html);
    } catch (err) {
      console.error(`  Failed: ${err}`);
    }
  }
  
  console.log('\nDone downloading!');
}

main().catch(console.error);
