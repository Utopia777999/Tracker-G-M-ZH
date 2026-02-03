import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { get, update } from 'idb-keyval';
import { config } from './config';
import { translations } from './locales';

const t = translations[config.language] || translations['zh'];

// --- 样式配置 ---
const styles = {
    entryBtn: {
        position: 'fixed', bottom: '50px', right: '30px', width: '60px', height: '60px',
        borderRadius: '50%', backgroundColor: '#2563eb', color: 'white',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)', cursor: 'pointer', zIndex: 9998,
        transition: 'transform 0.2s', fontSize: '24px'
    },
    merchantBtn: {
        position: 'fixed', bottom: '125px', right: '30px', width: '60px', height: '60px',
        borderRadius: '50%', backgroundColor: '#10b981', color: 'white',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)', cursor: 'pointer', zIndex: 9998,
        transition: 'all 0.2s', fontSize: '24px'
    },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: { background: '#fff', width: '450px', height: '600px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' },
    backBtn: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#64748b' },
    closeBtn: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '24px', color: '#94a3b8' },
    body: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' },
    menuItem: { padding: '20px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '15px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '15px' },
    menuIcon: { fontSize: '24px' },
    menuTitle: { fontWeight: 'bold', fontSize: '16px', color: '#334155' },
    menuDesc: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
    chatContainer: { flex: 1, overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '15px' },
    bubble: { padding: '12px 16px', borderRadius: '12px', maxWidth: '85%', lineHeight: '1.5', fontSize: '14px' },
    userBubble: { alignSelf: 'flex-end', background: '#2563eb', color: 'white', borderBottomRightRadius: '2px' },
    aiBubble: { alignSelf: 'flex-start', background: '#f1f5f9', color: '#334155', borderBottomLeftRadius: '2px' },
    optionBtn: { display: 'block', width: '100%', padding: '10px 15px', margin: '5px 0', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', cursor: 'pointer', textAlign: 'left', fontSize: '13px', transition: 'all 0.2s' },
    inputArea: { borderTop: '1px solid #eee', padding: '15px', background: '#fff', display: 'flex', gap: '10px', alignItems: 'flex-end' },
    input: { flex: 1, border: '1px solid #e2e8f0', borderRadius: '20px', padding: '10px 15px', fontSize: '14px', outline: 'none', resize: 'none', height: '40px', fontFamily: 'inherit' },
    sendBtn: { width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
};

// --- 本地模板生成器 (B端专用) ---
// 这是一个纯函数，接收数据对象，返回 HTML 字符串
const generateMerchantHTML = (stats) => {
    // 1. 计算总指标
    let totalPV = 0;
    let totalClicks = 0;
    let totalDuration = 0;
    let totalInterest = 0; // 这里的 Interest 可以定义为有停留行为的次数

    const tableRows = Object.entries(stats).map(([path, data]) => {
        totalPV += data.pv;
        totalClicks += data.clicks;
        totalDuration += data.interestDuration;
        if (data.interestDuration > 0) totalInterest += data.pv; // 简单假设有停留时长即为感兴趣

        const ctr = data.pv > 0 ? ((data.clicks / data.pv) * 100).toFixed(1) + '%' : '0.0%';
        const avgDur = data.pv > 0 ? (data.interestDuration / data.pv / 1000).toFixed(1) : '0.0';
        
        // 简单评级逻辑
        let tag = '<span class="tag tag-gray">一般</span>';
        if (data.clicks > 5) tag = '<span class="tag tag-green">核心主力</span>';
        else if (data.pv > 10 && data.clicks === 0) tag = '<span class="tag tag-red">待修复</span>';
        else if (data.pv > 5) tag = '<span class="tag tag-blue">潜力节点</span>';

        return `
            <tr>
                <td>${path}</td>
                <td>${data.pv}</td>
                <td>${data.clicks}</td>
                <td>${ctr}</td>
                <td>${avgDur}s</td>
                <td>${tag}</td>
            </tr>
        `;
    }).join('');

    const totalCTR = totalPV > 0 ? ((totalClicks / totalPV) * 100).toFixed(1) : '0.0';
    const avgTotalDuration = totalPV > 0 ? (totalDuration / totalPV / 1000).toFixed(1) : '0.0';

    // 2. 准备 ECharts 数据
    const chartDataLabels = JSON.stringify(Object.keys(stats));
    const chartDataPV = JSON.stringify(Object.values(stats).map(d => d.pv));
    const chartDataClick = JSON.stringify(Object.values(stats).map(d => d.clicks));

    // 3. 返回 HTML 模板
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>店铺经营诊断报告</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        :root { --primary: #2563eb; --bg: #f3f4f6; --card: #ffffff; }
        body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header h1 { font-size: 24px; margin: 0; color: #111827; }
        .header .badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; borderRadius: 20px; font-size: 12px; font-weight: 600; }
        
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .card { background: var(--card); padding: 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .metric-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .metric-value { font-size: 32px; font-weight: 700; color: #111827; }
        .metric-trend { font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 4px; }
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }

        .grid-2 { display: grid; grid-template-columns: 2fr 3fr; gap: 20px; margin-bottom: 24px; }
        .chart-box { height: 350px; width: 100%; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; color: #6b7280; font-weight: 500; padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        td { padding: 16px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
        .tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .tag-green { background: #dcfce7; color: #166534; }
        .tag-blue { background: #dbeafe; color: #1e40af; }
        .tag-red { background: #fee2e2; color: #991b1b; }
        .tag-gray { background: #f3f4f6; color: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>店铺经营诊断报告</h1>
                <div style="color:#6b7280; font-size:13px; margin-top:4px">McKinsey E-commerce Analytics | 诊断日期: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="badge">核心内参</div>
        </div>

        <div class="grid-3">
            <div class="card">
                <div class="metric-title">总浏览量 (PV)</div>
                <div class="metric-value">${totalPV}</div>
                <div class="metric-trend trend-up">↑ 基准水平</div>
            </div>
            <div class="card">
                <div class="metric-title">点击转化率 (CTR)</div>
                <div class="metric-value">${totalCTR}%</div>
                <div class="metric-trend trend-blue" style="color:#3b82f6">行业中上</div>
            </div>
            <div class="card">
                <div class="metric-title">平均停留时长 (秒)</div>
                <div class="metric-value">${avgTotalDuration}s</div>
                <div class="metric-trend trend-down" style="color:#f59e0b">需优化</div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <h3 style="margin:0 0 20px 0; font-size:16px;">流量漏斗分析</h3>
                <div id="funnelChart" class="chart-box"></div>
            </div>
            <div class="card">
                <h3 style="margin:0 0 20px 0; font-size:16px;">页面分布对比</h3>
                <div id="barChart" class="chart-box"></div>
            </div>
        </div>

        <div class="card">
            <h3 style="margin:0 0 10px 0; font-size:16px; border-left:4px solid #2563eb; padding-left:10px;">商品/路径明细排行榜</h3>
            <table>
                <thead>
                    <tr><th>路径名称</th><th>PV</th><th>点击量</th><th>点击率</th><th>总停留时间</th><th>表现评估</th></tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // 初始化漏斗图
        const funnelChart = echarts.init(document.getElementById('funnelChart'));
        funnelChart.setOption({
            color: ['#1e3a8a', '#2563eb', '#60a5fa'],
            tooltip: { trigger: 'item', formatter: '{b} : {c}' },
            series: [{
                name: 'Funnel',
                type: 'funnel',
                left: '10%', top: 10, bottom: 10, width: '80%',
                label: { show: true, position: 'inside', color:'#fff' },
                data: [
                    { value: ${totalPV}, name: '浏览 (PV)' },
                    { value: ${totalInterest}, name: '兴趣行为' },
                    { value: ${totalClicks}, name: '实际点击' }
                ]
            }]
        });

        // 初始化柱状图
        const barChart = echarts.init(document.getElementById('barChart'));
        barChart.setOption({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { data: ['PV', '点击量'], bottom: 0 },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'category', data: ${chartDataLabels}, axisLabel: { interval:0, rotate:15, fontSize:10 } },
            yAxis: { type: 'value' },
            series: [
                { name: 'PV', type: 'bar', data: ${chartDataPV}, itemStyle:{color:'#0f172a'} },
                { name: '点击量', type: 'bar', data: ${chartDataClick}, itemStyle:{color:'#3b82f6'} }
            ]
        });

        window.addEventListener('resize', () => {
            funnelChart.resize();
            barChart.resize();
        });
    </script>
</body>
</html>
    `;
};

// --- C端 API 调用 (Wizard 仍然需要 AI) ---
const callGeminiAPI = async (payload) => {
    // 仅保留给 Wizard 使用的 AI 逻辑
    const recentBehaviors = payload.behaviorData
        .slice(-50)
        .map(e => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.type} ${e.text||''}`).join('; ');

    const wizardContext = Object.entries(payload.answers || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
    const targetLang = config.language === 'en' ? 'English' : 'Chinese (Simplified)';
    
    const systemPrompt = `
    Role: Creative Frontend Developer.
    Task: Generate a HTML5 Annual Report.
    Language: **${targetLang}**.
    Context: ${wizardContext}
    Data: ${recentBehaviors}
    Requirements: Creative style, inline CSS/JS, animations.
    `;

    const requestBody = { contents: [{ parts: [{ text: systemPrompt }] }] };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) }
        );
        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text;
        return { success: true, html: rawText.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '') };
    } catch (error) {
        return { success: false, html: `<h1>Error</h1><p>${error.message}</p>` };
    }
};

// --- Wizard Generator (保持不变) ---
const WizardGeneratorView = () => {
    const WIZARD_STEPS = t.steps;
    const [stepIndex, setStepIndex] = useState(0);
    const [messages, setMessages] = useState([
        { role: 'ai', content: t.wizard.intro },
        { role: 'ai', content: WIZARD_STEPS[0].text, stepId: 0 }
    ]);
    const [answers, setAnswers] = useState({});
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const chatEndRef = useRef(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleAnswer = (answerText) => {
        if (!answerText.trim()) return;
        const currentStep = WIZARD_STEPS[stepIndex];
        const newAnswers = { ...answers, [currentStep.id]: answerText };
        setAnswers(newAnswers);
        setMessages(prev => [...prev, { role: 'user', content: answerText }]);
        setInput('');

        if (stepIndex < WIZARD_STEPS.length - 1) {
            const nextStep = WIZARD_STEPS[stepIndex + 1];
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'ai', content: nextStep.text, stepId: stepIndex + 1 }]);
                setStepIndex(prev => prev + 1);
            }, 500);
        } else {
            setIsGenerating(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'ai', content: t.wizard.received_msg }]);
                generateFinalReport(newAnswers);
            }, 500);
        }
    };

    const generateFinalReport = async (finalAnswers) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) reportWindow.document.write(`<!DOCTYPE html><html><body><h2 style="text-align:center;margin-top:20%">Generating...</h2></body></html>`);

        try {
            const behaviorData = (await get('tracker_events_v1')) || [];
            const res = await callGeminiAPI({ answers: finalAnswers, behaviorData });

            if (reportWindow) {
                if (res.success) {
                    reportWindow.document.open();
                    reportWindow.document.write(res.html);
                    reportWindow.document.close();
                    const newReport = { id: Date.now(), timestamp: Date.now(), prompt: `${t.wizard.report_title_prefix} (${finalAnswers.q2})`, html: res.html };
                    await update('tracker_reports_v1', (list = []) => [newReport, ...list]);
                    setMessages(prev => [...prev, { role: 'ai', content: t.wizard.success_msg }]);
                } else {
                    reportWindow.document.body.innerHTML = `<h2>Error</h2><p>${res.html}</p>`;
                }
            }
        } catch (e) { setIsGenerating(false); }
    };

    const currentStepConfig = WIZARD_STEPS[stepIndex];

    return (
        <>
            <div style={styles.body}>
                <div style={styles.chatContainer}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>{msg.content}</div>
                            {msg.role === 'ai' && msg.stepId === stepIndex && !isGenerating && (
                                <div style={{ marginTop: '10px', width: '100%', maxWidth: '280px' }}>
                                    {WIZARD_STEPS[stepIndex].options.map((opt, i) => (
                                        <button key={i} style={styles.optionBtn} onClick={() => handleAnswer(opt)}>{opt}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>
            <div style={styles.inputArea}>
                <input style={styles.input} placeholder={currentStepConfig?.allowInput ? t.wizard.placeholder_input : t.wizard.placeholder_select} value={input} onChange={e => setInput(e.target.value)} disabled={isGenerating} />
                <button style={styles.sendBtn} onClick={() => handleAnswer(input)} disabled={isGenerating}>➤</button>
            </div>
        </>
    );
};

// --- Home, History, Merchant View ---
const HomeView = ({ onNavigate }) => (
    <div style={styles.body}>
        <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>{t.home.welcome}</h2>
        <div style={styles.menuItem} onClick={() => onNavigate('wizard')}>
            <div style={styles.menuIcon}>✨</div>
            <div><div style={styles.menuTitle}>{t.home.wizard_title}</div><div style={styles.menuDesc}>{t.home.wizard_desc}</div></div>
        </div>
        <div style={styles.menuItem} onClick={() => onNavigate('history')}>
            <div style={styles.menuIcon}>📂</div>
            <div><div style={styles.menuTitle}>{t.home.history_title}</div><div style={styles.menuDesc}>{t.home.history_desc}</div></div>
        </div>
        {/* <div style={{...styles.menuItem, borderLeft: '4px solid #10b981'}} onClick={() => onNavigate('merchant')}>
            <div style={styles.menuIcon}>💼</div>
            <div><div style={styles.menuTitle}>{t.home.merchant_title}</div><div style={styles.menuDesc}>{t.home.merchant_desc}</div></div>
        </div> */}
    </div>
);

const HistoryView = () => {
    const [reports, setReports] = useState([]);
    useEffect(() => { get('tracker_reports_v1').then(d => setReports((d||[]).sort((a,b)=>b.timestamp-a.timestamp))); }, []);
    const openReport = (html) => { const w = window.open('','_blank'); if(w){w.document.write(html);w.document.close();} };
    const deleteReport = async (id, e) => {
        e.stopPropagation();
        if(!window.confirm(t.history.delete_confirm)) return;
        const l = reports.filter(r => r.id !== id);
        setReports(l); await update('tracker_reports_v1', () => l);
    };
    return (
        <div style={styles.body}>
            {reports.map(r => (
                <div key={r.id} style={{...styles.menuItem, flexDirection:'column', alignItems:'flex-start', position:'relative'}} onClick={()=>openReport(r.html)}>
                    <div style={{fontWeight:'bold'}}>{r.prompt}</div>
                    <div style={{fontSize:'12px', color:'#999'}}>{new Date(r.timestamp).toLocaleString()}</div>
                    <button onClick={(e)=>deleteReport(r.id, e)} style={{position:'absolute', right:10, top:10, border:'none',background:'transparent',color:'red'}}>🗑️</button>
                </div>
            ))}
        </div>
    );
};

const MerchantView = () => (
    <div style={{...styles.body, justifyContent:'center', textAlign:'center'}}>
        <h1>🚀</h1><h3>商家数据罗盘</h3>
        <p style={{color:'#666'}}>请点击右下角绿色悬浮按钮，快速生成即时诊断报告。</p>
    </div>
);

// --- 主容器 ---
const PlatformApp = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('home'); 
    const handleClose = () => { setIsOpen(false); setView('home'); };

    // 【核心修改】点击绿色悬浮按钮：直接生成代码版 HTML 报告
    const handleQuickMerchantReport = async (e) => {
        e.stopPropagation();
        
        // 1. 立即打开窗口
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`<!DOCTYPE html><html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif"><h2>正在聚合店铺数据...</h2></body></html>`);
        }

        try {
            // 2. 读取本地数据
            const allEvents = (await get('tracker_events_v1')) || [];
            
            // 3. 聚合统计
            const stats = {};
            allEvents.forEach(e => {
                const k = e.pageId || e.path || 'unknown';
                if (!stats[k]) stats[k] = { pv: 0, clicks: 0, interestDuration: 0 };
                if (e.type === 'click') stats[k].clicks++;
                if (e.type === 'interest_view') {
                    stats[k].pv++;
                    stats[k].interestDuration += (e.duration || 0);
                }
            });

            // 4. 调用本地模板生成 HTML (无需 API)
            const html = generateMerchantHTML(stats);

            // 5. 渲染 & 保存
            if (reportWindow) {
                reportWindow.document.open();
                reportWindow.document.write(html);
                reportWindow.document.close();

                const newReport = { id: Date.now(), timestamp: Date.now(), prompt: t.merchant.report_title, html: html };
                await update('tracker_reports_v1', (list = []) => [newReport, ...list]);
            }
        } catch (err) {
            console.error(err);
            if (reportWindow) reportWindow.close();
            alert('生成失败');
        }
    };

    return (
        <>
            {!isOpen && (
                <>
                    {/* 绿色悬浮按钮 (商家) */}
                    <div style={styles.merchantBtn} onClick={handleQuickMerchantReport} title={t.merchant.btn_start}>💼</div>
                    {/* 蓝色悬浮按钮 (助手) */}
                    <div style={styles.entryBtn} onClick={() => setIsOpen(true)}>🤖</div>
                </>
            )}

            {isOpen && (
                <div style={styles.overlay}>
                    <div style={styles.card}>
                        <div style={styles.header}>
                            {view !== 'home' ? <button style={styles.backBtn} onClick={() => setView('home')}>←</button> : <span>{t.home.header_data_center}</span>}
                            <button style={styles.closeBtn} onClick={handleClose}>×</button>
                        </div>
                        {view === 'home' && <HomeView onNavigate={setView} />}
                        {view === 'wizard' && <WizardGeneratorView />}
                        {view === 'history' && <HistoryView />}
                        {view === 'merchant' && <MerchantView />}
                    </div>
                </div>
            )}
        </>
    );
};

export function mountPlatform() {
    let container = document.getElementById('tracker-platform-root');
    if (!container) { container = document.createElement('div'); container.id = 'tracker-platform-root'; document.body.appendChild(container); }
    createRoot(container).render(<PlatformApp />);
}