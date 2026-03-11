'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, BookOpen, Brain, Laptop, Leaf, Activity, ClipboardList, 
  Stethoscope, Wind, Droplets, Zap, Eye, Headphones, Scissors, 
  Syringe, Users, FileSearch, Briefcase, Shield, Baby, Pill, Hand,
  ArrowRight
} from 'lucide-react';
import type { CourseUnit } from '@/lib/types';

interface CourseUnitCardProps {
  courseUnit: CourseUnit;
  topicCount: number;
  onClick: () => void;
}

// Icon mapping for course units
const iconMap: Record<string, React.ElementType> = {
  Heart,
  BookOpen,
  Brain,
  Laptop,
  Leaf,
  Activity,
  ClipboardList,
  Stethoscope,
  Wind,
  Droplets,
  Zap,
  Eye,
  Headphones,
  Scissors,
  Syringe,
  Users,
  FileSearch,
  Briefcase,
  Shield,
  Baby,
  Pill,
  Hand,
};

export function CourseUnitCard({ courseUnit, topicCount, onClick }: CourseUnitCardProps) {
  const Icon = iconMap[courseUnit.icon] || BookOpen;
  
  return (
    <Card
      className="course-unit-card group h-full border-2 border-transparent hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Color accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: courseUnit.color }}
      />
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
            style={{ backgroundColor: courseUnit.color }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge 
              variant="outline" 
              className="text-xs font-mono mb-2"
              style={{ borderColor: courseUnit.color, color: courseUnit.color }}
            >
              {courseUnit.code}
            </Badge>
            <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
              {courseUnit.name}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {courseUnit.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" style={{ color: courseUnit.color }} />
            <span className="font-medium">{topicCount}</span>
            <span>topics</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2" style={{ color: courseUnit.color }}>
            <span>View Topics</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
