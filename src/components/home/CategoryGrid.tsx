'use client';

import Link from 'next/link';
import { 
  Heart, 
  Brain, 
  Baby, 
  Pill, 
  Building2, 
  Users, 
  BookOpen, 
  Stethoscope,
  Scale,
  Beaker,
  ArrowRight,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/lib/use-data';

const categoryIcons: Record<string, React.ElementType> = {
  'anatomy-physiology': Heart,
  'medical-surgical-nursing': Stethoscope,
  'pharmacology': Pill,
  'pediatric-nursing': Baby,
  'mental-health-nursing': Brain,
  'community-health': Building2,
  'maternal-child-health': Users,
  'nursing-fundamentals': BookOpen,
  'pathophysiology': Beaker,
  'research-ethics': Scale,
  'general-nursing': Activity,
  'emergency-nursing': AlertTriangle,
  'default': BookOpen,
};

const categoryGradients: Record<string, { from: string; to: string; shadow: string; color: string }> = {
  'anatomy-physiology': { from: 'from-rose-500', to: 'to-red-600', shadow: 'shadow-rose-500/30', color: '#f43f5e' },
  'medical-surgical-nursing': { from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/30', color: '#3b82f6' },
  'pharmacology': { from: 'from-emerald-500', to: 'to-green-600', shadow: 'shadow-emerald-500/30', color: '#10b981' },
  'pediatric-nursing': { from: 'from-pink-500', to: 'to-fuchsia-600', shadow: 'shadow-pink-500/30', color: '#ec4899' },
  'mental-health-nursing': { from: 'from-violet-500', to: 'to-purple-600', shadow: 'shadow-violet-500/30', color: '#8b5cf6' },
  'community-health': { from: 'from-orange-500', to: 'to-amber-600', shadow: 'shadow-orange-500/30', color: '#f97316' },
  'maternal-child-health': { from: 'from-cyan-500', to: 'to-teal-600', shadow: 'shadow-cyan-500/30', color: '#06b6d4' },
  'nursing-fundamentals': { from: 'from-slate-500', to: 'to-gray-600', shadow: 'shadow-slate-500/30', color: '#64748b' },
  'pathophysiology': { from: 'from-yellow-500', to: 'to-orange-600', shadow: 'shadow-yellow-500/30', color: '#eab308' },
  'research-ethics': { from: 'from-indigo-500', to: 'to-blue-600', shadow: 'shadow-indigo-500/30', color: '#6366f1' },
  'general-nursing': { from: 'from-primary', to: 'to-violet-600', shadow: 'shadow-primary/30', color: '#6366f1' },
  'emergency-nursing': { from: 'from-red-500', to: 'to-orange-600', shadow: 'shadow-red-500/30', color: '#ef4444' },
  'default': { from: 'from-slate-500', to: 'to-gray-600', shadow: 'shadow-slate-500/30', color: '#64748b' },
};

export function CategoryGrid() {
  const { categories, loading } = useData();

  const displayCategories = categories.length > 0 ? categories : [
    { id: 'anatomy-physiology', name: 'Anatomy & Physiology', count: 31, description: 'Body systems and structures' },
    { id: 'pediatric-nursing', name: 'Pediatric Nursing', count: 43, description: 'Child health nursing' },
    { id: 'mental-health-nursing', name: 'Mental Health', count: 32, description: 'Psychiatric nursing care' },
    { id: 'pharmacology', name: 'Pharmacology', count: 23, description: 'Drug therapy and medications' },
    { id: 'community-health', name: 'Community Health', count: 21, description: 'Public health nursing' },
    { id: 'medical-surgical-nursing', name: 'Medical-Surgical', count: 14, description: 'Clinical nursing practice' },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="decorative-blob w-[400px] h-[400px] bg-primary/5 top-0 right-0" />
        <div className="decorative-blob w-[300px] h-[300px] bg-teal-500/5 bottom-0 left-1/4" />
        <div className="decorative-blob w-[200px] h-[200px] bg-pink-500/5 top-1/2 right-1/3" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500/15 to-teal-500/5 border border-teal-500/20 text-sm font-medium text-teal-600 dark:text-teal-400 mb-5">
            <BookOpen className="h-4 w-4" />
            <span>Browse by Specialty</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            Explore Nursing <span className="gradient-text-teal">Categories</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Discover our comprehensive nursing curriculum organized by specialty areas,
            from foundational sciences to advanced clinical practice.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
          {displayCategories.slice(0, 10).map((category, index) => {
            const Icon = categoryIcons[category.id] || categoryIcons.default;
            const gradient = categoryGradients[category.id] || categoryGradients.default;

            return (
              <Link
                key={category.id}
                href={`/topics?category=${category.id}`}
                className="group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card 
                  className="category-card h-full border-2 border-transparent hover:border-primary/30 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 rounded-2xl overflow-hidden"
                  style={{ '--category-color': gradient.color } as React.CSSProperties}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient.from} ${gradient.to} text-white shadow-xl ${gradient.shadow} mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-sm md:text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {loading ? (
                        <span className="inline-block w-12 h-4 bg-muted animate-pulse rounded" />
                      ) : (
                        <span className="font-medium">{category.count} topics</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 hover:gap-3 transition-all duration-300 group"
          >
            View All Categories
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
