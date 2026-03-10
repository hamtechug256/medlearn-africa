// Server-side only data loading - DO NOT import this in client components
import fs from 'fs';
import path from 'path';
import { Topic, Category, Summary, ImagesMap } from './types';

const dataDir = path.join(process.cwd(), 'data');
const topicsDir = path.join(dataDir, 'topics');

function readJsonFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

// Cache loaded data
let cachedTopicsIndex: Topic[] | null = null;
let cachedCategories: Category[] | null = null;
let cachedSummary: Summary | null = null;
let cachedImagesMap: ImagesMap | null = null;

// Cache for individual topics
const topicCache = new Map<string, Topic>();
const MAX_TOPIC_CACHE = 50;

export function getTopicsIndex(): Topic[] {
  if (cachedTopicsIndex === null) {
    cachedTopicsIndex = readJsonFile<Topic[]>('topics-index.json', []);
  }
  return cachedTopicsIndex;
}

export function getCategories(): Category[] {
  if (cachedCategories === null) {
    cachedCategories = readJsonFile<Category[]>('categories.json', []);
  }
  return cachedCategories;
}

export function getSummary(): Summary {
  if (cachedSummary === null) {
    cachedSummary = readJsonFile<Summary>('summary.json', {
      totalTopics: 0,
      totalImages: 0,
      downloadedImages: 0,
      categories: {},
      processedAt: ''
    });
  }
  return cachedSummary;
}

export function getImagesMap(): ImagesMap {
  if (cachedImagesMap === null) {
    cachedImagesMap = readJsonFile<ImagesMap>('images-map.json', {});
  }
  return cachedImagesMap;
}

// Load a single topic by slug
export function getTopicBySlug(slug: string): Topic | undefined {
  // Check cache first
  if (topicCache.has(slug)) {
    return topicCache.get(slug);
  }
  
  // Read individual topic file
  const topicFile = path.join(topicsDir, `${slug}.json`);
  
  if (fs.existsSync(topicFile)) {
    try {
      const content = fs.readFileSync(topicFile, 'utf-8');
      const topic = JSON.parse(content) as Topic;
      
      // Add to cache
      if (topicCache.size >= MAX_TOPIC_CACHE) {
        const firstKey = topicCache.keys().next().value;
        if (firstKey) {
          topicCache.delete(firstKey);
        }
      }
      topicCache.set(slug, topic);
      
      return topic;
    } catch {
      return undefined;
    }
  }
  
  return undefined;
}

export function getTopicById(id: string): Topic | undefined {
  return getTopicBySlug(id);
}

export function getTopicsByCategory(categoryId: string): Topic[] {
  const categories = getCategories();
  const topicsIndex = getTopicsIndex();
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];
  return topicsIndex.filter(t => t.category === category.name);
}

export function searchTopics(query: string): Topic[] {
  const topicsIndex = getTopicsIndex();
  const lowerQuery = query.toLowerCase();
  return topicsIndex.filter(t => 
    t.title.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery)
  );
}

export function getFeaturedTopics(count: number = 6): Topic[] {
  const topicsIndex = getTopicsIndex();
  return topicsIndex
    .filter(t => t.images && t.images.length > 0 && t.wordCount > 500)
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, count);
}

export function getLocalImagePath(originalUrl: string): string | undefined {
  const imagesMap = getImagesMap();
  const cleanUrl = originalUrl.replace(/&amp;/g, '&');
  return imagesMap[cleanUrl] || imagesMap[originalUrl];
}

export function getTopicCount(): number {
  return getSummary().totalTopics;
}

export function getCategoryCount(): number {
  return getCategories().length;
}

export function getImageCount(): number {
  return getSummary().downloadedImages;
}
