'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Stethoscope, Sparkles, Heart, Brain, Baby, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/use-data';
import { useEffect, useState } from 'react';

export function Hero() {
  const { summary, loading } = useData();
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ topics: 0, categories: 0, images: 0 });

  const targetCounts = {
    topics: summary.totalTopics || 457,
    categories: summary.categories ? Object.keys(summary.categories).length : 10,
    images: Math.round((summary.downloadedImages || 2985) / 100) * 100
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts({
        topics: Math.round(targetCounts.topics * easeOut),
        categories: Math.round(targetCounts.categories * easeOut),
        images: Math.round(targetCounts.images * easeOut)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(targetCounts);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [mounted, loading, summary]);

  return (
    <section className="relative overflow-hidden hero-gradient py-24 md:py-32">
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 hero-grid pointer-events-none" />
      
      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="decorative-blob w-[500px] h-[500px] bg-primary/12 -top-20 -right-40 animate-float" />
        <div className="decorative-blob w-[400px] h-[400px] bg-teal-500/10 -bottom-20 -left-20 animate-float-reverse" />
        <div className="decorative-blob w-[300px] h-[300px] bg-pink-500/8 top-1/3 left-1/4 animate-pulse-glow" />
        
        {/* Floating Icons */}
        <div className="absolute top-20 right-1/4 text-primary/20 animate-float" style={{ animationDelay: '0.5s' }}>
          <Heart className="w-12 h-12" />
        </div>
        <div className="absolute bottom-1/4 left-1/5 text-teal-500/20 animate-float-reverse" style={{ animationDelay: '1s' }}>
          <Brain className="w-10 h-10" />
        </div>
        <div className="absolute top-1/2 right-1/6 text-pink-500/20 animate-float" style={{ animationDelay: '1.5s' }}>
          <Baby className="w-8 h-8" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 text-amber-500/20 animate-float-slow" style={{ animationDelay: '2s' }}>
          <Activity className="w-10 h-10" />
        </div>
        
        {/* Decorative Dots */}
        <div className="absolute top-32 right-1/3 w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-teal-500/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/6 w-2 h-2 rounded-full bg-pink-500/30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-sm font-medium text-primary animate-fade-in shadow-lg shadow-primary/5">
            <Sparkles className="h-4 w-4" />
            <span>Award-Winning Nursing Education Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight animate-fade-in animation-delay-100">
            Comprehensive Nursing
            <br />
            <span className="gradient-text-primary">Education for East Africa</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Access <span className="font-semibold text-foreground">{loading ? '400+' : counts.topics}+</span> nursing topics across{' '}
            <span className="font-semibold text-foreground">{loading ? '10' : counts.categories}</span> categories.
            From anatomy to paediatrics, prepare for your nursing career with our
            expertly curated educational content.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in animation-delay-300">
            <Button asChild size="lg" className="btn-primary-glow gap-2 h-13 px-9 text-base font-semibold">
              <Link href="/topics">
                <BookOpen className="h-5 w-5" />
                Browse All Topics
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="btn-outline-glow h-13 px-9 text-base font-semibold border-2">
              <Link href="/topics?category=anatomy-physiology">
                Start Learning
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-16 max-w-3xl mx-auto">
            <div 
              className="stat-card flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-lg animate-fade-in animation-delay-400"
              style={{ '--stat-color-start': 'oklch(0.55 0.2 275)', '--stat-color-end': 'oklch(0.5 0.18 290)' } as React.CSSProperties}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white mb-4 shadow-xl shadow-primary/30">
                <BookOpen className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold gradient-text-primary">{loading ? '...' : counts.topics}+</span>
              <span className="text-sm text-muted-foreground font-medium">Topics</span>
            </div>
            
            <div 
              className="stat-card flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-lg animate-fade-in animation-delay-500"
              style={{ '--stat-color-start': 'oklch(0.6 0.15 180)', '--stat-color-end': 'oklch(0.55 0.12 200)' } as React.CSSProperties}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white mb-4 shadow-xl shadow-teal-500/30">
                <Users className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold gradient-text-teal">{loading ? '...' : counts.categories}</span>
              <span className="text-sm text-muted-foreground font-medium">Categories</span>
            </div>
            
            <div 
              className="stat-card flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-lg animate-fade-in animation-delay-600"
              style={{ '--stat-color-start': 'oklch(0.65 0.18 320)', '--stat-color-end': 'oklch(0.6 0.15 340)' } as React.CSSProperties}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white mb-4 shadow-xl shadow-pink-500/30">
                <Stethoscope className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold gradient-text-accent">6</span>
              <span className="text-sm text-muted-foreground font-medium">Semesters</span>
            </div>
            
            <div 
              className="stat-card flex flex-col items-center p-6 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-lg animate-fade-in animation-delay-700"
              style={{ '--stat-color-start': 'oklch(0.7 0.15 75)', '--stat-color-end': 'oklch(0.65 0.12 60)' } as React.CSSProperties}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-4 shadow-xl shadow-amber-500/30">
                <Award className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{loading ? '...' : counts.images}+</span>
              <span className="text-sm text-muted-foreground font-medium">Images</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
