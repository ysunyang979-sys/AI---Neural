/**
 * Cloudflare Worker Proxy for Dify AI Knowledge Base API
 * 
 * 部署步骤 (Cloudflare Worker 部署教程):
 * 1. 登录 Cloudflare Dashboard -> Workers & Pages -> Create Application -> Create Worker
 * 2. 将本文件代码复制粘贴替换 Worker 编辑器中的代码；
 * 3. 点击 "Save and Deploy" (保存并部署)；
 * 4. (可选安全设置) 在 Worker 设置 -> Variables 中添加环境变量:
 *    Key: DIFY_API_KEY  |  Value: app-kH6Ld7psiW3PZ6LRaUGDDAWI
 * 5. 复制生成的 Worker URL (例如: https://dify-proxy.xxx.workers.dev) 粘贴填入 AI 系统的 Settings 中！
 */

const DEFAULT_DIFY_API_KEY = "app-kH6Ld7psiW3PZ6LRaUGDDAWI";
const DIFY_API_BASE = "https://api.dify.ai/v1";

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // 1. 处理 CORS 跨域预检请求 (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    let path = url.pathname;
    if (path.startsWith("/v1")) {
      path = path.substring(3);
    }
    if (path === "" || path === "/") {
      path = "/chat-messages";
    }
    const targetUrl = `https://api.dify.ai/v1${path}${url.search}`;

    try {
      // 优先读取前端传入的 Authorization (包含用户选中的知识库 Key: 学习书籍 app-kH6L / 深度思考 app-RfV)
      const incomingAuth = request.headers.get("Authorization");
      let apiKey = env.DIFY_API_KEY || DEFAULT_DIFY_API_KEY;
      
      if (incomingAuth && incomingAuth.startsWith("Bearer ") && incomingAuth.trim() !== "Bearer") {
        const clientKey = incomingAuth.replace("Bearer ", "").trim();
        if (clientKey) {
          apiKey = clientKey;
        }
      }

      // 复制原有 Headers 并注入 Authorization
      const reqHeaders = new Headers(request.headers);
      reqHeaders.set("Authorization", `Bearer ${apiKey}`);
      reqHeaders.set("Content-Type", "application/json");

      // 安全中转至 Dify 官方 API
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: reqHeaders,
        body: request.method !== "GET" ? await request.text() : undefined,
      });

      // 注入 CORS Headers 并流式透传给客户端
      const resHeaders = new Headers(response.headers);
      Object.keys(corsHeaders).forEach((key) => {
        resHeaders.set(key, corsHeaders[key]);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Cloudflare Proxy Error: " + err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
