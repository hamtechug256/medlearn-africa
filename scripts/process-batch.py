import json
import os
import re
import hashlib
import urllib.request
import ssl

DATA_DIR = '/home/z/my-project/data'
TOPICS_DIR = f'{DATA_DIR}/topics'
os.makedirs(TOPICS_DIR, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            return response.read().decode('utf-8', errors='ignore')
    except:
        return None

# Load existing progress
progress_file = f'{DATA_DIR}/progress.json'
if os.path.exists(progress_file):
    with open(progress_file) as f:
        progress = json.load(f)
    processed = set(progress.get('processed', []))
    topics = progress.get('topics', [])
    content_hashes = progress.get('hashes', {})
else:
    processed = set()
    topics = []
    content_hashes = {}

# Get file list
api_url = 'https://api.github.com/repos/hamtechug256/nursing-notes/contents'
req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
    files_data = json.loads(response.read().decode())

html_files = [f for f in files_data if f['name'].endswith('.html') and f['name'] not in processed]
print(f"Found {len(html_files)} files to process (already done: {len(processed)})")

# Process batch of 30
BATCH_SIZE = 30
batch = html_files[:BATCH_SIZE]

for file_info in batch:
    filename = file_info['name']
    download_url = file_info['download_url']
    
    print(f"Processing: {filename[:35]}...", end=' ')
    
    html = fetch_url(download_url)
    if not html:
        print("ERROR")
        processed.add(filename)
        continue
    
    # Extract title
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    if title_match:
        title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
        title = title.replace('&#038;', '&').replace('&#8211;', '-').replace('&#8217;', "'")
    else:
        title = filename.replace('.html', '').replace('-', ' ').title()
    
    # Check non-educational
    non_edu = ['about us', 'contact us', 'privacy policy', 'terms of service', 'disclaimer', 
               'home page', 'login', 'register']
    title_lower = title.lower()
    
    skip = False
    for kw in non_edu:
        if kw in title_lower:
            print(f"SKIP (non-edu: {kw})")
            skip = True
            break
    
    if skip:
        processed.add(filename)
        continue
    
    # Check weird ID
    clean = re.sub(r'[^a-zA-Z0-9]', '', title)
    if clean.isdigit() and len(clean) > 5:
        print("SKIP (numeric ID)")
        processed.add(filename)
        continue
    if len(clean) > 10 and clean.isupper():
        digits = sum(1 for c in clean if c.isdigit())
        letters = sum(1 for c in clean if c.isalpha())
        if digits > 2 and letters > 2:
            print("SKIP (weird ID)")
            processed.add(filename)
            continue
    
    # Extract text
    content = html
    entry_match = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*?)</div>\s*</article', html, re.DOTALL | re.IGNORECASE)
    if entry_match:
        content = entry_match.group(1)
    
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&#038;', '&').replace('&#8211;', '-').replace('&#8217;', "'")
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Check min length
    if len(text) < 200:
        print("SKIP (too short)")
        processed.add(filename)
        continue
    
    # Check duplicate
    content_hash = hashlib.md5(text.lower().encode()).hexdigest()[:16]
    if content_hash in content_hashes:
        print(f"SKIP (dup of {content_hashes[content_hash][:30]})")
        processed.add(filename)
        continue
    
    content_hashes[content_hash] = title
    
    # Count words
    word_count = len([w for w in text.split() if w])
    
    # Category
    text_lower = text.lower()
    category = 'General Nursing'
    if any(x in title_lower or x in text_lower[:500] for x in ['anatomy', 'physiology', 'body system']):
        category = 'Anatomy & Physiology'
    elif any(x in title_lower or x in text_lower[:500] for x in ['pharmacology', 'drug', 'medication']):
        category = 'Pharmacology'
    elif any(x in title_lower or x in text_lower[:500] for x in ['paediatric', 'pediatric', 'child', 'infant']):
        category = 'Pediatric Nursing'
    elif any(x in title_lower or x in text_lower[:500] for x in ['mental', 'psychiatric']):
        category = 'Mental Health Nursing'
    elif any(x in title_lower or x in text_lower[:500] for x in ['community', 'public health']):
        category = 'Community Health'
    elif any(x in title_lower or x in text_lower[:500] for x in ['maternal', 'pregnancy', 'antenatal']):
        category = 'Maternal & Child Health'
    elif any(x in title_lower or x in text_lower[:500] for x in ['surgical', 'surgery']):
        category = 'Medical-Surgical Nursing'
    elif any(x in title_lower or x in text_lower[:500] for x in ['emergency', 'trauma']):
        category = 'Emergency Nursing'
    elif any(x in title_lower or x in text_lower[:500] for x in ['research', 'ethics']):
        category = 'Research & Ethics'
    
    # Extract images
    images = list(set(re.findall(r'<img[^>]+src=["\']([^"\']+(?:jpg|jpeg|png|gif|webp))["\']', html, re.IGNORECASE)))
    images = [i for i in images if 'nursesrevision' in i or 'wp-content' in i]
    
    # Description
    desc = text[:180].strip() + ('...' if len(text) > 180 else '')
    
    # Slug
    slug = re.sub(r'[^a-z0-9]', '-', title.lower())
    slug = re.sub(r'-+', '-', slug).strip('-')
    if not slug:
        slug = filename.replace('.html', '').lower()
    
    # Save topic
    topic = {
        'id': slug, 'title': title, 'filename': filename,
        'category': category, 'description': desc,
        'wordCount': word_count, 'images': images, 'content': content
    }
    
    with open(f'{TOPICS_DIR}/{slug}.json', 'w', encoding='utf-8') as f:
        json.dump(topic, f, ensure_ascii=False, indent=2)
    
    topics.append({k:v for k,v in topic.items() if k != 'content'})
    processed.add(filename)
    print(f"OK ({word_count}w, {len(images)}img)")

# Save progress
with open(progress_file, 'w') as f:
    json.dump({'processed': list(processed), 'topics': topics, 'hashes': content_hashes}, f)

print(f"\nProgress: {len(topics)} topics, {len(processed)}/{len(html_files)+len(processed)} files")
print("Run again to process more files")
