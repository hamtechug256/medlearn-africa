import json
import os
import re

DATA_DIR = '/home/z/my-project/data'
TOPICS_DIR = f'{DATA_DIR}/topics'

# Load topics index
with open(f'{DATA_DIR}/topics-index.json') as f:
    topics = json.load(f)

# Remove weird topics
weird_ids = []
clean_topics = []

for t in topics:
    title = t['title']
    # Check if it's a weird ID-like title
    clean_title = re.sub(r'[^a-zA-Z0-9]', '', title)
    
    # Skip if title is mostly random chars
    if len(clean_title) > 5:
        digits = sum(1 for c in clean_title if c.isdigit())
        letters = sum(1 for c in clean_title if c.isalpha())
        
        if digits > 2 and letters > 0 and digits + letters == len(clean_title):
            # Mixed alphanumeric - likely an ID
            if clean_title.upper() == clean_title:
                print(f"Removing weird ID: {title}")
                weird_ids.append(t['id'])
                continue
    
    # Clean description
    desc = t['description']
    desc = re.sub(r'Share on WhatsApp.*?content', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'Skip to content.*?Home', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'Home\s*Apps\s*Features', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'nursesrevisionuganda\.com', '', desc)
    desc = re.sub(r'\s+', ' ', desc).strip()
    
    if len(desc) > 200:
        desc = desc[:200].rsplit(' ', 1)[0] + '...'
    
    t['description'] = desc
    clean_topics.append(t)

# Update index
with open(f'{DATA_DIR}/topics-index.json', 'w') as f:
    json.dump(clean_topics, f, indent=2)

# Remove weird topic files
for wid in weird_ids:
    filepath = f'{TOPICS_DIR}/{wid}.json'
    if os.path.exists(filepath):
        os.remove(filepath)
        print(f"Deleted: {wid}.json")

# Update categories
category_counts = {}
for t in clean_topics:
    cat = t['category']
    category_counts[cat] = category_counts.get(cat, 0) + 1

categories = []
for name, count in sorted(category_counts.items(), key=lambda x: -x[1]):
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')
    categories.append({'id': cat_id, 'name': name, 'count': count})

with open(f'{DATA_DIR}/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

# Update summary
summary = {
    'totalTopics': len(clean_topics),
    'totalImages': sum(len(t['images']) for t in clean_topics),
    'downloadedImages': 2985,
    'categories': category_counts,
    'processedAt': '2026-03-08T21:30:00.000Z'
}

with open(f'{DATA_DIR}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\nFinal: {len(clean_topics)} topics")
print("\nCategories:")
for c in categories:
    print(f"  {c['name']}: {c['count']}")
print("\nFirst 15 topics:")
for t in clean_topics[:15]:
    print(f"  {t['title']}: {t['wordCount']}w")
