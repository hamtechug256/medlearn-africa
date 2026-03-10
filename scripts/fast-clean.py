import json, os, re
from collections import defaultdict

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'
files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]

print(f'Processing {len(files)} files...')

def clean_desc(c):
    if not c: return ''
    c = re.sub(r'<[^>]+>', ' ', c)
    c = re.sub(r'Home\s*Blog\s*About\s*Contact', '', c, flags=re.I)
    c = re.sub(r'Skip to content', '', c, flags=re.I)
    c = re.sub(r'\s+', ' ', c).strip()
    return c[:150].strip() + '...'

def word_count(c):
    if not c: return 0
    c = re.sub(r'<[^>]+>', ' ', c)
    return len([w for w in c.split() if len(w) > 1])

# Load and clean
topics = []
for f in files:
    with open(os.path.join(topics_dir, f)) as fp:
        t = json.load(fp)
    t['description'] = clean_desc(t.get('content',''))
    t['wordCount'] = word_count(t.get('content',''))
    topics.append(t)

# Remove only EXACT duplicates (same content)
seen_content = {}
unique = []
for t in topics:
    content_hash = hash(t.get('content','')[:500])  # Quick hash of first 500 chars
    if content_hash in seen_content:
        if t['wordCount'] > seen_content[content_hash]['wordCount']:
            # Replace with better version
            unique.remove(seen_content[content_hash])
            unique.append(t)
            seen_content[content_hash] = t
        # else skip
    else:
        seen_content[content_hash] = t
        unique.append(t)

print(f'Unique: {len(unique)} (removed {len(topics)-len(unique)} exact duplicates)')

# Save topics
cats = {}
for t in unique:
    with open(os.path.join(topics_dir, f'{t["id"]}.json'), 'w') as f:
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
catlist = [{'id': re.sub(r'[^a-z0-9]','-','-'.lower()), 'name': n, 'count': c, 'description': f'{n} topics'} 
           for n,c in sorted(cats.items())]
with open(f'{data_dir}/categories.json', 'w') as f:
    json.dump(catlist, f, indent=2)

# Summary
with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump({'totalTopics': len(idx), 'totalImages': sum(len(t['images']) for t in idx),
               'downloadedImages': 2985, 'categories': cats, 'processedAt': '2026-03-08T22:00:00Z'}, f, indent=2)

print(f'\nDone! {len(idx)} topics')
for c in catlist:
    print(f'  {c["name"]}: {c["count"]}')

print('\nFirst 10:')
for t in idx[:10]:
    print(f'  {t["title"]} ({t["wordCount"]}w): {t["description"][:50]}...')
