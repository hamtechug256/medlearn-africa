'use client';

import Link from 'next/link';
import { GraduationCap, BookOpen, ArrowRight, Clock, Heart, Brain, Activity, Baby, Users, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { semesters } from '@/lib/types';
import { useEffect, useState } from 'react';

// Icon mapping for semesters
const semesterIcons: Record<string, React.ElementType> = {
  'year-1-semester-1': Heart,
  'year-1-semester-2': Stethoscope,
  'year-2-semester-1': Activity,
  'year-2-semester-2': Brain,
  'year-3-semester-1': Users,
  'year-3-semester-2': Baby,
};

const semesterThemes = [
  { gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/25', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', progress: 'bg-indigo-500' },
  { gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25', bg: 'bg-violet-500/5', border: 'border-violet-500/20', progress: 'bg-violet-500' },
  { gradient: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/25', bg: 'bg-teal-500/5', border: 'border-teal-500/20', progress: 'bg-teal-500' },
  { gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25', bg: 'bg-amber-500/5', border: 'border-amber-500/20', progress: 'bg-amber-500' },
  { gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/25', bg: 'bg-pink-500/5', border: 'border-pink-500/20', progress: 'bg-pink-500' },
  { gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/25', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', progress: 'bg-cyan-500' },
];

// Estimated topic counts per semester (based on keyword matching)
const semesterTopicEstimates: Record<string, number> = {
  'year-1-semester-1': 78,
  'year-1-semester-2': 62,
  'year-2-semester-1': 85,
  'year-2-semester-2': 72,
  'year-3-semester-1': 68,
  'year-3-semester-2': 92,
};

const totalTopics = 457;

export function SemesterCards() {
  const [mounted, setMounted] = useState(false);
  const [animatedCounts, setAnimatedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const newCounts: Record<string, number> = {};
      Object.entries(semesterTopicEstimates).forEach(([id, target]) => {
        newCounts[id] = Math.round(target * easeOut);
      });
      setAnimatedCounts(newCounts);

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedCounts(semesterTopicEstimates);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [mounted]);

  return (
    <section className="py-24 relative overflow-hidden bg-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="decorative-blob w-[400px] h-[400px] bg-primary/5 -top-20 -left-20" />
        <div className="decorative-blob w-[300px] h-[300px] bg-teal-500/5 bottom-0 right-0" />
        <div className="decorative-blob w-[200px] h-[200px] bg-pink-500/5 top-1/2 left-1/2" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-sm font-medium text-primary mb-5">
            <GraduationCap className="h-4 w-4" />
            <span>3-Year Diploma Curriculum</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            Organized by <span className="gradient-text-primary">Semester</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Our comprehensive curriculum spans 6 semesters covering all aspects of nursing education,
            from foundational sciences to specialized clinical practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {semesters.map((semester, index) => {
            const theme = semesterThemes[index];
            const Icon = semesterIcons[semester.id] || GraduationCap;
            const topicCount = animatedCounts[semester.id] || semesterTopicEstimates[semester.id] || 0;
            const progress = Math.round((topicCount / totalTopics) * 100);
            
            return (
              <Link
                key={semester.id}
                href={`/topics?semester=${semester.id}`}
                className="block"
              >
                <Card
                  className={`semester-card group relative overflow-hidden border-2 ${theme.border} ${theme.bg} hover:border-primary/40 transition-all duration-500 rounded-2xl cursor-pointer`}
                  style={{ 
                    '--semester-start': `oklch(0.6 0.15 ${170 + index * 25})`, 
                    '--semester-end': `oklch(0.55 0.12 ${185 + index * 25})` 
                  } as React.CSSProperties}
                >
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradient}`} />

                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-xl ${theme.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 flex-shrink-0`}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">
                          {semester.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                          <Clock className="h-3.5 w-3.5" />
                          Year {semester.year} • Semester {semester.semester}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-5">
                    <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {semester.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Topics Coverage</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="semester-progress">
                        <div 
                          className={`semester-progress-bar ${theme.progress}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className={`h-4 w-4 ${theme.progress.replace('bg-', 'text-')}`} />
                        <span className="font-semibold">{topicCount}</span>
                        <span className="text-muted-foreground">topics</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
