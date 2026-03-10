#!/usr/bin/env python3
import json
import os
from pathlib import Path

# Read the topics index
topics_index_path = '/home/z/my-project/data/topics-index.json'
topics_dir = '/home/z/my-project/data/topics'

with open(topics_index_path, 'r') as f:
    topics_index = json.load(f)

# Update each individual topic file
updated_count = 0
for topic_meta in topics_index:
    topic_id = topic_meta['id']
    topic_file = os.path.join(topics_dir, f"{topic_id}.json")
    
    if os.path.exists(topic_file):
        with open(topic_file, 'r') as f:
            topic_data = json.load(f)
        
        # Add semester info
        topic_data['semester'] = topic_meta.get('semester', 'year-1-semester-1')
        
        # Save updated file
        with open(topic_file, 'w') as f:
            json.dump(topic_data, f, indent=2)
        updated_count += 1

print(f"Updated {updated_count} individual topic files with semester information")
