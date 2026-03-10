import json
import os
import re

DATA_DIR = '/home/z/my-project/data'
TOPICS_DIR = f'{DATA_DIR}/topics'

# Load progress
with open(f'{DATA_DIR}/progress.json') as f:
    progress = json.load(f)

topics = progress['topics']

# Sort by title
topics.sort(key=lambda x: x['title'].lower())

# Clean descriptions - remove HTML noise
for t in topics:
    desc = t['description']
    # Remove any remaining HTML
    desc = re.sub(r'<[^>]+>', '', desc)
    desc = re.sub(r'\s+', ' ', desc).strip()
    if len(desc) > 180:
        desc = desc[:180].rsplit(' ', 1)[0] + '...'
    t['description'] = desc

# Create category counts
category_counts = {}
for t in topics:
    cat = t['category']
    category_counts[cat] = category_counts.get(cat, 0) + 1

# Save topics index
with open(f'{DATA_DIR}/topics-index.json', 'w') as f:
    json.dump(topics, f, indent=2)

# Save categories
categories = []
for name, count in sorted(category_counts.items(), key=lambda x: -x[1]):
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')
    categories.append({
        'id': cat_id,
        'name': name,
        'count': count,
        'description': f'{name} educational topics for nurses'
    })

with open(f'{DATA_DIR}/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

# Save summary
summary = {
    'totalTopics': len(topics),
    'totalImages': sum(len(t['images']) for t in topics),
    'downloadedImages': 2985,
    'categories': category_counts,
    'processedAt': '2026-03-08T21:00:00.000Z'
}

with open(f'{DATA_DIR}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"Finalized {len(topics)} topics")
print(f"\nCategories:")
for c in categories:
    print(f"  {c['name']}: {c['count']}")
print(f"\nFirst 15 topics:")
for t in topics[:15]:
    print(f"  {t['title']}: {t['wordCount']}w - {t['description'][:50]}...")
