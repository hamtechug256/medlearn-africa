import json
import os
import re

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

# Get list of topic files
topic_files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]
print(f'Found {len(topic_files)} topic files')

# Topics to remove
remove_keywords = ['about us', 'contact us', 'privacy policy', 'terms of service', 'disclaimer']

def is_weird_id(title):
    clean = title.replace(' ', '').replace('-', '').replace('_', '')
    if clean.isdigit() and len(clean) > 5:
        return True
    if len(clean) > 10:
        has_digits = sum(1 for c in clean if c.isdigit())
        has_letters = sum(1 for c in clean if c.isalpha())
        if has_digits > 2 and has_letters > 2:
            if clean.upper() == clean:
                return True
    return False

def extract_clean_description(content):
    """Extract clean text description from HTML content"""
    if not content:
        return ''
    
    # Remove HTML tags
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Get first 200 chars
    return text[:200].strip()

def count_words(content):
    """Count actual words in content"""
    if not content:
        return 0
    text = re.sub(r'<[^>]+>', ' ', content)
    text = re.sub(r'\s+', ' ', text).strip()
    words = [w for w in text.split() if len(w) > 0]
    return len(words)

topics_index = []
category_counts = {}
removed = []

for filename in topic_files:
    filepath = os.path.join(topics_dir, filename)
    
    try:
        with open(filepath, 'r') as f:
            topic = json.load(f)
        
        title = topic.get('title', '')
        title_lower = title.lower().strip()
        
        # Check if should remove
        should_remove = False
        for kw in remove_keywords:
            if kw in title_lower:
                should_remove = True
                break
        
        if is_weird_id(title):
            should_remove = True
        
        if should_remove:
            removed.append(title)
            os.remove(filepath)
            continue
        
        # Extract clean description
        content = topic.get('content', '')
        clean_desc = extract_clean_description(content)
        word_count = count_words(content)
        
        # Update topic
        topic['description'] = clean_desc
        topic['wordCount'] = word_count
        
        # Save updated topic file
        with open(filepath, 'w') as f:
            json.dump(topic, f, indent=2)
        
        # Add to index (without full content)
        topics_index.append({
            'id': topic['id'],
            'title': topic['title'],
            'filename': topic.get('filename', ''),
            'category': topic['category'],
            'description': clean_desc,
            'wordCount': word_count,
            'images': topic.get('images', [])
        })
        
        # Count categories
        cat = topic['category']
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
    except Exception as e:
        print(f'Error processing {filename}: {e}')

print(f'\nRemoved {len(removed)} non-educational pages:')
for r in removed:
    print(f'  - {r}')

# Sort by title
topics_index.sort(key=lambda x: x['title'].lower())

# Save index
with open(f'{data_dir}/topics-index.json', 'w') as f:
    json.dump(topics_index, f, indent=2)

# Create categories
categories = []
for name, count in sorted(category_counts.items()):
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

# Create summary
summary = {
    'totalTopics': len(topics_index),
    'totalImages': sum(len(t.get('images', [])) for t in topics_index),
    'downloadedImages': 2985,
    'categories': category_counts,
    'processedAt': '2026-03-08T17:00:00.000Z'
}

with open(f'{data_dir}/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f'\nKept {len(topics_index)} educational topics')
print(f'Categories: {len(categories)}')
print('\nCategory breakdown:')
for cat in categories:
    print(f'  {cat["name"]}: {cat["count"]} topics')
