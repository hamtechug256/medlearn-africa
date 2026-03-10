#!/usr/bin/env python3
import json
import os

# Read the topics index
topics_path = '/home/z/my-project/data/topics-index.json'
with open(topics_path, 'r') as f:
    topics_index = json.load(f)

def determine_semester(topic):
    title = topic.get('title', '')
    category = topic.get('category', '')
    title_lower = title.lower()
    
    # Check by keywords first (more specific)
    # Year 2 Semester 1 - Urinary system
    urinary_keywords = ['urinary', 'renal', 'kidney', 'bladder', 'urological', 'catheter', 'urology']
    if any(kw in title_lower for kw in urinary_keywords):
        return 'year-2-semester-1'
    
    # Year 2 Semester 2 - Nervous system
    nervous_keywords = ['nervous', 'brain', 'neurological', 'cns', 'neuron', 'spinal', 'neuro', 'nervous system', 'neurology']
    if any(kw in title_lower for kw in nervous_keywords):
        return 'year-2-semester-2'
    
    # Year 3 Semester 1 - Community & Research
    community_keywords = ['community', 'public health', 'epidemiology', 'research', 'statistics', 'management', 'leadership', 'health promotion', 'disaster', 'emergency']
    if any(kw in title_lower for kw in community_keywords):
        return 'year-3-semester-1'
    
    # Year 3 Semester 2 - Pediatric & Mental Health
    pediatric_keywords = ['child', 'children', 'pediatric', 'infant', 'neonate', 'adolescent', 'developmental', 'growth']
    mental_keywords = ['psychiatric', 'mental health', 'psychosis', 'schizophrenia', 'depression', 'anxiety']
    
    if any(kw in title_lower for kw in pediatric_keywords):
        return 'year-3-semester-2'
    if any(kw in title_lower for kw in mental_keywords):
        return 'year-3-semester-2'
    
    # Maternal health
    maternal_keywords = ['pregnancy', 'maternal', 'prenatal', 'antenatal', 'postnatal', 'obstetric', 'labour', 'delivery', 'birth', 'mother', 'woman', 'abortion']
    if any(kw in title_lower for kw in maternal_keywords):
        return 'year-3-semester-2'
    
    # Check by category
    if category == 'Anatomy & Physiology':
        return 'year-1-semester-1'
    if category == 'Community Health':
        return 'year-3-semester-1'
    if category == 'Research & Ethics':
        return 'year-3-semester-1'
    if category == 'Pediatric Nursing':
        return 'year-3-semester-2'
    if category == 'Mental Health Nursing':
        return 'year-3-semester-2'
    if category == 'Maternal & Child Health':
        return 'year-3-semester-2'
    if category == 'Emergency Nursing':
        return 'year-3-semester-1'
    
    # Default to year 1 or 2 based on general nursing topics
    return 'year-1-semester-1'

# Add semester to each topic
for topic in topics_index:
    topic['semester'] = determine_semester(topic)

# Save updated topics index
with open(topics_path, 'w') as f:
    json.dump(topics_index, f, indent=2)

print(f"Updated {len(topics_index)} topics with semester information")

# Count semester distribution
semester_counts = {}
for topic in topics_index:
    sem = topic.get('semester', 'unassigned')
    if sem not in semester_counts:
        semester_counts[sem] = 0
    semester_counts[sem] += 1

for sem, count in sorted(semester_counts.items()):
    print(f"  {sem}: {count}")
