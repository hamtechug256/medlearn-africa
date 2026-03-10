import json
import os
import re

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

# Check the two Acromegaly topics
files = ['acromegaly-038-gingatism-hyperpituitarism.json', 'acromegaly-gingatism-hyperpituitarism.json']

def get_text_similarity(content1, content2):
    def clean(c):
        c = re.sub(r'<[^>]+>', ' ', c)
        c = re.sub(r'\s+', ' ', c).strip().lower()
        return c
    c1 = clean(content1)
    c2 = clean(content2)
    
    # Calculate overlap
    words1 = set(c1.split()[:100])  # First 100 words
    words2 = set(c2.split()[:100])
    common = words1 & words2
    total = words1 | words2
    
    return len(common) / len(total) if total else 0

for f in files:
    path = os.path.join(topics_dir, f)
    if os.path.exists(path):
        with open(path) as file:
            t = json.load(file)
        print(f'{f}:')
        print(f'  Title: {t["title"]}')
        print(f'  Words: {t.get("wordCount", 0)}')
        content = t.get('content', '')[:500]
        print(f'  Content start: {content[:200]}...')
        print()

# Compare them
if all(os.path.exists(os.path.join(topics_dir, f)) for f in files):
    with open(os.path.join(topics_dir, files[0])) as f:
        t1 = json.load(f)
    with open(os.path.join(topics_dir, files[1])) as f:
        t2 = json.load(f)
    
    sim = get_text_similarity(t1.get('content', ''), t2.get('content', ''))
    print(f'Similarity between the two: {sim*100:.1f}%')
    
    if sim > 0.8:
        print('-> LIKELY DUPLICATES')
    else:
        print('-> DIFFERENT CONTENT')
