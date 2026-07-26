export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const query = body.query;
    
    const apiKeys = [
      "3370a5ef-f056-4b03-a0bd-35b640ba98f6",
      "9d4d68f1-c8ee-4cb0-ba15-4790d852e9c6",
      "2025e09a-820b-4501-a04b-1c99eaa63cea",
      "69e904c5-1cc9-4b97-b376-b77350ce5b2f"
    ];
    // 👆👆👆 👆👆👆 👆👆👆

    // 筛选出有效的 Key，过滤掉未修改的占位符
    const validKeys = apiKeys.filter(k => k && k !== "" && !k.includes("YOUR_API_KEY"));
    if (validKeys.length === 0) {
      return new Response("Error: Exa API Keys 未配置，请在 functions/api/search.js 中配置。", { status: 400 });
    }
    
    // 随机选择一个 API Key
    const apiKey = validKeys[Math.floor(Math.random() * validKeys.length)];

    // 请求 Exa API
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({ 
        query: query, 
        useAutoprompt: true, 
        text: true, // 获取正文内容
        numResults: 5 // 获取前5条高质量结果
      })
    });
    
    const data = await res.json();
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    // 将 Exa 结果组装成前端易读的文本
    let resultText = "【Agent Reach Exa 全网搜索结果】\n\n";
    if (data.results && data.results.length > 0) {
      data.results.forEach((item, index) => {
        resultText += `${index + 1}. Title: ${item.title}\n`;
        resultText += `URL: ${item.url}\n`;
        if (item.text) {
          resultText += `Content Snippet: ${item.text.substring(0, 800)}...\n\n`;
        }
      });
    } else {
      resultText = "No results found.";
    }

    // 将组装好的文本返回给前端
    return new Response(resultText, {
      headers: { "Content-Type": "text/plain;charset=UTF-8" }
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
