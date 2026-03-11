'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Share2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTopic, useData } from '@/lib/use-data';
import type { Topic } from '@/lib/types';

function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
}

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { topic, loading, error } = useTopic(slug);
  const { topics } = useData();
  
  const relatedTopics = topic && topics.length > 0
    ? topics
        .filter(t => t.id !== topic.id && t.category === topic.category)
        .slice(0, 5)
    : [];
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <BookOpen className="h-16 w-16 text-muted mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Topic Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The topic you&apos;re looking for doesn&apos;t exist or may have been removed.
              </p>
              <Button asChild>
                <Link href="/topics">Browse All Topics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const processedContent = topic.processedContent || topic.content || '';
  const categorySlug = topic.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '-').replace(/\//g, '-');

  // Filter out logo/branding images (small images and logos)
  const contentImages = (topic.images || []).filter(img => {
    if (!img) return false;
    const imgLower = img.toLowerCase();
    // Filter out small dimensioned images (icons, logos)
    const smallImgMatch = imgLower.match(/(\d+)x(\d+)/);
    if (smallImgMatch && (parseInt(smallImgMatch[1]) <= 150 || parseInt(smallImgMatch[2]) <= 150)) {
      return false;
    }
    // Filter out common logo patterns
    const logoPatterns = ['logo', 'pupo', 'banner', 'icon', 'avatar', 'blue.png'];
    return !logoPatterns.some(pattern => imgLower.includes(pattern));
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Breadcrumb */}
      <div className="bg-background border-b sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/topics" className="text-muted-foreground hover:text-primary">
              Topics
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground line-clamp-1">{topic.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Topic Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
                <h1 className="text-2xl md:text-3xl font-bold">{topic.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge variant="secondary">
                    {topic.category}
                  </Badge>
                  {topic.wordCount > 0 && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {getReadingTime(topic.wordCount)}
                    </Badge>
                  )}
                  {contentImages.length > 0 && (
                    <Badge variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {contentImages.length} images
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6">
                {processedContent ? (
                  <div
                    className="topic-content prose prose-slate max-w-none prose-headings:text-primary prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-3 prose-p:mb-4 prose-li:my-1 prose-ul:list-disc prose-ol:list-decimal"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                ) : (
                  <p className="text-muted-foreground">Content loading...</p>
                )}
              </CardContent>

              {/* Share Section */}
              <div className="p-6 border-t bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Category</h3>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/topics?category=${categorySlug}`}
                  className="flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  {topic.category}
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </CardContent>
            </Card>

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Related Topics</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedTopics.map((relTopic) => (
                    <Link
                      key={relTopic.id}
                      href={`/topic/${relTopic.id}`}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <h4 className="font-medium text-sm line-clamp-2">{relTopic.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{relTopic.category}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Topic Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Word Count</span>
                  <span className="font-semibold">{topic.wordCount || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Images</span>
                  <span className="font-semibold">{contentImages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="font-semibold">{topic.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/topics">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Topics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
