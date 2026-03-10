'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchSection() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      router.push(`/topics?search=${encodeURIComponent(query.trim())}`);
      setIsLoading(false);
    }
  };

  return (
    <section className="search-section py-10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="decorative-blob w-48 h-48 bg-primary/5 -top-10 left-1/4" />
      </div>

      <div className="container mx-auto px-4 relative">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors peer-focus:text-primary" />
              <Input
                type="search"
                placeholder="Search topics, categories, or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input pl-12 h-14 text-base bg-background border-muted-foreground/20 focus:border-primary/30 rounded-xl shadow-sm pr-4"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading || !query.trim()}
              className="h-14 px-6 btn-primary-glow rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="h-5 w-5 sm:ml-2" />
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Search across 457+ nursing topics in anatomy, pharmacology, paediatrics, and more</span>
          </div>
        </form>
      </div>
    </section>
  );
}
