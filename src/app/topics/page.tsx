'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, BookOpen, GraduationCap, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TopicCard } from '@/components/topics/TopicCard';
import { CourseUnitCard } from '@/components/topics/CourseUnitCard';
import { useData } from '@/lib/use-data';
import type { Topic } from '@/lib/types';
import { semesters, courseUnitsData, getCourseUnitForTopic } from '@/lib/types';

function TopicsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Semester colors
const semesterColors: Record<string, { bg: string; text: string; border: string }> = {
  'year-1-semester-1': { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'year-1-semester-2': { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  'year-2-semester-1': { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  'year-2-semester-2': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  'year-3-semester-1': { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  'year-3-semester-2': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

function TopicsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { topics, categories, loading } = useData();

  const semesterFromUrl = searchParams.get('semester') || 'all';
  const courseUnitFromUrl = searchParams.get('courseUnit') || 'all';
  const categoryFromUrl = searchParams.get('category') || 'all';
  const searchFromUrl = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState<'title' | 'count'>('title');

  // Derive semester and course unit from URL directly (no state needed)
  const selectedSemester = semesterFromUrl;
  const selectedCourseUnit = courseUnitFromUrl;

  // Get current course units for selected semester
  const currentCourseUnits = useMemo(() => {
    if (selectedSemester === 'all') return [];
    return courseUnitsData.filter(cu => cu.semesterId === selectedSemester);
  }, [selectedSemester]);

  // Determine view mode
  const viewMode = useMemo(() => {
    if (selectedSemester === 'all') return 'semesters';
    if (selectedCourseUnit === 'all') return 'courseUnits';
    return 'topics';
  }, [selectedSemester, selectedCourseUnit]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    let topicsList: Topic[] = [...topics];

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        topicsList = topicsList.filter(t => t.category === category.name);
      }
    }

    // Filter by course unit (most specific)
    if (selectedCourseUnit && selectedCourseUnit !== 'all') {
      const courseUnit = courseUnitsData.find(cu => cu.id === selectedCourseUnit);
      if (courseUnit) {
        topicsList = topicsList.filter(t => {
          const topicText = `${t.title} ${t.description}`.toLowerCase();
          return courseUnit.keywords.some(keyword => topicText.includes(keyword.toLowerCase()));
        });
      }
    } else if (selectedSemester && selectedSemester !== 'all') {
      // Filter by semester only
      const semesterCourseUnits = courseUnitsData.filter(cu => cu.semesterId === selectedSemester);
      const allKeywords = semesterCourseUnits.flatMap(cu => cu.keywords);
      topicsList = topicsList.filter(t => {
        const topicText = `${t.title} ${t.description}`.toLowerCase();
        return allKeywords.some(keyword => topicText.includes(keyword.toLowerCase()));
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      topicsList = topicsList.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.category.toLowerCase().includes(lowerQuery) ||
          t.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    if (sortBy === 'title') {
      topicsList.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      topicsList.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0));
    }

    return topicsList;
  }, [selectedCategory, searchQuery, sortBy, topics, categories, selectedSemester, selectedCourseUnit]);

  // Calculate topics per course unit
  const courseUnitTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    courseUnitsData.forEach(cu => {
      counts[cu.id] = 0;
    });
    
    topics.forEach(topic => {
      const courseUnitId = getCourseUnitForTopic(topic.title, topic.description);
      if (courseUnitId && counts[courseUnitId] !== undefined) {
        counts[courseUnitId]++;
      }
    });
    
    return counts;
  }, [topics]);

  // Calculate topics per semester for tabs
  const semesterTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    semesters.forEach(sem => {
      counts[sem.id] = 0;
    });
    
    topics.forEach(topic => {
      const topicText = `${topic.title} ${topic.description}`.toLowerCase();
      
      for (const cu of courseUnitsData) {
        const hasKeyword = cu.keywords.some(keyword => topicText.includes(keyword.toLowerCase()));
        if (hasKeyword) {
          counts[cu.semesterId] = (counts[cu.semesterId] || 0) + 1;
          break;
        }
      }
    });
    
    return counts;
  }, [topics]);

  // Navigation handlers
  const handleSemesterSelect = (semesterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('semester', semesterId);
    params.delete('courseUnit');
    router.push(`/topics?${params.toString()}`);
  };

  const handleCourseUnitSelect = (courseUnitId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('courseUnit', courseUnitId);
    router.push(`/topics?${params.toString()}`);
  };

  const handleBack = () => {
    if (viewMode === 'topics') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('courseUnit');
      router.push(`/topics?${params.toString()}`);
    } else if (viewMode === 'courseUnits') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('semester');
      params.delete('courseUnit');
      router.push(`/topics?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    router.push('/topics');
  };

  const hasActiveFilters = searchQuery || (selectedCategory && selectedCategory !== 'all');

  const selectedCategoryName = selectedCategory && selectedCategory !== 'all'
    ? categories.find(c => c.id === selectedCategory)?.name
    : null;

  const selectedSemesterName = selectedSemester && selectedSemester !== 'all'
    ? semesters.find(s => s.id === selectedSemester)?.name
    : null;

  const selectedCourseUnitData = selectedCourseUnit && selectedCourseUnit !== 'all'
    ? courseUnitsData.find(cu => cu.id === selectedCourseUnit)
    : null;

  const semesterColor = selectedSemester && selectedSemester !== 'all'
    ? semesterColors[selectedSemester]
    : null;

  if (loading) {
    return <TopicsLoading />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="hero-gradient py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="decorative-blob w-64 h-64 bg-primary/10 top-0 right-0" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back button */}
              {viewMode !== 'semesters' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-10 w-10 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {selectedCourseUnitData?.name || selectedSemesterName || 'All Topics'}
                </h1>
                {selectedCourseUnitData && (
                  <p className="text-muted-foreground mt-1">
                    {selectedCourseUnitData.code} • {selectedSemesterName}
                  </p>
                )}
              </div>
            </div>
            {viewMode === 'topics' && (
              <p className="text-muted-foreground text-lg hidden md:block">
                {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Semester Tabs & Search */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-16 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Semester Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              <button
                onClick={() => handleSemesterSelect('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSemester === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All Semesters
              </button>
              {semesters.map((sem) => {
                const colors = semesterColors[sem.id];
                const isActive = selectedSemester === sem.id;
                const count = semesterTopicCounts[sem.id] || 0;
                
                return (
                  <button
                    key={sem.id}
                    onClick={() => handleSemesterSelect(sem.id)}
                    style={{ 
                      backgroundColor: isActive ? colors.bg : 'transparent',
                      borderColor: isActive ? colors.border : 'transparent',
                      color: isActive ? colors.text : undefined
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive ? 'border' : ''
                    }`}
                  >
                    {sem.name.replace('Year ', 'Y').replace(' Semester ', ' Sem ')}
                    {count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-muted'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search topics..."
                className="pl-10 h-11 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            {viewMode === 'topics' && (
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'title' | 'count')}>
                  <SelectTrigger className="w-[130px] h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">A-Z</SelectItem>
                    <SelectItem value="count">Most Words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && viewMode === 'topics' && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t mt-3">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                  {selectedCategoryName}
                  <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Course Units View */}
        {viewMode === 'courseUnits' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Select a Course Unit</h2>
              <p className="text-muted-foreground">
                Choose a course unit to view its topics
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCourseUnits.map((courseUnit) => {
                const count = courseUnitTopicCounts[courseUnit.id] || 0;
                return (
                  <CourseUnitCard
                    key={courseUnit.id}
                    courseUnit={courseUnit}
                    topicCount={count}
                    onClick={() => handleCourseUnitSelect(courseUnit.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Topics View */}
        {viewMode === 'topics' && (
          <>
            {filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    <TopicCard topic={topic} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-3">No topics found</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <Button onClick={clearFilters} className="btn-primary-glow">Clear Filters</Button>
              </div>
            )}
          </>
        )}

        {/* Semesters Overview View */}
        {viewMode === 'semesters' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Browse by Semester</h2>
              <p className="text-muted-foreground">
                Select a semester tab above to explore course units and topics
              </p>
            </div>
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a Semester</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Use the semester tabs above to browse course units and their topics.
                Each semester contains multiple course units with comprehensive learning materials.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={<TopicsLoading />}>
      <TopicsContent />
    </Suspense>
  );
}
