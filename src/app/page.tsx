import { Hero } from '@/components/home/Hero';
import { FeaturedTopics } from '@/components/home/FeaturedTopics';
import { SemesterCards } from '@/components/home/SemesterCards';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { SearchSection } from '@/components/home/SearchSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SearchSection />
      <FeaturedTopics />
      <SemesterCards />
      <CategoryGrid />
      
      {/* CTA Section */}
      <section className="cta-gradient py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90">
              <Sparkles className="h-4 w-4" />
              <span>Start Your Journey Today</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Advance Your{' '}
              <span className="text-amber-300">Nursing Career</span>?
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Access comprehensive nursing education materials covering all major topics 
              in the nursing curriculum. Perfect for students and professionals alike.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 text-base gap-2 shadow-lg shadow-black/10">
                <Link href="/topics">
                  <BookOpen className="h-5 w-5" />
                  Browse All Topics
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-base">
                <Link href="/topics?category=anatomy-physiology">
                  Start Learning
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
