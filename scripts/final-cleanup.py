import json
import os
import re

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

# Load all topics
topic_files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]
print(f'Processing {len(topic_files)} topic files...')

def clean_description(content):
    """Extract clean description"""
    if not content:
        return ''
    
    # Remove scripts, styles, comments
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    
    # Remove common noise phrases
    noise_patterns = [
        r'Home\s*Blog\s*About\s*Contact',
        r'Skip to content',
        r'Nurses Revision',
        r'nursesrevisionuganda\.com',
        r'Share this:',
        r'Click to share',
        r'Facebook\s*Twitter\s*LinkedIn',
        r'Related posts?',
        r'Previous Previous post',
        r'Next Next post',
        r'Leave a (Comment|Reply)',
        r'Your email address will not be published',
        r'Required fields are marked',
        r'\*\s*\*\s*\*',
    ]
    
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Clean whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text[:200].strip()

def count_words(content):
    if not content:
        return 0
    text = re.sub(r'<[^>]+>', ' ', content)
    text = re.sub(r'\s+', ' ', text).strip()
    return len([w for w in text.split() if w])

# Process all topics
topics_map = {}  # Use slug as key to dedupe

for filename in topic_files:
    filepath = os.path.join(topics_dir, filename)
    
    try:
        with open(filepath, 'r') as f:
            topic = json.load(f)
        
        # Get slug (remove numeric suffix for dedup)
        slug = topic['id']
        base_slug = re.sub(r'-\d+$', '', slug)
        
        # Clean description and count
        content = topic.get('content', '')
        desc = clean_description(content)
        wc = count_words(content)
        
        topic['description'] = desc
        topic['wordCount'] = wc
        
        # Keep the one with more content if duplicate
        if base_slug in topics_map:
            if wc > topics_map[base_slug]['wordCount']:
                topics_map[base_slug] = topic
                # Remove the lesser file
                os.remove(filepath)
            else:
                os.remove(filepath)
        else:
            topics_map[base_slug] = topic
            
    except Exception as e:
        print(f'Error: {filename}: {e}')

# Save updated topics
print(f'Saving {len(topics_map)} unique topics...')

for slug, topic in topics_map.items():
    topic['id'] = slug
    filepath = os.path.join(topics_dir, f'{slug}.json')
    with open(filepath, 'w') as f:
        json.dump(topic, f)

# Create index
topics_index = []
category_counts = {}

for slug, topic in topics_map.items():
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
    category_counts[cat] = category_counts.get(cat, 0) + 1

# Sort by title
topics_index.sort(key=lambda x: x['title'].lower())

# Save files
with open(f'{data_dir}/topics-index.json', 'w') as f:
    json.dump(topics_index, f, indent=2)

# Categories
categories = []
for name, count in sorted(category_counts.items()):
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower())
    cat_id = re.sub(r'-+', '-', cat_id).strip('-')
    categories.append({'id': cat_id, 'name': name, 'count': count, 'description': f'{name} topics'})

with open(f'{data_dir}/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

# Summary
summary = {
    'totalTopics': len(topics_index),
    'totalImages': sum(len(t.get('images', [])) for t in topics_index),
    'downloadedImages': 2985,
    'categories': category_counts,
    'processedAt': '2026-03-08T18:00:00.000Z'
}

with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\\nDone! {len(topics_index)} unique topics')
print(f'Categories: {len(categories)}')
for c in categories:
    print(f'  {c["name"]}: {c["count"]}')
