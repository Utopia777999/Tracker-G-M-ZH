import {
    get,
    update
} from 'idb-keyval';

// --- 工具函数保持不变 ---
function getElementContent(el) {
    const text = el.innerText || el.textContent || '';
    return {
        tag: el.tagName,
        text: text.slice(0, 50).replace(/\s+/g, ' ').trim(),
        id: el.id || '',
        class: el.className || ''
    };
}

function getSelector(el) {
    if (!el || el.tagName === 'BODY') return 'BODY';
    let selector = el.tagName.toLowerCase();
    if (el.id) selector += `#${el.id}`;
    else if (el.className && typeof el.className === 'string') selector += `.${el.className.split(' ').join('.')}`;
    if (el.parentElement && el.parentElement.tagName !== 'BODY') return `${getSelector(el.parentElement)} > ${selector}`;
    return selector;
}

export default class Tracker {
    constructor(config) {
        this.config = config || {};
        this.dbKey = 'tracker_events_v1';
        this.interestThreshold = 2000;
        this.viewMap = new Map();

        // 1. 【核心升级】确定当前页面的唯一 ID
        // 优先使用用户传入的 pageId (用于区分商品详情页)
        // 其次使用 URL 路径 (用于静态页面)
        this.pageId = this.config.pageId || window.location.pathname;

        // 2. 合并监控选择器
        this.targetSelectors = [
            'article', 'section', '.card', '.content-item', 'h1', 'h2', 'h3', 'p',
            ...(this.config.traceSelectors || [])
        ].join(', ');

        this.init();
    }

    init() {
        console.log(`⚡️ SDK 启动 | PageID: [${this.pageId}] | 监控: ${this.targetSelectors}`);
        this.startClickTracking();
        this.startViewportTracking();
        this.mountUI();
        this.handleUnload();
    }

    // --- 采集模块 ---
    startClickTracking() {
        window.addEventListener('click', (e) => {
            if (e.target.closest('#tracker-platform-root')) return;
            const selector = getSelector(e.target);
            this.saveEvent({
                type: 'click',
                selector: selector,
                ...getElementContent(e.target),
                timestamp: Date.now()
            });
        }, true);
    }

    startViewportTracking() {
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.viewMap.set(entry.target, Date.now());
                } else {
                    this.settleInterest(entry.target);
                }
            });
        };
        this.intersectionObserver = new IntersectionObserver(observerCallback, {
            threshold: 0.5
        });
        this.observeDomChanges();
    }

    settleInterest(target) {
        const startTime = this.viewMap.get(target);
        if (startTime) {
            const duration = Date.now() - startTime;
            this.viewMap.delete(target);
            if (duration > this.interestThreshold) {
                const selector = getSelector(target);
                const content = getElementContent(target);
                console.log(`❤️ [${this.pageId}] 兴趣停留 ${duration}ms`, content);
                this.saveEvent({
                    type: 'interest_view',
                    duration: duration,
                    selector: selector,
                    ...content,
                    timestamp: Date.now()
                });
            }
        }
    }

    handleUnload() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.viewMap.forEach((_, target) => this.settleInterest(target));
            }
        });
    }

    observeDomChanges() {
        const selectors = this.targetSelectors;
        document.querySelectorAll(selectors).forEach(el => this.intersectionObserver.observe(el));
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches(selectors)) this.intersectionObserver.observe(node);
                        if (node.querySelectorAll) node.querySelectorAll(selectors).forEach(child => this.intersectionObserver.observe(child));
                    }
                });
            });
        });
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // --- 存储模块 (升级版) ---
    async saveEvent(event) {
        // 3. 【核心升级】每条数据强制带上 pageId
        const enrichedEvent = {
            ...event,
            pageId: this.pageId, // 关键：数据隔离字段
            path: window.location.pathname // 保留原始路径作为参考
        };

        try {
            await update(this.dbKey, (events = []) => {
                const newEvents = [...events, enrichedEvent];
                return newEvents.slice(-2000); // 稍微增加一点容量
            });
            // console.log(`💾 数据已存 [${this.pageId}]`, enrichedEvent.type);
        } catch (e) {}
    }

    // --- 数据获取模块 (新增) ---

    // 获取所有数据
    async getAllData() {
        return (await get(this.dbKey)) || [];
    }

    // 【核心升级】只获取特定页面的数据
    async getEventsByPage(targetPageId) {
        const allEvents = await this.getAllData();
        return allEvents.filter(e => e.pageId === targetPageId);
    }

    mountUI() {
        import('./report.jsx').then(module => module.mountPlatform());
    }
}