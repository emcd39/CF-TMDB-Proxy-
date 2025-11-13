// TMDB Proxy for EdgeOne Pages - 基于弹幕API项目结构

export const onRequest = async (context) => {
  const { request, env } = context;
  
  console.log('Request URL:', request.url);
  console.log('Request Headers:', Object.fromEntries(request.headers.entries()));

  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 从请求中获取API Key
  const API_KEY = request.headers.get('X-API-Key') || 
                 url.searchParams.get('api_key') || 
                 url.searchParams.get('key');

  // 获取客户端IP
  let clientIp = 'unknown';
  clientIp = request.headers.get('eo-connecting-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             'unknown';

  // 基础安全检查
  const userAgent = request.headers.get('User-Agent') || '';
  if (userAgent.toLowerCase().includes('bot') && !userAgent.includes('googlebot')) {
    return getFake404Response();
  }

  // 健康检查端点
  if (pathname === '/health' || pathname === '/ping') {
    return new Response(JSON.stringify({
      status: 'ok',
      platform: 'EdgeOne Pages',
      timestamp: new Date().toISOString(),
      client_ip: clientIp,
      version: '1.0.0-EdgeOne'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 管理端点
  if (pathname === '/admin/status' && API_KEY && API_KEY.length === 32) {
    return new Response(JSON.stringify({
      status: 'active',
      version: '1.0.0-EdgeOne-TMDB',
      platform: 'EdgeOne Pages',
      endpoints: { 
        images: '/t/p/{size}/{path}', 
        api: '/3/{endpoint}',
        health: '/health',
        admin: '/admin/status'
      },
      client_info: { 
        ip: clientIp,
        user_agent: userAgent.substring(0, 50)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 根路径 - 伪装404页面
  if (pathname === '/' || pathname === '') {
    return getFake404Response();
  }

  // 图片代理 /t/p/*
  if (pathname.startsWith('/t/p/')) {
    try {
      const imageUrl = `https://image.tmdb.org${pathname}`;
      console.log('Proxying image:', imageUrl);
      
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EdgeOne-TMDB-Proxy/1.0)',
          'Accept': 'image/*'
        }
      });

      if (!response.ok) {
        console.log('Image not found:', response.status);
        return getFake404Response();
      }

      // 创建新响应
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      // 添加CORS和缓存头部
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Cache-Control", "public, max-age=604800, immutable");

      return newResponse;
    } catch (error) {
      console.error('Image proxy error:', error);
      return getFake404Response();
    }
  }

  // API代理 /3/*
  if (pathname.startsWith('/3/')) {
    // 检查API Key
    if (!API_KEY) {
      console.log('API Key missing for:', pathname);
      return getFake404Response();
    }

    try {
      const apiUrl = new URL(`https://api.tmdb.org${pathname}${url.search}`);
      
      // 自动添加API Key
      if (!apiUrl.searchParams.has('api_key')) {
        apiUrl.searchParams.set('api_key', API_KEY);
      }

      console.log('Proxying API:', apiUrl.toString());

      const response = await fetch(apiUrl.toString(), {
        method: request.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; EdgeOne-TMDB-Proxy/1.0)'
        },
        body: request.method !== 'GET' ? request.body : undefined,
      });

      // 创建新响应
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      // 添加CORS头部
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Content-Type", "application/json");
      
      // 智能缓存控制
      const cacheTime = pathname.includes('configuration') ? 3600 : // 配置1小时
                       pathname.includes('search') ? 300 :           // 搜索5分钟
                       pathname.includes('popular') ? 1800 :         // 热门30分钟
                       600; // 默认10分钟
      newResponse.headers.set("Cache-Control", `public, max-age=${cacheTime}`);

      return newResponse;
    } catch (error) {
      console.error('API proxy error:', error);
      return new Response(
        JSON.stringify({ error: 'API request failed', message: error.message }),
        {
          status: 502,
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // 其他路径返回404
  return getFake404Response();
};

// 处理OPTIONS请求
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    },
  });
};

// 伪装的404页面
function getFake404Response() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error { font-size: 72px; color: #999; margin-bottom: 20px; }
        .message { font-size: 18px; color: #666; margin-bottom: 30px; }
        .info { font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="error">404</div>
    <div class="message">Page Not Found</div>
    <div class="info">EdgeOne Pages</div>
    <script>
        console.log('🎬 TMDB Proxy Service - EdgeOne Pages');
        console.log('Platform: EdgeOne Pages (node-functions)');
        console.log('Endpoints:');
        console.log('  • Images: /t/p/{size}/{path}');
        console.log('  • API: /3/{endpoint} (requires API key)');
        console.log('  • Health: /health, /ping');
        console.log('  • Admin: /admin/status (requires API key)');
        console.log('API Key Methods:');
        console.log('  • Header: X-API-Key: your_api_key');
        console.log('  • URL Param: ?api_key=your_api_key');
        console.log('  • URL Param: ?key=your_api_key');
        console.log('⚠️ Service disguised as 404 for security');
    </script>
</body>
</html>`;
  
  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
