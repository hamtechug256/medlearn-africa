import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const q = searchParams.get('q');

  try {
    // Handle action=all for client hook
    if (action === 'all') {
      const topics = readJsonFile<any[]>('topics-index.json', []);
      const categories = readJsonFile<any[]>('categories.json', []);
      const summary = readJsonFile<any>('summary.json', {
        totalTopics: 0,
        totalImages: 0,
        downloadedImages: 0,
        categories: {},
        processedAt: ''
      });
      
      // Get featured topics (topics with images and good word count)
      const featured = topics
        .filter(t => t.images && t.images.length > 0 && t.wordCount > 500)
        .sort((a, b) => b.wordCount - a.wordCount)
        .slice(0, 6);
      
      return NextResponse.json({
        success: true,
        data: {
          topics,
          categories,
          summary,
          featured
        }
      });
    }
    
    // Handle search action
    if (action === 'search' && q) {
      const topics = readJsonFile<any[]>('topics-index.json', []);
      const lowerQuery = q.toLowerCase();
      const results = topics.filter(t => 
        t.title.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
      );
      return NextResponse.json({ success: true, data: results });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
