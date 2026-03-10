import json
import os
import re

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

topic_files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]
print(f'Processing {len(topic_files)} topic files...\n')

def get_content_similarity(content1, content2):
    if not content1 or not content2:
        return 0
    def clean(c):
        c = re.sub(r'<[^>]+>', ' ', c)
        c = re.sub(r'\s+', ' ', c).strip().lower()
        return c
    c1 = clean(content1)
    c2 = clean(content2)
    if c1 == c2:
        return 1.0
    return 0

def clean_description(content):
    if not content:
        return ''
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&#038;', '&').replace('&#8211;', '-').replace('&#8217;', "'")
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:180].strip() + '...'

def count_words(content):
    if not content:
        return 0
    text = re.sub(r'<[^>]+>', ' ', content)
    text = re.sub(r'\s+', ' ', text)
    return len([w for w in text.split() if w])

# Group by base slug
from collections import defaultdict
topics_by_base = defaultdict(list)

for filename in topic_files:
    filepath = os.path.join(topics_dir, filename)
    with open(filepath, 'r') as f:
        topic = json.load(f)
    slug = topic['id']
    base_slug = re.sub(r'-\d+$', '', slug)
    topics_by_base[base_slug].append((filename, topic))

# Process each group
kept_topics = {}
removed_count = 0

for base_slug, file_topics in topics_by_base.items():
    if len(file_topics) == 1:
        # Only one version - keep it
        filename, topic = file_topics[0]
        kept_topics[base_slug] = topic
    else:
        # Multiple versions - check for true duplicates
        # Sort by word count (highest first)
        file_topics.sort(key=lambda x: x[1].get('wordCount', 0), reverse=True)
        
        keepers = []
        for filename, topic in file_topics:
            is_duplicate = False
            for keeper_fn, keeper_topic in keepers:
                sim = get_content_similarity(topic.get('content', ''), keeper_topic.get('content', ''))
                if sim == 1.0:  # Only remove if 100% identical
                    print(f'Removing duplicate: {topic["title"]} (identical to {keeper_topic["title"]})')
                    os.remove(os.path.join(topics_dir, filename))
                    removed_count += 1
                    is_duplicate = True
                    break
            if not is_duplicate:
                keepers.append((filename, topic))
        
        # For remaining keepers, use base slug for the best one
        if keepers:
            keepers.sort(key=lambda x: x[1].get('wordCount', 0), reverse=True)
            # Best one gets base slug
            best_topic = keepers[0][1]
            best_topic['id'] = base_slug
            kept_topics[base_slug] = best_topic
            
            # Others keep their unique slugs
            for filename, topic in keepers[1:]:
                unique_slug = topic['id']
                kept_topics[unique_slug] = topic

print(f'\nRemoved {removed_count} true duplicates')

# Save all kept topics
print(f'Saving {len(kept_topics)} unique topics...')

for slug, topic in kept_topics.items():
    # Clean description and count words
    content = topic.get('content', '')
    topic['description'] = clean_description(content)
    topic['wordCount'] = count_words(content)
    topic['id'] = slug
    
    filepath = os.path.join(topics_dir, f'{slug}.json')
    with open(filepath, 'w') as f:
        json.dump(topic, f)

# Build index
topics_index = []
categories_count = {}

for slug, topic in kept_topics.items():
    topics_index.append({
        'id': slug,
        'title': topic['title'],
        'filename': topic.get('filename', ''),
        'category': topic['category'],
        'description': topic['description'],
        'wordCount': topic['wordCount'],
        'images': topic.get('images', [])
    })
    cat = topic['category']
    categories_count[cat] = categories_count.get(cat, 0) + 1

topics_index.sort(key=lambda x: x['title'].lower())

with open(f'{data_dir}/topics-index.json', 'w') as f:
    json.dump(topics_index, f, indent=2)

# Save categories
categories = []
for name, count in sorted(categories_count.items()):
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')
    categories.append({'id': cat_id, 'name': name, 'count': count, 'description': f'{name} topics'})

with open(f'{data_dir}/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

# Save summary
summary = {
    'totalTopics': len(topics_index),
    'totalImages': sum(len(t.get('images', [])) for t in topics_index),
    'downloadedImages': 2985,
    'categories': categories_count,
    'processedAt': '2026-03-08T20:00:00.000Z'
}

with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\nFinal count: {len(topics_index)} topics')
print(f'Categories: {len(categories)}')
for c in categories:
    print(f'  {c["name"]}: {c["count"]}')

print('\nSample topics:')
for t in topics_index[:10]:
    print(f'  {t["title"]}: {t["wordCount"]} words - {t["description"][:60]}...')
