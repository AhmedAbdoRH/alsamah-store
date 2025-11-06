// Netlify Edge Function for Prerender.io integration
// This intercepts requests and serves prerendered content to crawlers

const PRERENDER_TOKEN = 'V85u5WS8kbxdXKCF5KuR';
const PRERENDER_URL = 'https://service.prerender.io';
const SITE_URL = 'https://alsamah-store.com';

// List of crawler user agents that should be prerendered
const CRAWLER_AGENTS = [
  'Prerender',
  'Googlebot',
  'Bingbot',
  'Yandex',
  'DuckDuckBot',
  'Baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'Applebot',
  'WhatsApp',
  'Telegram',
  'Discordbot',
  'Instagram',
  'Google-InspectionTool',
];

function isCrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return CRAWLER_AGENTS.some(agent => lowerUA.includes(agent.toLowerCase()));
}

function isStaticAsset(path: string): boolean {
  return /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|xml|txt|webp|mp4|mp3)$/i.test(path);
}

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || request.headers.get('User-Agent') || '';
  const path = url.pathname;
  const search = url.search;

  // Skip static assets and API routes - let them pass through normally
  if (isStaticAsset(path) || path.startsWith('/.netlify/') || path.startsWith('/api/')) {
    // Return undefined to let the request pass through
    return;
  }

  // Check if request is from a crawler
  if (isCrawler(userAgent)) {
    const prerenderUrl = `${PRERENDER_URL}/${SITE_URL}${path}${search}`;
    
    try {
      const response = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': PRERENDER_TOKEN,
          'User-Agent': userAgent,
        },
      });

      if (response.ok) {
        const html = await response.text();
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'X-Prerender': 'true',
          },
        });
      }
    } catch (error) {
      console.error('Prerender.io error:', error);
      // Fall through to normal request handling
    }
  }

  // For non-crawlers or if prerender fails, continue with normal request
  // Return undefined to let the request pass through to the origin
  return;
};

