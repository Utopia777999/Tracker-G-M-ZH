// src/locales.js

export const translations = {
    zh: {
        home: {
            welcome: "👋 欢迎回来",
            wizard_title: "生成年度报告 (引导版)",
            wizard_desc: "回答几个小问题，定制专属报告",
            history_title: "查看历史报告",
            history_desc: "回顾往期生成的洞察卡片",
            merchant_title: "生成经营报告 (商家端)",
            merchant_desc: "查看店铺曝光、点击及转化漏斗",
            header_data_center: "数据中心"
        },
        wizard: {
            intro: "👋 嗨！我是你的年度报告设计助手。为了生成最懂你的报告，我们来做个小互动吧！",
            generating_status: "✨ 魔法生成中...",
            received_msg: "🎉 收到！正在根据你的偏好，调用 Gemini 生成独一无二的年度报告...",
            success_msg: "✅ 报告已生成并打开！同时也已保存到历史记录。",
            placeholder_input: "或者输入你的独特答案...",
            placeholder_select: "请从上方选择...",
            report_title_prefix: "年度报告"
        },
        merchant: {
            title: "商家数据罗盘",
            desc: "基于全域流量数据的 AI 深度诊断。\n一键生成包含漏斗、归因与建议的专业报表。",
            btn_start: "✨ 生成经营诊断报告",
            btn_loading: "AI 计算中...",
            status_agg: "正在聚合全店经营数据...",
            status_req: "正在请求 AI 生成图表...",
            wait_tip: "数据聚合中，请稍候...",
            report_title: "📊 店铺经营诊断报告"
        },
        history: {
            empty_title: "暂无历史报告",
            empty_desc: "快去生成你的第一份年度总结吧",
            delete_confirm: "确定要删除这份报告吗？",
            tag_html: "HTML5 报告"
        },
        // 引导步骤配置
        steps: [
            { id: 'q1', text: '1. 首先，你比较关注哪个维度的数据？🧐', options: ['核心数据（访问频率、时长）', '成就回顾（完成的任务）', '兴趣图谱（浏览内容类型）', '进阶分析（行为预测）'] },
            { id: 'q2', text: '2. 希望报告是什么风格？🎨', options: ['故事叙述型 (将数据编成故事)', '成就展示型 (突出里程碑)', '幽默趣味型 (轻松搞怪)', '未来预测型 (基于今年看明年)'] },
            { id: 'q3', text: '3. 想特别回顾哪个时期？📅', options: ['特殊月份 (如春节、暑假)', '里程碑事件前后', '特定项目期间', '全年平均'] },
            { id: 'q4', text: '4. 今年最有成就感的是？🏆 (可输入)', options: ['坚持打卡 xx 天', '发现了 xx 宝藏功能', '节省了 xx 时间', '学到了 xx 技能'], allowInput: true },
            { id: 'q5', text: '5. 最想分享的瞬间是？📸 (可输入)', options: ['第一次使用的时候', '解决某个难题的时刻', '发现意外惊喜的瞬间'], allowInput: true },
            { id: 'q6', text: '6. 最后选个主色调吧，这决定了报告的“情绪”～ 🎨', options: ['活力橙 (充满成就)', '静谧蓝 (深度探索)', '新生绿 (发现新兴趣)', '暗夜黑 (极客科技)'] }
        ]
    },
    en: {
        home: {
            welcome: "👋 Welcome Back",
            wizard_title: "Annual Report (Wizard)",
            wizard_desc: "Customize your report with a few questions",
            history_title: "History Archives",
            history_desc: "Review past insight cards",
            merchant_title: "Business Report (Merchant)",
            merchant_desc: "View impressions, clicks & funnels",
            header_data_center: "Data Center"
        },
        wizard: {
            intro: "👋 Hi! I'm your report assistant. Let's customize your annual report!",
            generating_status: "✨ Generating Magic...",
            received_msg: "🎉 Got it! Calling Gemini to craft your unique report...",
            success_msg: "✅ Report generated and opened! Saved to history.",
            placeholder_input: "Or type your unique answer...",
            placeholder_select: "Please select from above...",
            report_title_prefix: "Annual Report"
        },
        merchant: {
            title: "Merchant Data Compass",
            desc: "AI-driven diagnosis based on full-domain traffic data.\nGenerate professional reports with funnels and advice.",
            btn_start: "✨ Generate Diagnosis Report",
            btn_loading: "AI Calculating...",
            status_agg: "Aggregating store data...",
            status_req: "Requesting AI charts...",
            wait_tip: "Aggregating data, please wait...",
            report_title: "📊 Store Diagnosis Report"
        },
        history: {
            empty_title: "No History Yet",
            empty_desc: "Go generate your first annual summary",
            delete_confirm: "Are you sure you want to delete this report?",
            tag_html: "HTML5 Report"
        },
        steps: [
            { id: 'q1', text: '1. Which data dimension matters most? 🧐', options: ['Core Metrics (Frequency, Duration)', 'Achievements (Tasks Completed)', 'Interest Graph (Content Types)', 'Advanced Analysis (Behavior Prediction)'] },
            { id: 'q2', text: '2. Preferred report style? 🎨', options: ['Storytelling (Data as a story)', 'Achievement Showcase (Milestones)', 'Humorous (Fun & Light)', 'Futuristic (Predicting next year)'] },
            { id: 'q3', text: '3. Any specific period to review? 📅', options: ['Special Months (Holidays)', 'Around Milestones', 'Specific Project Duration', 'Yearly Average'] },
            { id: 'q4', text: '4. Biggest achievement this year? 🏆 (Input allowed)', options: ['Streaked for xx days', 'Discovered xx feature', 'Saved xx time', 'Learned xx skill'], allowInput: true },
            { id: 'q5', text: '5. Most memorable moment? 📸 (Input allowed)', options: ['First time using it', 'Solved a tough problem', 'A moment of surprise'], allowInput: true },
            { id: 'q6', text: '6. Choose a primary color/mood ～ 🎨', options: ['Vibrant Orange (Achievement)', 'Serene Blue (Exploration)', 'Fresh Green (New Interests)', 'Dark Mode (Geek)'] }
        ]
    }
};