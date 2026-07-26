@echo off
chcp 65001 >nul
echo ===================================================
echo 正在启动 Cloudflare Pages 本地开发模拟器...
echo ===================================================
echo.
echo 警告：请在浏览器中打开下面显示的 http://localhost:8788 网址进行调试。
echo 切勿直接双击 index.html，否则高级搜索将自动降级。
echo.
npx wrangler pages dev .
pause
