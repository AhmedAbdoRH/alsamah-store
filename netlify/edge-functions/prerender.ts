// Netlify Edge Function for Prerender.io integration
// This intercepts requests and serves prerendered content to crawlers using Prerender.io

// You can set these in Netlify Environment Variables
const PRERENDER_TOKEN = Deno.env.get('PRERENDER_TOKEN') || 'V85u5WS8kbxdXKCF5KuR';
const PRERENDER_URL = 'https://service.prerender.io';
const SITE_URL = 'https://alsamah-store.com';

// List of crawler user agents that should be prerendered
const CRAWLER_AGENTS = [
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
  'Prerender',
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

  // Debugging header to confirm Edge Function is executing
  const debugHeaders = {
    'X-Edge-Function-Processed': 'true',
    'X-Edge-Is-Crawler': isCrawler(userAgent).toString(),
  };

  // Skip static assets and API routes - let them pass through normally
  if (isStaticAsset(path) || path.startsWith('/.netlify/') || path.startsWith('/api/')) {
    return;
  }

  // Check if request is from a crawler
  if (isCrawler(userAgent)) {
    // Prerender.io URL format: service.prerender.io/https://example.com
    const targetUrl = request.url;
    const prerenderUrl = `${PRERENDER_URL}/${targetUrl}`;
    
    debugHeaders['X-Prerender-URL'] = prerenderUrl;
    
    try {
      console.log(`Prerendering for crawler: ${userAgent} -> ${prerenderUrl}`);
      
      const response = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': PRERENDER_TOKEN,
          'User-Agent': userAgent,
        },
        signal: AbortSignal.timeout(10000), 
      });

      debugHeaders['X-Prerender-Fetch-Status'] = response.status.toString();

      if (response.ok) {
        const html = await response.text();
        return new Response(html, {
          status: 200,
          headers: {
            ...debugHeaders,
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'X-Prerender': 'true',
            'X-Prerender-Engine': 'Prerender.io',
          },
        });
      } else {
        debugHeaders['X-Prerender-Error'] = `Response not OK: ${response.statusText}`;
      }
    } catch (error: any) {
      console.error('Prerender.io error:', error);
      debugHeaders['X-Prerender-Error'] = error.message || 'Unknown error during fetch';
    }
  }

  // For non-crawlers or if prerender fails, continue with normal request
  // Return the request with debug headers for non-crawlers too (optional, but good for testing)
  const response = await context.next();
  Object.entries(debugHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

