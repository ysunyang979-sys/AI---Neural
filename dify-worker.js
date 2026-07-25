/**
 * Cloudflare Worker Proxy for Dify AI Knowledge Base API (双知识库内置版)
 * 
 * ✨ 1 个 Worker 完美同时服务 2 个 Dify 知识库，绝对不需要再做第二个 Worker！
 */

const KEY_BOOK = "app-kH6Ld7psiW3PZ6LRaUGDDAWI";  // 📖 学习/通用知识库 API Key
const KEY_BRAIN = "app-RfVcWa2J8Be7VQJdFeykpV4l"; // 🧠 深度思考知识库 API Key

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
      // 自动辨识前端发来的 Authorization Header，自动匹配使用 KEY_BOOK 或 KEY_BRAIN
      const incomingAuth = request.headers.get("Authorization") || "";
      let apiKey = KEY_BOOK; // 默认使用学习/通用知识库

      if (incomingAuth.includes(KEY_BRAIN) || incomingAuth.includes("RfV")) {
        apiKey = KEY_BRAIN; // 自动切换为 🧠 深度思考知识库
      } else if (incomingAuth.includes(KEY_BOOK) || incomingAuth.includes("kH6L")) {
        apiKey = KEY_BOOK;  // 自动切换为 📖 学习/通用知识库
      } else if (incomingAuth.startsWith("Bearer ") && incomingAuth.trim() !== "Bearer") {
        apiKey = incomingAuth.replace("Bearer ", "").trim();
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
