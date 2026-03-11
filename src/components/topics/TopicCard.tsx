'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import type { Topic } from '@/lib/types';
import { semesters } from '@/lib/types';

interface TopicCardProps {
  topic: Topic;
}

// Semester color mapping
const semesterColors: Record<string, { bg: string; text: string; border: string }> = {
  'year-1-semester-1': { bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  'year-1-semester-2': { bg: 'bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/30' },
  'year-2-semester-1': { bg: 'bg-teal-500/15', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30' },
  'year-2-semester-2': { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  'year-3-semester-1': { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/30' },
  'year-3-semester-2': { bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' },
};

// Detect semester from topic title
function detectSemester(topic: Topic): string | null {
  const title = topic.title.toLowerCase();
  const description = topic.description.toLowerCase();
  const combined = `${title} ${description}`;

  const keywordMap: Record<string, string[]> = {
    'year-1-semester-1': ['anatomy', 'physiology', 'sociology', 'psychology', 'ethics', 'ethical', 'microbiology', 'environmental', 'computer', 'internet', 'atoms', 'cells', 'tissues', 'skeletal', 'muscular', 'history of nursing', 'hygiene', 'safety'],
    'year-1-semester-2': ['nursing process', 'assessment', 'pharmacology', 'drug', 'medication', 'injection', 'fluid', 'electrolyte', 'iv therapy', 'blood transfusion', 'wound', 'dressing', 'aseptic', 'infection prevention', 'peri-operative', 'surgical nursing'],
    'year-2-semester-1': ['cardiovascular', 'heart', 'hypertension', 'cardiac', 'respiratory', 'lung', 'pneumonia', 'asthma', 'tuberculosis', 'gastrointestinal', 'stomach', 'intestine', 'liver', 'peptic', 'renal', 'kidney', 'urinary', 'catheter', 'hemorrhage', 'bleeding'],
    'year-2-semester-2': ['nervous', 'neurological', 'brain', 'spinal', 'stroke', 'epilepsy', 'meningitis', 'endocrine', 'diabetes', 'thyroid', 'hormone', 'musculoskeletal', 'fracture', 'arthritis', 'orthopedic', 'eye', 'ophthalmology', 'ear', 'nose', 'throat', 'ent', 'vision', 'hearing'],
    'year-3-semester-1': ['community', 'public health', 'primary health care', 'phc', 'family planning', 'research', 'proposal', 'methodology', 'leadership', 'management', 'supervision', 'occupational health', 'workplace', 'disaster'],
    'year-3-semester-2': ['pediatric', 'paediatric', 'child', 'infant', 'newborn', 'neonatal', 'mental health', 'psychiatric', 'psychosis', 'depression', 'schizophrenia', 'maternal', 'obstetric', 'pregnancy', 'antenatal', 'postnatal', 'emergency nursing', 'trauma', 'shock', 'first aid', 'resuscitation']
  };

  for (const [semesterId, keywords] of Object.entries(keywordMap)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return semesterId;
      }
    }
  }

  return null;
}

export function TopicCard({ topic }: TopicCardProps) {
  const semester = detectSemester(topic);
  const semesterInfo = semester ? semesters.find(s => s.id === semester) : null;
  const semesterColor = semester ? semesterColors[semester] : null;

  return (
    <Link href={`/topic/${topic.id}`}>
      <Card className="topic-card group h-full border-2 border-transparent hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-500 rounded-2xl overflow-hidden">
        {/* Semester indicator bar */}
        {semester && semesterColor && (
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${semesterColor.bg}`} />
        )}

        <CardContent className="p-5">
          {/* Content */}
          <div className="space-y-3">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-medium border-primary/20 text-primary bg-primary/5">
                {topic.category}
              </Badge>
              {semester && semesterInfo && semesterColor && (
                <Badge className={`text-xs font-medium ${semesterColor.bg} ${semesterColor.text} ${semesterColor.border}`}>
                  {semesterInfo.name}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {topic.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {topic.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary/70" />
                  <span className="font-medium">{topic.wordCount?.toLocaleString() || '0'} words</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary/70" />
                  <span>{Math.ceil((topic.wordCount || 0) / 200)} min read</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                <span>Read</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
