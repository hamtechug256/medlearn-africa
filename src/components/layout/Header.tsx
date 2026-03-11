'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, BookOpen, GraduationCap, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/topics?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight gradient-text-primary">NurseEd Africa</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Nursing Education Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/topics"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 rounded-xl hover:text-primary hover:bg-primary/5"
            >
              <BookOpen className="h-4 w-4" />
              All Topics
            </Link>
            <Link
              href="/topics?category=anatomy-physiology"
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 rounded-xl hover:text-primary hover:bg-primary/5"
            >
              Anatomy
            </Link>
            <Link
              href="/topics?category=medical-surgical-nursing"
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 rounded-xl hover:text-primary hover:bg-primary/5"
            >
              Medical-Surgical
            </Link>
            <Link
              href="/topics?category=pediatric-nursing"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 rounded-xl hover:text-primary hover:bg-primary/5"
            >
              <Heart className="h-4 w-4" />
              Paediatrics
            </Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className={`relative group transition-all duration-300 ${searchFocused ? 'w-72' : 'w-56'}`}>
                <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input
                  type="search"
                  placeholder="Search topics..."
                  className={`w-full pl-10 h-10 bg-muted/50 border-transparent rounded-xl transition-all duration-300 ${searchFocused ? 'bg-background border-primary/30 ring-2 ring-primary/10' : 'hover:border-border/50 focus:border-primary/30'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </form>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search topics..."
                  className="w-full pl-10 h-11 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              <Link
                href="/topics"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4 text-primary" />
                All Topics
              </Link>
              <Link
                href="/topics?category=anatomy-physiology"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Anatomy & Physiology
              </Link>
              <Link
                href="/topics?category=medical-surgical-nursing"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Medical-Surgical Nursing
              </Link>
              <Link
                href="/topics?category=pediatric-nursing"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-4 w-4 text-primary" />
                Paediatric Nursing
              </Link>
              <Link
                href="/topics?category=mental-health-nursing"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mental Health Nursing
              </Link>
              <Link
                href="/topics?category=pharmacology"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pharmacology
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
