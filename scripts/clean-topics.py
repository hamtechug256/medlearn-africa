import json
import os
import re

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

# Load topics index
with open(f'{data_dir}/topics-index.json', 'r') as f:
    topics = json.load(f)

# Topics to remove - truly non-educational only
remove_keywords = [
    'about us', 'contact us', 'privacy policy', 'terms of service',
    'disclaimer', 'home page', 'login', 'register', 'signup'
]

def is_weird_id(title):
    """Check if title is a weird ID like 42WAO7EWP3HTA1 or 256726113908"""
    clean = title.replace(' ', '').replace('-', '').replace('_', '')
    # All digits
    if clean.isdigit() and len(clean) > 5:
        return True
    # Mixed weird patterns like 42WAO7EWP3HTA1
    if len(clean) > 10:
        has_digits = sum(1 for c in clean if c.isdigit())
        has_letters = sum(1 for c in clean if c.isalpha())
        if has_digits > 2 and has_letters > 2 and has_digits + has_letters == len(clean):
            # Check if it's mostly uppercase with some digits (weird ID pattern)
            if clean.upper() == clean:
                return True
    return False

to_remove = []
to_keep = []

for t in topics:
    title_lower = t['title'].lower().strip()
    
    should_remove = False
    
    # Check keywords
    for kw in remove_keywords:
        if kw in title_lower:
            should_remove = True
            break
    
    # Check weird IDs
    if is_weird_id(t['title']):
        should_remove = True
    
    if should_remove:
        to_remove.append(t)
    else:
        to_keep.append(t)

print(f'Removing {len(to_remove)} non-educational pages:')
for t in to_remove:
    print(f'  - {t["title"]}')
    # Delete the topic file
    topic_file = f'{topics_dir}/{t["id"]}.json'
    if os.path.exists(topic_file):
        os.remove(topic_file)
        print(f'    Deleted: {t["id"]}.json')

# Save cleaned index
with open(f'{data_dir}/topics-index.json', 'w') as f:
    json.dump(to_keep, f, indent=2)

# Update categories
category_counts = {}
for t in to_keep:
    cat = t['category']
    category_counts[cat] = category_counts.get(cat, 0) + 1

categories = []
for name, count in category_counts.items():
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower())
    cat_id = re.sub(r'-+', '-', cat_id).strip('-')
    categories.append({
        'id': cat_id,
        'name': name,
        'count': count,
        'description': f'{name} topics'
    })

with open(f'{data_dir}/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

# Update summary
summary = {
    'totalTopics': len(to_keep),
    'totalImages': sum(len(t.get('images', [])) for t in to_keep),
    'downloadedImages': 2985,
    'categories': category_counts,
    'processedAt': '2026-03-08T16:00:00.000Z'
}

with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\nKept {len(to_keep)} educational topics')
print(f'Categories: {len(categories)}')
