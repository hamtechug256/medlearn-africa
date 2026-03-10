import json
import os
import re
from collections import defaultdict

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

topic_files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]
print(f'Processing {len(topic_files)} topic files...\n')

def get_text_similarity(content1, content2):
    """Get similarity ratio between two content strings"""
    def clean(c):
        c = re.sub(r'<[^>]+>', ' ', c or '')
        c = re.sub(r'\s+', ' ', c).strip().lower()
        return c
    
    c1 = clean(content1)
    c2 = clean(content2)
    
    if c1 == c2:
        return 1.0
    
    # Check containment
    if c1 and c2:
        if c1 in c2 or c2 in c1:
            shorter = min(len(c1), len(c2))
            longer = max(len(c1), len(c2))
            return shorter / longer
    
    # Word overlap on first 200 words
    words1 = set(c1.split()[:200])
    words2 = set(c2.split()[:200])
    common = len(words1 & words2)
    total = len(words1 | words2)
    
    return common / total if total > 0 else 0

def clean_description(content):
    """Extract clean description from HTML content"""
    if not content:
        return ''
    
    # Remove scripts, styles, comments
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Decode HTML entities
    text = text.replace('&#038;', '&').replace('&#8211;', '-').replace('&#8217;', "'")
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    
    # Remove noise phrases
    noise_patterns = [
        r'Home\s+Blog\s+About\s+Contact',
        r'Skip to content',
        r'Nurses?\s+Revision',
        r'nursesrevisionuganda\.com',
        r'WhatsApp',
        r'Facebook\s+Twitter\s+LinkedIn',
        r'Share this',
        r'Click to share',
        r'Previous post',
        r'Next post',
        r'Leave a (Comment|Reply)',
    ]
    
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Clean whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove duplicate words/phrases at start
    words = text.split()
    seen = []
    result = []
    for w in words:
        if w.lower() not in [s.lower() for s in seen[-5:]]:  # Not in last 5 words
            result.append(w)
            seen.append(w)
        elif len(result) < 5:  # Allow some repetition in first few words (title might repeat)
            result.append(w)
    
    text = ' '.join(result)
    
    return text[:180].strip() + '...'

def count_words(content):
    if not content:
        return 0
    text = re.sub(r'<[^>]+>', ' ', content)
    text = re.sub(r'\s+', ' ', text)
    return len([w for w in text.split() if len(w) > 1])

# Step 1: Load all topics
all_topics = []
for filename in topic_files:
    filepath = os.path.join(topics_dir, filename)
    with open(filepath, 'r') as f:
        topic = json.load(f)
    topic['_file'] = filename
    all_topics.append(topic)

print(f'Loaded {len(all_topics)} topics')

# Step 2: Group by title similarity
print('\nChecking for duplicates by content similarity...')

topics_to_keep = []
removed_count = 0

# Sort by word count (highest first) so we keep the most complete version
all_topics.sort(key=lambda x: x.get('wordCount', 0), reverse=True)

for topic in all_topics:
    is_duplicate = False
    
    for kept in topics_to_keep:
        sim = get_text_similarity(topic.get('content', ''), kept.get('content', ''))
        
        # Only consider duplicate if >80% similar
        if sim > 0.80:
            # Keep the one with more content
            if topic.get('wordCount', 0) > kept.get('wordCount', 0):
                # Replace kept with this one
                topics_to_keep.remove(kept)
                topics_to_keep.append(topic)
                print(f'  Replacing "{kept["title"]}" with better version ({topic["wordCount"]} vs {kept["wordCount"]} words)')
            else:
                print(f'  Skipping duplicate: {topic["title"]} ({sim*100:.0f}% similar)')
            is_duplicate = True
            break
    
    if not is_duplicate:
        topics_to_keep.append(topic)

print(f'\nKept {len(topics_to_keep)} unique topics (removed {len(all_topics) - len(topics_to_keep)} duplicates)')

# Step 3: Clean and save
print('\nCleaning and saving topics...')

for topic in topics_to_keep:
    content = topic.get('content', '')
    topic['description'] = clean_description(content)
    topic['wordCount'] = count_words(content)
    topic['id'] = re.sub(r'-\d+$', '', topic['id'])  # Clean ID
    del topic['_file']
    
    filepath = os.path.join(topics_dir, f'{topic["id"]}.json')
    with open(filepath, 'w') as f:
        json.dump(topic, f)

# Step 4: Build index
topics_index = []
categories_count = {}

for topic in topics_to_keep:
    topics_index.append({
        'id': topic['id'],
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

# Categories
categories = []
for name, count in sorted(categories_count.items()):
    cat_id = re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')
    categories.append({'id': cat_id, 'name': name, 'count': count, 'description': f'{name} topics'})

with open(f'{data_dir}/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

# Summary
summary = {
    'totalTopics': len(topics_index),
    'totalImages': sum(len(t.get('images', [])) for t in topics_index),
    'downloadedImages': 2985,
    'categories': categories_count,
    'processedAt': '2026-03-08T21:00:00.000Z'
}

with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\nFinal: {len(topics_index)} topics in {len(categories)} categories')
for c in categories:
    print(f'  {c["name"]}: {c["count"]}')

print('\nSample topics:')
for t in topics_index[:8]:
    print(f'  {t["title"]} ({t["wordCount"]} words)')
    print(f'    {t["description"][:70]}...')
