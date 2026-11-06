import { Metadata } from 'next';
import { getArticleBySlug } from '@/lib/store';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug || '');
  const article = await getArticleBySlug(decoded);

  if (!article) {
    return {
      title: 'บทความ AI Studio & Agent Tutorials',
      description: 'คลังบทความ ข่าวสาร และกรณีศึกษาการสร้าง AI Agent และ Automation',
    };
  }

  const title = article.title;
  const description = article.excerpt || article.title;
  const url = `https://ai-kevin-booking.vercel.app/articles/${encodeURIComponent(article.slug)}`;
  const image = article.coverImage || '/assets/brand-logo.png';

  return {
    title,
    description,
    keywords: article.tags || ['AI', 'ChatGPT', 'AI Agent'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'kevinaiagent.tech',
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt || article.createdAt,
      authors: [article.authorName || 'อ. Kevin (Sorachet N.)'],
      tags: article.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@sorachetn',
    },
  };
}

async function ArticleJsonLd({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug || '');
  const article = await getArticleBySlug(decoded);

  if (!article) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.title,
    image: [
      article.coverImage?.startsWith('http')
        ? article.coverImage
        : `https://ai-kevin-booking.vercel.app${article.coverImage || '/assets/brand-logo.png'}`,
    ],
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.authorName || 'อ. Kevin (Sorachet Ngamwilaidee)',
      jobTitle: 'Founder & Lead AI System Architect',
      url: 'https://www.linkedin.com/in/sorachetn/',
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'kevinaiagent.tech',
      url: 'https://ai-kevin-booking.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ai-kevin-booking.vercel.app/assets/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ai-kevin-booking.vercel.app/articles/${encodeURIComponent(article.slug)}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ArticleDetailLayout({ params, children }: Props) {
  return (
    <>
      <Suspense fallback={null}>
        <ArticleJsonLd params={params} />
      </Suspense>
      {children}
    </>
  );
}
