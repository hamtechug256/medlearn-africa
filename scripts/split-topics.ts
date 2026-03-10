import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const topicsFile = path.join(dataDir, 'topics.json');
const topicsDir = path.join(dataDir, 'topics');

// Ensure topics directory exists
if (!fs.existsSync(topicsDir)) {
  fs.mkdirSync(topicsDir, { recursive: true });
}

// Read the large topics file
console.log('Reading topics.json...');
const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf-8'));

console.log(`Found ${topics.length} topics`);

// Write each topic to its own file
let count = 0;
for (const topic of topics) {
  const slug = topic.id.replace(/-\d+$/, '');
  const topicFile = path.join(topicsDir, `${slug}.json`);
  
  // Only write if doesn't exist (avoid overwriting)
  if (!fs.existsSync(topicFile)) {
    fs.writeFileSync(topicFile, JSON.stringify(topic, null, 2));
    count++;
  }
  
  if (count % 50 === 0) {
    console.log(`Processed ${count} topics...`);
  }
}

console.log(`Done! Wrote ${count} individual topic files.`);
