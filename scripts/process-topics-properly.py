import json
import os
import re
import hashlib
import urllib.request
import ssl

# Directories
DATA_DIR = '/home/z/my-project/data'
TOPICS_DIR = f'{DATA_DIR}/topics'

# Create topics directory
os.makedirs(TOPICS_DIR, exist_ok=True)

# SSL context for HTTPS
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_url(url):
    """Fetch URL content"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None

def extract_title(html, filename):
    """Extract title from HTML"""
    # Try h1 first
    match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    if match:
        title = re.sub(r'<[^>]+>', '', match.group(1)).strip()
        title = title.replace('&#038;', '&').replace('&#8211;', '-').replace('&#8217;', "'")
        if title and len(title) > 2:
            return title
    
    # Fallback to filename
    return filename.replace('.html', '').replace('-', ' ').title()

def extract_content_text(html):
    """Extract clean text content from HTML"""
    if not html:
        return '', ''
    
    # Try to find entry-content div (main article)
    content = html
    entry_match = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*?)</div>\s*</article', html, re.DOTALL | re.IGNORECASE)
    if entry_match:
        content = entry_match.group(1)
    
    # Or find elementor content
    if len(content) < 100:
        elementor_match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL | re.IGNORECASE)
        if elementor_match:
            content = elementor_match.group(1)
    
    # Extract clean text for description
    text = content
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&#038;', '&').replace('&#8211;', '-').replace('&#8217;', "'")
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = re.sub(r'\s+', ' ', text).strip()
    
    return content, text

def is_educational_content(title, text):
    """Check if content is actually educational"""
    title_lower = title.lower()
    text_lower = text.lower()
    
    # Non-educational keywords in title
    non_edu_titles = [
        'about us', 'contact us', 'privacy policy', 'terms of service',
        'disclaimer', 'login', 'register', 'subscribe', 'subscription'
    ]
    
    for kw in non_edu_titles:
        if kw in title_lower:
            return False
    
    # Check if it's a weird ID (all numbers/random chars)
    clean_title = re.sub(r'[^a-zA-Z0-9]', '', title)
    if clean_title.isdigit() and len(clean_title) > 5:
        return False
    if len(clean_title) > 10 and clean_title.upper() == clean_title:
        # Check if it looks like a random ID
        digits = sum(1 for c in clean_title if c.isdigit())
        if digits > 2 and digits < len(clean_title) - 2:
            return False
    
    # Must have substantial content
    if len(text) < 200:
        return False
    
    return True

def categorize_topic(title, text):
    """Categorize topic based on content"""
    title_lower = title.lower()
    text_lower = text.lower()
    
    categories = [
        (['anatomy', 'physiology', 'body system', 'organs of'], 'Anatomy & Physiology'),
        (['pharmacology', 'drug', 'medication', 'dosage', 'injection'], 'Pharmacology'),
        (['paediatric', 'pediatric', 'child', 'infant', 'newborn', 'children'], 'Pediatric Nursing'),
        (['mental', 'psychiatric', 'psychology', 'depression', 'schizophrenia'], 'Mental Health Nursing'),
        (['community', 'public health', 'epidemiology'], 'Community Health'),
        (['maternal', 'pregnancy', 'antenatal', 'postnatal', 'delivery', 'labour', 'obstetric'], 'Maternal & Child Health'),
        (['surgical', 'surgery', 'operation', 'preoperative', 'postoperative'], 'Medical-Surgical Nursing'),
        (['emergency', 'trauma', 'resuscitation', 'first aid'], 'Emergency Nursing'),
        (['research', 'ethics', 'methodology', 'study'], 'Research & Ethics'),
        (['microbiology', 'bacteria', 'virus', 'infection control'], 'Microbiology'),
        (['nutrition', 'diet', 'feeding', 'malnutrition'], 'Nutrition & Dietetics'),
        (['nursing process', 'fundamentals', 'vital signs'], 'Nursing Fundamentals'),
        (['pathophysiology', 'disease process'], 'Pathophysiology'),
    ]
    
    for keywords, category in categories:
        for kw in keywords:
            if kw in title_lower or kw in text_lower[:500]:
                return category
    
    return 'General Nursing'

def count_words(text):
    """Count actual words"""
    words = [w for w in text.split() if len(w) > 0]
    return len(words)

def extract_images(html):
    """Extract image URLs"""
    images = []
    # Find all img src
    for match in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE):
        url = match.group(1)
        if 'nursesrevisionuganda.com' in url or 'wp-content' in url:
            images.append(url)
    return list(set(images))

def get_content_hash(content):
    """Get hash of content for duplicate detection"""
    # Normalize content for comparison
    normalized = re.sub(r'\s+', ' ', content.lower())
    return hashlib.md5(normalized.encode()).hexdigest()

# Main processing
print("=" * 60)
print("PROCESSING NURSING TOPICS PROPERLY")
print("=" * 60)

# Get file list from GitHub
print("\n1. Fetching file list from GitHub...")
api_url = 'https://api.github.com/repos/hamtechug256/nursing-notes/contents'

try:
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
        files_data = json.loads(response.read().decode())
except Exception as e:
    print(f"Error fetching file list: {e}")
    exit(1)

html_files = [f for f in files_data if f['name'].endswith('.html')]
print(f"   Found {len(html_files)} HTML files")

# Process each file
print("\n2. Processing files...")
topics = []
content_hashes = {}  # For duplicate detection
skipped_non_edu = []
skipped_duplicates = []

for i, file_info in enumerate(html_files):
    filename = file_info['name']
    download_url = file_info['download_url']
    
    print(f"   [{i+1}/{len(html_files)}] {filename[:40]}...", end=' ')
    
    # Fetch HTML
    html = fetch_url(download_url)
    if not html:
        print("SKIP (fetch error)")
        continue
    
    # Extract content
    content, text = extract_content_text(html)
    title = extract_title(html, filename)
    
    # Check if educational
    if not is_educational_content(title, text):
        skipped_non_edu.append(title)
        print("SKIP (non-educational)")
        continue
    
    # Check for duplicates by comparing content hash
    content_hash = get_content_hash(text)
    if content_hash in content_hashes:
        skipped_duplicates.append(f"{title} (duplicate of {content_hashes[content_hash]})")
        print("SKIP (duplicate)")
        continue
    content_hashes[content_hash] = title
    
    # Extract other info
    word_count = count_words(text)
    images = extract_images(html)
    category = categorize_topic(title, text)
    
    # Create clean description
    desc = text[:150].strip()
    if len(text) > 150:
        desc += '...'
    
    # Generate slug
    slug = re.sub(r'[^a-z0-9]', '-', title.lower())
    slug = re.sub(r'-+', '-', slug).strip('-')
    if not slug:
        slug = re.sub(r'[^a-z0-9]', '-', filename.lower())
        slug = re.sub(r'-+', '-', slug.replace('.html', '')).strip('-')
    
    # Create topic object
    topic = {
        'id': slug,
        'title': title,
        'filename': filename,
        'category': category,
        'description': desc,
        'wordCount': word_count,
        'images': images,
        'content': content
    }
    
    # Save to individual file
    topic_file = os.path.join(TOPICS_DIR, f'{slug}.json')
    with open(topic_file, 'w', encoding='utf-8') as f:
        json.dump(topic, f, ensure_ascii=False, indent=2)
    
    # Add to index (without full content)
    topics.append({
        'id': slug,
        'title': title,
        'filename': filename,
        'category': category,
        'description': desc,
        'wordCount': word_count,
        'images': images
    })
    
    print(f"OK ({word_count} words)")

# Sort topics by title
topics.sort(key=lambda x: x['title'].lower())

# Save index
print("\n3. Saving index...")
with open(f'{DATA_DIR}/topics-index.json', 'w', encoding='utf-8') as f:
    json.dump(topics, f, ensure_ascii=False, indent=2)

# Create categories
print("4. Creating categories...")
category_counts = {}
for t in topics:
    cat = t['category']
    category_counts[cat] = category_counts.get(cat, 0) + 1

categories = []
for name, count in sorted(category_counts.items()):
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')
    categories.append({
        'id': cat_id,
        'name': name,
        'count': count,
        'description': f'{name} educational topics for nurses'
    })

with open(f'{DATA_DIR}/categories.json', 'w', encoding='utf-8') as f:
    json.dump(categories, f, ensure_ascii=False, indent=2)

# Create summary
print("5. Creating summary...")
summary = {
    'totalTopics': len(topics),
    'totalImages': sum(len(t['images']) for t in topics),
    'downloadedImages': 2985,
    'categories': category_counts,
    'processedAt': '2026-03-08T20:00:00.000Z'
}

with open(f'{DATA_DIR}/summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

# Print summary
print("\n" + "=" * 60)
print("PROCESSING COMPLETE")
print("=" * 60)
print(f"\nTotal topics saved: {len(topics)}")
print(f"\nSkipped (non-educational): {len(skipped_non_edu)}")
for s in skipped_non_edu[:10]:
    print(f"   - {s}")

print(f"\nSkipped (duplicates): {len(skipped_duplicates)}")
for s in skipped_duplicates[:10]:
    print(f"   - {s}")

print(f"\nCategories:")
for cat in sorted(categories, key=lambda x: -x['count']):
    print(f"   {cat['name']}: {cat['count']} topics")

print(f"\nFirst 10 topics:")
for t in topics[:10]:
    print(f"   {t['title']} ({t['wordCount']} words)")
