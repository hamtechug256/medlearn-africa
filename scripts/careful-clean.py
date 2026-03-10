import json, os, re, math
from collections import defaultdict

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'
files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]

print(f'Loading {len(files)} files...')

def clean_desc(c):
    if not c: return ''
    c = re.sub(r'<[^>]+>', ' ', c)
    c = c.replace('&#038;','&').replace('&#8211;','-').replace('&#8217;',"'")
    c = re.sub(r'Home\s*Blog\s*About\s*Contact', '', c, flags=re.I)
    c = re.sub(r'Skip to content', '', c, flags=re.I)
    c = re.sub(r'\s+', ' ', c).strip()
    return c[:180].strip() + '...'

def word_count(c):
    if not c: return 0
    c = re.sub(r'<[^>]+>', ' ', c)
    return len([w for w in c.split() if len(w) > 1])

def get_content_fingerprint(content):
    """Get a fingerprint of the actual text content (not HTML structure)"""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', content or '')
    text = re.sub(r'\s+', ' ', text).strip().lower()
    # Get first meaningful content (skip headers/nav)
    # Find first substantive paragraph
    words = text.split()
    # Skip common header words
    skip_words = {'home', 'blog', 'about', 'contact', 'skip', 'content', 'navigation', 'menu'}
    start = 0
    for i, w in enumerate(words[:50]):
        if w not in skip_words:
            start = i
            break
    # Get fingerprint from next 50 words
    return ' '.join(words[start:start+50])

# Load all
topics = []
for f in files:
    with open(os.path.join(topics_dir, f)) as fp:
        t = json.load(fp)
    t['description'] = clean_desc(t.get('content',''))
    t['wordCount'] = word_count(t.get('content',''))
    t['_fingerprint'] = get_content_fingerprint(t.get('content',''))
    topics.append(t)

print(f'Loaded {len(topics)} topics')

# Group by fingerprint
by_fingerprint = defaultdict(list)
for t in topics:
    by_fingerprint[t['_fingerprint']].append(t)

# For each fingerprint group, keep the one with most content
unique = []
dups = 0
for fp, group in by_fingerprint.items():
    if len(group) > 1:
        # Keep highest word count
        group.sort(key=lambda x: x['wordCount'], reverse=True)
        unique.append(group[0])
        dups += len(group) - 1
        # Show what was removed
        for t in group[1:]:
            print(f'  Dupe: {t["title"]} (same as {group[0]["title"]})')
    else:
        unique.append(group[0])

print(f'\nRemoved {dups} true duplicates')
print(f'Kept {len(unique)} unique topics')

# Save topics
cats = {}
for t in unique:
    t.pop('_fingerprint', None)
    filepath = os.path.join(topics_dir, f'{t["id"]}.json')
    with open(filepath, 'w') as f:
        json.dump(t, f)
    cats[t['category']] = cats.get(t['category'], 0) + 1

# Build index
idx = [{'id': t['id'], 'title': t['title'], 'filename': t.get('filename',''), 
        'category': t['category'], 'description': t['description'], 
        'wordCount': t['wordCount'], 'images': t.get('images',[])} for t in unique]
idx.sort(key=lambda x: x['title'].lower())

with open(f'{data_dir}/topics-index.json', 'w') as f:
    json.dump(idx, f, indent=2)

# Categories
catlist = []
for name, count in sorted(cats.items()):
    cat_id = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    catlist.append({'id': cat_id, 'name': name, 'count': count, 'description': f'{name} topics'})

with open(f'{data_dir}/categories.json', 'w') as f:
    json.dump(catlist, f, indent=2)

# Summary
summary = {
    'totalTopics': len(idx),
    'totalImages': sum(len(t.get('images', [])) for t in idx),
    'downloadedImages': 2985,
    'categories': cats,
    'processedAt': '2026-03-08T23:00:00Z'
}
with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\n{len(catlist)} Categories:')
for c in catlist:
    print(f'  {c["name"]}: {c["count"]}')

print('\nFirst 15 topics:')
for t in idx[:15]:
    print(f'  {t["title"]} ({t["wordCount"]}w)')
