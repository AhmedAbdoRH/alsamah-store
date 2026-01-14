// Netlify Edge Function for Rendertron integration
// This intercepts requests and serves prerendered content to crawlers using Rendertron

// You can set this in Netlify Environment Variables
const RENDERTRON_URL = Deno.env.get('RENDERTRON_URL') || 'https://render-tron.appspot.com/render';

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
    // Rendertron URL format: RENDERTRON_URL/ENCODED_URL
    // Using encodeURIComponent is safer for Rendertron
    const targetUrl = encodeURIComponent(request.url);
    const rendertronUrl = `${RENDERTRON_URL}/${targetUrl}`;
    
    debugHeaders['X-Rendertron-URL'] = rendertronUrl;
    
    try {
      console.log(`Prerendering for crawler: ${userAgent} -> ${rendertronUrl}`);
      
      const response = await fetch(rendertronUrl, {
        headers: {
          'User-Agent': userAgent,
        },
        // Adding a timeout for fetch
        signal: AbortSignal.timeout(10000), 
      });

      debugHeaders['X-Rendertron-Fetch-Status'] = response.status.toString();

      if (response.ok) {
        const html = await response.text();
        return new Response(html, {
          status: 200,
          headers: {
            ...debugHeaders,
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'X-Prerender': 'true',
            'X-Prerender-Engine': 'Rendertron',
          },
        });
      } else {
        debugHeaders['X-Rendertron-Error'] = `Response not OK: ${response.statusText}`;
      }
    } catch (error: any) {
      console.error('Rendertron error:', error);
      debugHeaders['X-Rendertron-Error'] = error.message || 'Unknown error during fetch';
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

