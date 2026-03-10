import json
import os
import re

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

topic_files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]

def clean_description(content):
    if not content:
        return ''
    
    # Remove HTML elements
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Remove common noise at the START of text
    text = re.sub(r'^\s*Home\s+Blog\s+About\s+Contact\s*', '', text)
    text = re.sub(r'^\s*Skip to content\s*', '', text)
    text = re.sub(r'^\s*Nurses Revision\s*', '', text)
    
    # Remove repeated titles at start (e.g., "Abortion Abortion")
    text = re.sub(r'^([A-Za-z\s]+?)\s+\1\s*', r'\1 ', text)
    
    # Remove any remaining noise phrases anywhere
    noise = [
        r'Home\s+Blog\s+About\s+Contact',
        r'Skip to content',
        r'Nurses Revision',
        r'nursesrevisionuganda\.com',
        r'Share this:?\s*(Facebook|Twitter|LinkedIn|WhatsApp)+',
        r'Click (here )?to share',
        r'Previous (post:?\s*)?',
        r'Next (post:?\s*)?',
        r'Leave a (Comment|Reply)',
        r'Your email address',
        r'Required fields',
    ]
    
    for pattern in noise:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Clean whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Get first meaningful sentence or 200 chars
    # Find first period followed by space or end
    sentences = re.split(r'[.!?]\s+', text)
    if sentences and len(sentences[0]) > 20:
        desc = sentences[0]
        if not desc.endswith('.'):
            desc += '.'
    else:
        desc = text[:200]
    
    return desc.strip()

# Update all topics
print('Updating descriptions...')

for filename in topic_files:
    filepath = os.path.join(topics_dir, filename)
    
    with open(filepath, 'r') as f:
        topic = json.load(f)
    
    content = topic.get('content', '')
    desc = clean_description(content)
    topic['description'] = desc
    
    with open(filepath, 'w') as f:
        json.dump(topic, f)

# Update index
print('Updating index...')

with open(f'{data_dir}/topics-index.json', 'r') as f:
    topics_index = json.load(f)

for topic in topics_index:
    # Read the actual topic file for content
    filepath = os.path.join(topics_dir, f'{topic["id"]}.json')
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            full_topic = json.load(f)
        topic['description'] = full_topic.get('description', '')

with open(f'{data_dir}/topics-index.json', 'w') as f:
    json.dump(topics_index, f, indent=2)

print(f'Updated {len(topics_index)} topics')

# Show first few
print('\nFirst 5 topics:')
for t in topics_index[:5]:
    print(f"  {t['title']}: {t['description'][:80]}...")
