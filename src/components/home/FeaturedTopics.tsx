'use client';

import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/use-data';

export function FeaturedTopics() {
  const { featured, loading } = useData();

  // Static fallback data
  const displayTopics = featured.length > 0 ? featured : [
    { id: 'abortions', title: 'Abortions', category: 'Maternal & Child Health', wordCount: 1658, images: [] },
    { id: 'hypertension', title: 'Hypertension', category: 'General Nursing', wordCount: 3200, images: [] },
    { id: 'diabetes-mellitus', title: 'Diabetes Mellitus', category: 'General Nursing', wordCount: 2800, images: [] },
    { id: 'pneumonia', title: 'Pneumonia', category: 'General Nursing', wordCount: 2100, images: [] },
    { id: 'meningitis', title: 'Meningitis', category: 'General Nursing', wordCount: 2400, images: [] },
    { id: 'burns', title: 'Burns Management', category: 'General Nursing', wordCount: 2900, images: [] },
  ];

  const getReadingTime = (wordCount: number) => {
    return Math.ceil(wordCount / 200);
  };

  const topicsToShow = loading ? displayTopics : (featured.length > 0 ? featured.slice(0, 6) : displayTopics);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="decorative-blob w-72 h-72 bg-amber-500/5 top-0 right-0" />
        <div className="decorative-blob w-64 h-64 bg-primary/5 bottom-0 left-1/3" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
              <Eye className="h-4 w-4" />
              Most Viewed
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Featured Topics
            </h2>
            <p className="text-muted-foreground text-lg">
              Popular topics with comprehensive content
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex btn-outline-glow gap-2">
            <Link href="/topics">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsToShow.map((topic, index) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="topic-card h-full border-0 bg-card/80 backdrop-blur-sm hover:bg-card rounded-2xl overflow-hidden">
                {/* Image or gradient placeholder */}
                {topic.images && topic.images.length > 0 ? (
                  <div className="relative h-44 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                    <img
                      src={topic.images[0]}
                      alt={topic.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-primary/90 hover:bg-primary">
                      #{index + 1}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0.14_170/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.14_170/0.05)_1px,transparent_1px)] bg-[size:1rem_1rem]" />
                    <Badge className="absolute top-3 right-3 bg-primary/90 hover:bg-primary">
                      #{index + 1}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {topic.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                    {topic.category}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{topic.wordCount || 1000} words</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{getReadingTime(topic.wordCount || 1000)} min</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Button asChild variant="outline" className="btn-outline-glow gap-2">
            <Link href="/topics">
              View All Topics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
