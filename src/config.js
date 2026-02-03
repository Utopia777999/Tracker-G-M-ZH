// src/config.js

export const config = {
    // 语言设置: 'zh' | 'en'
    language: 'zh', 

    // DOM 监控选择器 (Tracker使用)
    traceSelectors: [
        '.card', 
        '.goods-card', 
        'button', 
        '.menu-item',
        'a[href]'
    ],

    // API Key (建议在环境变量中管理，这里仅作演示)
    apiKey: "AIzaSyDMcNrkYW14hGrBZuB2fFLbKiiaKjvKamc"
};