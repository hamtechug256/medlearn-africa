import Link from 'next/link';
import { GraduationCap, Heart, BookOpen, Mail, MapPin, Code2, Github, Twitter, ExternalLink, Sparkles, Zap } from 'lucide-react';

// Static categories for footer
const mainCategories = [
  { id: 'anatomy-physiology', name: 'Anatomy & Physiology', count: 31 },
  { id: 'pediatric-nursing', name: 'Pediatric Nursing', count: 43 },
  { id: 'mental-health-nursing', name: 'Mental Health', count: 32 },
  { id: 'pharmacology', name: 'Pharmacology', count: 23 },
  { id: 'community-health', name: 'Community Health', count: 21 },
  { id: 'medical-surgical-nursing', name: 'Medical-Surgical', count: 14 },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-gradient border-t relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="decorative-blob w-[300px] h-[300px] bg-primary/5 -bottom-20 -right-20" />
        <div className="decorative-blob w-[200px] h-[200px] bg-teal-500/5 top-0 left-1/4" />
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-primary-foreground transition-transform duration-300 group-hover:scale-110 shadow-xl shadow-primary/30">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight gradient-text-primary">NurseEd Africa</span>
                <span className="text-xs text-muted-foreground">Nursing Education Platform</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A comprehensive nursing education platform for East African nurses. 
              Access 457+ topics across 10 categories to advance your nursing career.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-foreground">457</span>
                  <span className="ml-1">Topics</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/15 to-teal-500/5">
                  <Heart className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <span className="font-bold text-foreground">10</span>
                  <span className="ml-1">Categories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="font-bold text-foreground text-lg">Quick Links</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/topics" className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                All Topics
              </Link>
              <Link href="/topics?category=anatomy-physiology" className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                Anatomy & Physiology
              </Link>
              <Link href="/topics?category=pediatric-nursing" className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                Pediatric Nursing
              </Link>
              <Link href="/topics?category=mental-health-nursing" className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                Mental Health Nursing
              </Link>
              <Link href="/topics?category=pharmacology" className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                Pharmacology
              </Link>
              <Link href="/topics?category=community-health" className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                Community Health
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-5">
            <h3 className="font-bold text-foreground text-lg">Categories</h3>
            <nav className="flex flex-col gap-3">
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/topics?category=${category.id}`}
                  className="footer-link text-sm text-muted-foreground hover:text-primary transition-colors w-fit flex items-center gap-2 group"
                >
                  {category.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                    {category.count}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* About & Developer */}
          <div className="space-y-5">
            <h3 className="font-bold text-foreground text-lg">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This platform provides nursing education resources for healthcare professionals in East Africa.
            </p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>East Africa</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@nursedafrica.com</span>
              </div>
            </div>
            
            {/* Developer Credit - PROMINENT */}
            <div className="pt-5 border-t border-border/50">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/30">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Designed & Developed by</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold gradient-text-primary">Hamcodz</span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-14 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground">
              © {currentYear} NurseEd Africa. Educational content for nursing professionals.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                <span>for East African Nurses</span>
              </div>
            </div>
            
            {/* Developer Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Built by Hamcodz</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
