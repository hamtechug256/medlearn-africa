// Client-side data fetching utilities
// This file should be used in client components

export interface Topic {
  id: string;
  title: string;
  filename: string;
  category: string;
  description: string;
  wordCount: number;
  images: string[];
  content?: string;
  rawHtml?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  description: string;
}

export interface Summary {
  totalTopics: number;
  totalImages: number;
  downloadedImages: number;
  categories: Record<string, number>;
  processedAt: string;
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  semester: number;
  topics: string[];
  description: string;
}

export const semesters: Semester[] = [
  {
    id: 'year-1-semester-1',
    name: 'Year 1 Semester 1',
    year: 1,
    semester: 1,
    description: 'Foundation courses including Anatomy, Ethics, Sociology, Psychology, IT, Microbiology, and Environmental Health',
    topics: []
  },
  {
    id: 'year-1-semester-2',
    name: 'Year 1 Semester 2',
    year: 1,
    semester: 2,
    description: 'Advanced Anatomy, Nursing Process, and Medical-Surgical introduction',
    topics: []
  },
  {
    id: 'year-2-semester-1',
    name: 'Year 2 Semester 1',
    year: 2,
    semester: 1,
    description: 'Urinary, CNS, and Endocrine disorders',
    topics: []
  },
  {
    id: 'year-2-semester-2',
    name: 'Year 2 Semester 2',
    year: 2,
    semester: 2,
    description: 'Advanced procedures, Ophthalmology, and ENT',
    topics: []
  },
  {
    id: 'year-3-semester-1',
    name: 'Year 3 Semester 1',
    year: 3,
    semester: 1,
    description: 'Community Health, Research, and Management',
    topics: []
  },
  {
    id: 'year-3-semester-2',
    name: 'Year 3 Semester 2',
    year: 3,
    semester: 2,
    description: 'Paediatrics, Skin disorders, and specialized nursing',
    topics: []
  }
];

// Cache for fetched data
let cachedTopicsIndex: Topic[] | null = null;
let cachedCategories: Category[] | null = null;
let cachedSummary: Summary | null = null;

// Fetch functions that call API routes
export async function fetchTopicsIndex(): Promise<Topic[]> {
  if (cachedTopicsIndex) return cachedTopicsIndex;
  
  try {
    const res = await fetch('/api/data?type=topics-index');
    if (!res.ok) throw new Error('Failed to fetch topics');
    cachedTopicsIndex = await res.json();
    return cachedTopicsIndex || [];
  } catch {
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  if (cachedCategories) return cachedCategories;
  
  try {
    const res = await fetch('/api/data?type=categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    cachedCategories = await res.json();
    return cachedCategories || [];
  } catch {
    return [];
  }
}

export async function fetchSummary(): Promise<Summary> {
  if (cachedSummary) return cachedSummary;
  
  try {
    const res = await fetch('/api/data?type=summary');
    if (!res.ok) throw new Error('Failed to fetch summary');
    cachedSummary = await res.json();
    return cachedSummary || {
      totalTopics: 0,
      totalImages: 0,
      downloadedImages: 0,
      categories: {},
      processedAt: ''
    };
  } catch {
    return {
      totalTopics: 0,
      totalImages: 0,
      downloadedImages: 0,
      categories: {},
      processedAt: ''
    };
  }
}

export async function fetchTopicBySlug(slug: string): Promise<Topic | null> {
  try {
    const res = await fetch(`/api/data?type=topic&slug=${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchTopicsFull(): Promise<Topic[]> {
  try {
    const res = await fetch('/api/data?type=topics-full');
    if (!res.ok) throw new Error('Failed to fetch topics');
    return await res.json() || [];
  } catch {
    return [];
  }
}

// Helper functions that use the async fetch functions
export async function getTopicsByCategory(categoryId: string): Promise<Topic[]> {
  const categories = await fetchCategories();
  const topicsIndex = await fetchTopicsIndex();
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];
  return topicsIndex.filter(t => t.category === category.name);
}

export async function searchTopics(query: string): Promise<Topic[]> {
  const topicsIndex = await fetchTopicsIndex();
  const lowerQuery = query.toLowerCase();
  return topicsIndex.filter(t => 
    t.title.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery)
  );
}

export async function getFeaturedTopics(count: number = 6): Promise<Topic[]> {
  const topicsIndex = await fetchTopicsIndex();
  const topicsWithImages = topicsIndex
    .filter(t => t.images.length > 2 && t.wordCount > 100)
    .sort((a, b) => b.wordCount - a.wordCount);
  
  return topicsWithImages.slice(0, count);
}

export async function getRecentTopics(count: number = 8): Promise<Topic[]> {
  const topicsIndex = await fetchTopicsIndex();
  const shuffled = [...topicsIndex].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function getCategoryStats(): Promise<{ category: Category; topicCount: number }[]> {
  const categories = await fetchCategories();
  return categories.map(cat => ({
    category: cat,
    topicCount: cat.count
  }));
}

export async function getTopicsAlphabetically(): Promise<Topic[]> {
  const topicsIndex = await fetchTopicsIndex();
  return [...topicsIndex].sort((a, b) => a.title.localeCompare(b.title));
}

export async function getTopicCount(): Promise<number> {
  const summary = await fetchSummary();
  return summary.totalTopics;
}

export async function getCategoryCount(): Promise<number> {
  const categories = await fetchCategories();
  return categories.length;
}

export async function getImageCount(): Promise<number> {
  const summary = await fetchSummary();
  return summary.downloadedImages;
}
