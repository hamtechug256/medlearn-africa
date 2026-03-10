#!/usr/bin/env node
/**
 * Content Processing Script for Nursing Education Platform
 * Downloads HTML files from GitHub and extracts clean educational content
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/hamtechug256/nursing-notes/master/';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Rate limiting helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch HTML content from URL
async function fetchHtml(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return null;
  }
}

// Parse HTML and extract educational content
function extractContent(html, slug) {
  // Simple regex-based extraction (no external dependencies)
  
  // Extract title
  const titleMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>(.*?)<\/h1>/is);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : slug.replace(/-/g, ' ').toUpperCase();
  
  // Extract entry-content div
  const contentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<footer|<section|<nav|<\/article|<\/main)/i);
  
  if (!contentMatch) {
    // Try alternative pattern
    const altMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]+)/i);
    if (altMatch) {
      const content = altMatch[1];
      // Clean up
      const cleanedContent = cleanContent(content);
      return { title, content: cleanedContent };
    }
    return { title, content: '' };
  }
  
  const content = contentMatch[1];
  const cleanedContent = cleanContent(content);
  
  return { title, content: cleanedContent };
}

// Clean HTML content - remove noise, keep educational content
function cleanContent(html) {
  // Remove scripts and styles
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove comments sections
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*comments[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<section[^>]*id="comments"[^>]*>[\s\S]*?<\/section>/gi, '');
  
  // Remove navigation
  cleaned = cleaned.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*nav-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove share buttons
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*social[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove advertisements
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*ad[s]?[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '');
  
  // Remove sidebars
  cleaned = cleaned.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p[^>]*>&nbsp;<\/p>/gi, '');
  
  // Remove empty divs
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, '');
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Remove any remaining WordPress-specific elements
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*wp-block-[^"]*"[^>]*>\s*<\/div>/gi, '');
  
  return cleaned.trim();
}

// Extract image URLs from content
function extractImages(html) {
  const images = [];
  const imgRegex = /<img[^>]*src=["']([^"']+)["']/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.includes('nursesrevisionuganda.com/wp-content/uploads')) {
      images.push(src);
    }
  }
  
  return [...new Set(images)]; // Remove duplicates
}

// Extract headings for table of contents
function extractHeadings(html) {
  const headings = [];
  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    if (text.length > 0) {
      headings.push({ level, text, id });
    }
  }
  
  return headings;
}

// Calculate word count
function countWords(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Main processing function
async function processAllContent() {
  console.log('🚀 Starting content processing...\n');
  
  // Read curriculum to get file list
  const curriculumPath = path.join(OUTPUT_DIR, 'curriculum.json');
  const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));
  
  // Get all unique topic slugs
  const allSlugs = new Set();
  curriculum.semesters.forEach(sem => {
    sem.topics.forEach(slug => allSlugs.add(slug));
  });
  
  console.log(`📚 Found ${allSlugs.size} unique topics to process\n`);
  
  const topics = [];
  const allImages = new Set();
  let processed = 0;
  let failed = 0;
  
  for (const slug of allSlugs) {
    processed++;
    console.log(`[${processed}/${allSlugs.size}] Processing: ${slug}`);
    
    const url = `${GITHUB_RAW_BASE}${slug}.html`;
    const html = await fetchHtml(url);
    
    if (!html) {
      failed++;
      console.log(`  ❌ Failed to fetch`);
      continue;
    }
    
    const { title, content } = extractContent(html, slug);
    const images = extractImages(content);
    const headings = extractHeadings(content);
    const wordCount = countWords(content);
    
    // Find semester for this topic
    let semester = 'Uncategorized';
    for (const sem of curriculum.semesters) {
      if (sem.topics.includes(slug)) {
        semester = sem.name;
        break;
      }
    }
    
    // Categorize based on content
    const category = categorizeTopic(slug, title, content);
    
    topics.push({
      id: slug,
      slug,
      title,
      semester,
      category,
      originalUrl: `https://nursesrevisionuganda.com/${slug}/`,
      content,
      images,
      headings,
      wordCount
    });
    
    images.forEach(img => allImages.add(img));
    
    console.log(`  ✓ Title: ${title}`);
    console.log(`  ✓ Words: ${wordCount}, Images: ${images.length}, Headings: ${headings.length}`);
    
    // Rate limiting
    await sleep(100);
  }
  
  // Save processed topics
  const outputPath = path.join(OUTPUT_DIR, 'topics.json');
  fs.writeFileSync(outputPath, JSON.stringify({ topics, totalTopics: topics.length, totalImages: allImages.size }, null, 2));
  
  // Save image list for downloading
  const imagesPath = path.join(OUTPUT_DIR, 'images-to-download.json');
  fs.writeFileSync(imagesPath, JSON.stringify([...allImages], null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Content processing complete!');
  console.log(`📊 Results:`);
  console.log(`   - Total topics: ${topics.length}`);
  console.log(`   - Failed: ${failed}`);
  console.log(`   - Total images to download: ${allImages.size}`);
  console.log(`   - Output: ${outputPath}`);
  console.log('='.repeat(60));
}

// Categorize topic based on slug, title and content
function categorizeTopic(slug, title, content) {
  const lowerSlug = slug.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  const categories = [
    { id: 'anatomy-physiology', keywords: ['anatomy', 'physiology', 'system', 'body', 'skeletal', 'muscular', 'nervous', 'cardiovascular', 'respiratory', 'renal', 'endocrine', 'lymphatic', 'digestive', 'reproductive'] },
    { id: 'medical-surgical', keywords: ['surgical', 'surgery', 'wound', 'fracture', 'burn', 'shock', 'hemorrhage', 'peri-operative', 'post-operative', 'dressing', 'trauma'] },
    { id: 'pharmacology', keywords: ['drug', 'drugs', 'medicine', 'medication', 'pharmacology', 'narcotics', 'antibiotic', 'anticonvulsant', 'antidepressant', 'antipsychotic', 'antineoplastic', 'anxiolytic'] },
    { id: 'paediatrics', keywords: ['child', 'children', 'infant', 'newborn', 'paediatric', 'pediatric', 'imci', 'malnutrition', 'vaccination', 'immunization', 'growth and development'] },
    { id: 'mental-health', keywords: ['mental', 'psychiatric', 'psychology', 'schizophrenia', 'depression', 'anxiety', 'bipolar', 'suicide', 'substance abuse', 'psychosis', 'defense mechanism'] },
    { id: 'community-health', keywords: ['community', 'public health', 'primary health', 'epidemiology', 'surveillance', 'outbreak', 'environmental', 'sanitation', 'hygiene'] },
    { id: 'reproductive-health', keywords: ['abortion', 'pregnancy', 'delivery', 'antenatal', 'postnatal', 'gynaecology', 'gynecology', 'menstrual', 'contraceptive', 'family planning', 'sti', 'sexually transmitted'] },
    { id: 'entrepreneurship', keywords: ['business', 'entrepreneurship', 'management', 'leadership', 'marketing', 'financial', 'cooperative', 'enterprise'] },
    { id: 'research', keywords: ['research', 'methodology', 'study design', 'data collection', 'sampling', 'proposal', 'literature review'] },
    { id: 'palliative-care', keywords: ['palliative', 'terminally ill', 'end-of-life', 'bereavement', 'hospice', 'death', 'dying'] }
  ];
  
  for (const cat of categories) {
    for (const keyword of cat.keywords) {
      if (lowerSlug.includes(keyword) || lowerTitle.includes(keyword) || lowerContent.includes(keyword)) {
        return cat.id;
      }
    }
  }
  
  return 'medical-surgical'; // Default category
}

// Run the script
processAllContent().catch(console.error);
