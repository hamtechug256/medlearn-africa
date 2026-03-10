import json
import os
import re
from collections import defaultdict

data_dir = '/home/z/my-project/data'
topics_dir = f'{data_dir}/topics'

# Load all topic files
topic_files = [f for f in os.listdir(topics_dir) if f.endswith('.json')]
print(f'Found {len(topic_files)} topic files\n')

# Group by base slug (removing numeric suffix)
topics_by_base = defaultdict(list)

for filename in topic_files:
    filepath = os.path.join(topics_dir, filename)
    with open(filepath, 'r') as f:
        topic = json.load(f)
    
    slug = topic['id']
    base_slug = re.sub(r'-\d+$', '', slug)
    topics_by_base[base_slug].append(topic)

# Find potential duplicates
print('Analyzing potential duplicates...\n')
print('=' * 80)

def get_content_similarity(content1, content2):
    """Compare two content strings and return similarity ratio"""
    if not content1 or not content2:
        return 0
    
    # Clean and normalize
    def clean(c):
        c = re.sub(r'<[^>]+>', ' ', c)
        c = re.sub(r'\s+', ' ', c).strip().lower()
        return c
    
    c1 = clean(content1)
    c2 = clean(content2)
    
    if c1 == c2:
        return 1.0
    
    # Check if one contains the other
    if c1 in c2 or c2 in c1:
        shorter = min(len(c1), len(c2))
        longer = max(len(c1), len(c2))
        return shorter / longer
    
    # Simple word overlap
    words1 = set(c1.split())
    words2 = set(c2.split())
    common = len(words1 & words2)
    total = len(words1 | words2)
    
    return common / total if total > 0 else 0

# Analyze each group
duplicates_found = []
unique_topics = []

for base_slug, topics in topics_by_base.items():
    if len(topics) == 1:
        unique_topics.append(topics[0])
    else:
        print(f'\n--- {base_slug} ---')
        print(f'Found {len(topics)} versions:')
        
        # Compare each pair
        for i, t1 in enumerate(topics):
            for j, t2 in enumerate(topics):
                if i < j:
                    sim = get_content_similarity(t1.get('content', ''), t2.get('content', ''))
                    print(f'\n  Comparing "{t1["title"]}" vs "{t2["title"]}"')
                    print(f'  Word counts: {t1.get("wordCount", 0)} vs {t2.get("wordCount", 0)}')
                    print(f'  Similarity: {sim*100:.1f}%')
                    
                    if sim > 0.95:
                        print(f'  -> DUPLICATE! Keeping the one with more content')
                        duplicates_found.append({
                            'base': base_slug,
                            'keep': t1 if t1.get('wordCount', 0) >= t2.get('wordCount', 0) else t2,
                            'remove': t2 if t1.get('wordCount', 0) >= t2.get('wordCount', 0) else t1,
                            'similarity': sim
                        })
                    else:
                        print(f'  -> DIFFERENT CONTENT - both should be kept')

print('\n' + '=' * 80)
print(f'\nSummary:')
print(f'  Unique topics: {len(unique_topics)}')
print(f'  True duplicates found: {len(duplicates_found)}')
print(f'  Groups with multiple versions: {sum(1 for t in topics_by_base.values() if len(t) > 1)}')

print('\nDuplicates to remove:')
for d in duplicates_found:
    print(f'  Remove: {d["remove"]["title"]} ({d["remove"]["id"]})')
    print(f'  Keep: {d["keep"]["title"]} ({d["keep"]["id"]})')
    print(f'  Similarity: {d["similarity"]*100:.1f}%')
    print()
