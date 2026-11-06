import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ai-kevin-booking.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/admin',
          '/dashboard',
          '/auth/callback',
          '/api/checkout',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'ChatGPT-User',
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Anthropic-AI',
          'Bytespider',
        ],
        allow: '/',
        disallow: [
          '/admin',
          '/api/admin',
          '/dashboard',
          '/auth/callback',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
