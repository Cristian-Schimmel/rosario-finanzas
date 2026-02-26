'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { Clock, ExternalLink, ChevronRight, Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/lib/services/unified-news-service';

// Strip HTML tags from text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Default fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop';

interface LatestNewsSectionProps {
  articles: NewsArticle[];
  showViewAll?: boolean;
}

export function LatestNewsSection({ articles, showViewAll = true }: LatestNewsSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Últimas Noticias
            </h2>
            <p className="text-xs text-text-muted">
              Noticias financieras en tiempo real
            </p>
          </div>
        </div>
        {showViewAll && (
          <Link
            href="/noticias"
            className="text-sm text-accent hover:text-accent-dark flex items-center gap-1 transition-colors"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.slice(0, 8).map((article) => (
          <ExternalNewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}

interface ExternalNewsCardProps {
  article: NewsArticle;
  compact?: boolean;
}

export function ExternalNewsCard({ article, compact = false }: ExternalNewsCardProps) {
  const [imgSrc, setImgSrc] = useState(article.imageUrl || FALLBACK_IMAGE);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <Link href={`/noticias/${article.slug}`} className="group block h-full">
      <Card className="overflow-hidden h-full hover:shadow-lg transition-all hover:border-accent/30">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-surface-secondary">
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={handleImageError}
            unoptimized={imgError}
          />
          {/* Source Badge */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="default" 
              size="sm"
              className="bg-white/90 dark:bg-slate-900/90 text-text-secondary text-2xs backdrop-blur-sm"
            >
              <ExternalLink className="w-2.5 h-2.5 mr-1" />
              {article.source}
            </Badge>
          </div>
          {/* Category Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="accent" size="sm">
              {article.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-text-primary dark:text-white group-hover:text-accent transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          
          {!compact && article.excerpt && (
            <p className="text-xs text-text-secondary line-clamp-2 mb-2">
              {stripHtml(article.excerpt)}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(article.publishedAt)}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Horizontal variant for sidebar
export function ExternalNewsCardHorizontal({ article }: { article: NewsArticle }) {
  const [imgSrc, setImgSrc] = useState(article.imageUrl || FALLBACK_IMAGE);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <Link href={`/noticias/${article.slug}`} className="group block">
      <div className="flex gap-3 p-2 rounded-lg hover:bg-interactive-hover transition-colors">
        <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            className="object-cover"
            sizes="64px"
            onError={handleImageError}
            unoptimized={imgError}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-1">
            <Badge variant="default" size="sm" className="text-2xs py-0 px-1">
              {article.source}
            </Badge>
          </div>
          <h4 className="text-xs font-medium text-text-primary dark:text-white group-hover:text-accent line-clamp-2 transition-colors">
            {article.title}
          </h4>
          <span className="text-2xs text-text-muted">
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
