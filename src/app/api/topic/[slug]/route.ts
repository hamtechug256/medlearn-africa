import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const topicsDir = path.join(process.cwd(), 'data', 'topics');
const dataDir = path.join(process.cwd(), 'data');

// Load images map for local image paths
let imagesMap: Record<string, string> | null = null;

function getImagesMap(): Record<string, string> {
  if (imagesMap) return imagesMap;

  try {
    const imagesMapPath = path.join(dataDir, 'images-map.json');
    imagesMap = JSON.parse(fs.readFileSync(imagesMapPath, 'utf-8'));
    return imagesMap || {};
  } catch {
    return {};
  }
}

// Replace external image URLs with local paths
function replaceImageUrls(content: string): string {
  const map = getImagesMap();

  for (const [externalUrl, localPath] of Object.entries(map)) {
    // Escape special regex characters in URL
    const escapedUrl = externalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(escapedUrl, 'g'), localPath);
  }

  // Remove any remaining external image URLs
  content = content.replace(
    /src=["'](https?:\/\/(?:www\.)?(?:nursesrevisionuganda\.com|mothersgarage\.ug)[^"']*)["']/gi,
    'src="/images/placeholder.png"'
  );

  // Remove logo/branding images from content
  // Remove images with logo-related patterns in src
  const logoPatterns = ['pupo', 'logo', 'Midwives-Revision', 'blue.png', 'MidwivesRevision'];
  for (const pattern of logoPatterns) {
    // Remove entire img tag if it contains the pattern
    const imgRegex = new RegExp(`<img[^>]*${pattern}[^>]*>`, 'gi');
    content = content.replace(imgRegex, '');
  }

  // Remove small images (icons, logos) - typically 150x150 or smaller
  content = content.replace(/<img[^>]*src=["'][^"']*(\d{1,3})x(\d{1,3})[^"']*["'][^>]*>/gi, (match, w, h) => {
    if (parseInt(w) <= 150 || parseInt(h) <= 150) {
      return '';
    }
    return match;
  });

  return content;
}

// Extract and clean educational content from HTML
function processContent(html: string): string {
  if (!html) return '';

  let content = html;

  // Extract entry-content div (main article)
  const entryMatch = content.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/article|<footer|<nav)/i);
  if (entryMatch) {
    content = entryMatch[1];
  }

  // Extract all text-editor widget content (educational sections)
  const textEditorMatch = content.match(/<div[^>]*class="[^"]*elementor-widget-text-editor[^"]*"[^>]*>[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi);
  if (textEditorMatch && textEditorMatch.length > 0) {
    content = textEditorMatch.map(m => {
      const inner = m.match(/<div class="elementor-widget-container">([\s\S]*?)<\/div>/i);
      return inner ? inner[1] : '';
    }).join('\n');
  }

  // Clean up content
  content = content
    // Remove unwanted elements
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ins[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*id="[^"]*nr-fixed-header[^"]*"[^>]*>[\s\S]*?<\/header>/gi, '')

    // Remove external links to nursesrevisionuganda.com - convert to plain text
    .replace(/<a[^>]*href=["']https?:\/\/(?:www\.)?nursesrevisionuganda\.com[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<a[^>]*href=["']https?:\/\/(?:www\.)?mothersgarage\.ug[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, '$1')

    // Remove all external links (keep internal anchors)
    .replace(/<a[^>]*href=["']https?:\/\/(?!localhost)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, '$2')

    // Remove "click here" patterns and similar call-to-action texts
    .replace(/<a[^>]*>\s*click\s+here\s*<\/a>/gi, '')
    .replace(/<a[^>]*>\s*Click\s+Here\s*<\/a>/gi, '')
    .replace(/<a[^>]*>\s*CLICK\s+HERE\s*<\/a>/gi, '')
    .replace(/click\s+here\s+to\s+(?:read|view|see|download|access)[^<.]*/gi, '')
    .replace(/Click\s+Here\s+to\s+(?:read|view|see|download|access)[^<.]*/gi, '')
    .replace(/CLICK\s+HERE\s+TO\s+(?:READ|VIEW|SEE|DOWNLOAD|ACCESS)[^<.]*/gi, '')
    .replace(/(?:click|tap)\s+here[^<.]*(?:\.|<)/gi, '$1')
    .replace(/Click here(?:\s+for\s+more\s+information)?(?:\.|<)/gi, '$1')
    .replace(/\s*click here\s*/gi, ' ')

    // Remove "read more" links
    .replace(/<a[^>]*>\s*read\s+more\s*<\/a>/gi, '')
    .replace(/<a[^>]*>\s*Read\s+More\s*<\/a>/gi, '')
    .replace(/\[\s*read\s+more\s*\]/gi, '')
    .replace(/\[\s*Read\s+More\s*\]/gi, '')

    // Remove share buttons and social links
    .replace(/<div[^>]*class="[^"]*(?:share|social|facebook|twitter|whatsapp|linkedin)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<a[^>]*class="[^"]*(?:share|social|facebook|twitter|whatsapp|linkedin)[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')

    // Remove "related posts" and "you might also like" sections
    .replace(/<div[^>]*class="[^"]*(?:related-posts|related-articles|you-might-also)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<section[^>]*class="[^"]*(?:related-posts|related-articles)[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')

    // Remove elementor wrapper divs but keep content
    .replace(/<div[^>]*class="elementor-(section|column|container|widget-wrap)"[^>]*>/gi, '<div>')
    .replace(/<div[^>]*data-elementor[^>]*>/gi, '<div>')
    .replace(/<div[^>]*class="elementor-widget-container">/gi, '<div>')

    // Remove data attributes
    .replace(/\sdata-[a-z-]+="[^"]*"/gi, '')
    .replace(/\sclass="elementor[^"]*"/gi, '')

    // Clean up empty divs
    .replace(/<div>\s*<\/div>/gi, '')
    .replace(/<div>\s*<div>/gi, '<div>')
    .replace(/<\/div>\s*<\/div>/gi, '</div>')

    // Fix heading styles - remove inline styles but keep the styling classes we want
    .replace(/<h([2-4])[^>]*style="[^"]*"[^>]*>/gi, '<h$1>')
    .replace(/<h([2-4])[^>]*class="nr-h([2-4])"[^>]*>/gi, '<h$1>')
    .replace(/<div[^>]*class="nr-h([2-4])"[^>]*>/gi, '<h$1>')

    // Clean up span styles - keep highlighting classes
    .replace(/<span[^>]*class="nr-bg-yellow"[^>]*>/gi, '<span class="nr-bg-yellow">')
    .replace(/<span[^>]*class="nr-bg-green"[^>]*>/gi, '<span class="nr-bg-green">')
    .replace(/<span[^>]*class="nr-h3-pink-bg"[^>]*>/gi, '<h3 class="nr-h3-pink-bg">')

    // Remove empty spans
    .replace(/<span>\s*<\/span>/gi, '')

    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+/g, ' ')

    // Fix lists
    .replace(/<ul[^>]*class="nr-ul"[^>]*>/gi, '<ul>')
    .replace(/<ol[^>]*class="nr-ol"[^>]*>/gi, '<ol>')
    .replace(/<li[^>]*role="presentation"[^>]*>/gi, '<li>')

    // Remove remaining unwanted classes and styles
    .replace(/\sclass="[^"]*"/gi, (match: string) => {
      // Keep our custom classes
      if (match.includes('nr-bg-') || match.includes('nr-h3-pink-bg')) {
        return match;
      }
      return '';
    })
    .replace(/\sstyle="[^"]*"/gi, '')

    // Remove any remaining href attributes pointing to external sites
    .replace(/\s*href=["']https?:\/\/(?!localhost|#)[^"']*["']/gi, '')

    // Clean up orphaned link tags
    .replace(/<a[^>]*>\s*<\/a>/gi, '')
    .replace(/<a(?![^>]*href=)[^>]*>/gi, '')

    // Remove "source:" references
    .replace(/(?:source|reference|ref):\s*https?:\/\/[^\s<]*/gi, '')
    .replace(/(?:Source|Reference|Ref):\s*https?:\/\/[^\s<]*/gi, '')

    // Clean up
    .replace(/>\s+</g, '><')
    .trim();

  // Replace external image URLs with local paths
  content = replaceImageUrls(content);

  return content;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const topicFile = path.join(topicsDir, `${slug}.json`);
    
    if (!fs.existsSync(topicFile)) {
      return NextResponse.json(
        { success: false, error: 'Topic not found' },
        { status: 404 }
      );
    }
    
    const topic = JSON.parse(fs.readFileSync(topicFile, 'utf-8'));

    // Process content for clean display
    const processedContent = processContent(topic.content);

    return NextResponse.json({
      success: true,
      data: {
        ...topic,
        processedContent: processedContent || topic.content,
        readingTime: Math.ceil((topic.wordCount || 500) / 200)
      }
    });
  } catch (error) {
    console.error('Topic API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load topic' },
      { status: 500 }
    );
  }
}
