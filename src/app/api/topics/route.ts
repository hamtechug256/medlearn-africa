import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function readJsonFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
  }
  
  const topicsFull = readJsonFile<any[]>('topics.json', []);
  const topicsIndex = readJsonFile<any[]>('topics-index.json', []);
  
  // Find topic
  const topic = topicsIndex.find(t => 
    t.id === id || 
    t.id.replace(/-\d+$/, '') === id ||
    t.filename.replace('.html', '') === id
  );
  
  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }
  
  // Get full content
  const fullTopic = topicsFull.find(t => t.id === topic.id);
  
  return NextResponse.json({
    ...topic,
    content: fullTopic?.content || '',
    rawHtml: fullTopic?.rawHtml || ''
  });
}
