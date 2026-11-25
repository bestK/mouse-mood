export type Lang = 'zh' | 'en';

const STORAGE_KEY = 'mouse-mood-lang';

export function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (queryLang === 'zh' || queryLang === 'en') return queryLang;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    // ignore storage errors
  }

  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const locale of candidates) {
    if (locale && locale.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
  }
  return 'en';
}

export function saveLang(lang: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
}

export const COPY = {
  en: {
    pageTitle: 'Mood Recognition · Adaptive UI Lab',
    brand: 'Mood Recognition',
    modelTag: 'v0.4 · 360 GBDT · On-Device',
    reset: 'Reset',
    moods: {
      neutral: 'Neutral',
      frustrated: 'Frustrated',
      confused: 'Confused',
      lost: 'Lost',
      away: 'Away',
    },
    classes: {
      none: 'none',
      blocked: 'blocked',
      frustrated: 'frustrated',
      confused: 'confused',
      lost: 'lost',
      waiting: 'waiting',
    },
    fast: {
      shake: 'shake',
      orbit: 'orbit',
      rage: 'rage',
      disabled: 'disabled',
    },
    telemetry: {
      reaction: 'Reaction',
      fastSignals: 'Fast Signals',
      probabilities: 'Model Output',
      offline: '0 KB sent',
      loaded: 'Model Ready',
      fallback: 'Fast Only',
    },
    tabs: {
      checkout: 'Checkout',
      form: 'Strict Input',
      settings: 'Settings',
    },
    checkout: {
      item: 'Arc Studio Desk Lamp',
      variant: 'Anodized Slate · 2400K–5500K',
      price: '$97.54',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      total: 'Total',
      pay: 'Pay $97.54',
      processing: 'Authorizing...',
      terms: 'I agree to the terms of sale and return policy',
      unlockCue: 'Required to pay',
      cancelWait: 'Taking too long? Cancel',
      paidTitle: 'Payment confirmed',
      orderId: 'Order #MR-8421',
      buyAgain: 'Start over',
      slowToggle: 'Simulate slow gateway',
    },
    form: {
      heading: 'Device Activation',
      label: 'Serial Key',
      placeholder: 'Enter activation key',
      activate: 'Activate',
      invalid: 'Use format XXXX-XXXX-XXXX (A–Z, 0–9)',
      formatHint: 'Format: XXXX-XXXX-XXXX',
      fillSample: 'Fill sample',
      success: 'Device activated',
      resetKey: 'Try another key',
    },
    settings: {
      targetLabel: 'Find',
      targetValue: 'Webhook Signing Secret',
      searchPlaceholder: 'Search settings...',
      foundToast: 'Webhook Secret copied',
      copyBtn: 'Copy Secret',
      copiedBtn: 'Copied',
      sections: {
        profile: {
          title: 'Workspace Profile',
          items: [
            { label: 'Display Name', value: 'Studio North' },
            { label: 'Workspace Slug', value: 'studio-north' },
            { label: 'Default Region', value: 'Frankfurt (eu-central)' },
          ],
        },
        appearance: {
          title: 'Appearance',
          items: [
            { label: 'Interface Density', value: 'Balanced' },
            { label: 'Reduced Motion', value: 'System default' },
            { label: 'Accent Contrast', value: 'Standard' },
          ],
        },
        notifications: {
          title: 'Notifications',
          items: [
            { label: 'Build Failures', value: 'Instant' },
            { label: 'Weekly Digest', value: 'Mondays 09:00' },
            { label: 'Mentions', value: 'Desktop + Email' },
          ],
        },
        sync: {
          title: 'Local Sync & Storage',
          items: [
            { label: 'Offline Cache', value: 'Enabled (128 MB)' },
            { label: 'Conflict Policy', value: 'Keep newest' },
            { label: 'Snapshot Retention', value: '30 days' },
          ],
        },
        billing: {
          title: 'Usage & Quotas',
          items: [
            { label: 'Current Plan', value: 'Personal' },
            { label: 'Monthly Bandwidth', value: '14.2 / 100 GB' },
            { label: 'Seats', value: '1 active' },
          ],
        },
        security: {
          title: 'Security & Keys',
          items: [
            { label: 'Two-Factor Auth', value: 'Hardware key' },
            { label: 'Active Sessions', value: '2 devices' },
            { label: 'Webhook Signing Secret', value: 'whsec_9f2k...81a4', isTarget: true },
          ],
        },
        integrations: {
          title: 'Connected Apps',
          items: [
            { label: 'GitHub Deployments', value: 'Connected' },
            { label: 'Linear Issues', value: 'Not linked' },
            { label: 'Slack Alerts', value: 'Paused' },
          ],
        },
      },
    },
  },
  zh: {
    pageTitle: 'Mood Recognition · 情绪感知自适应界面',
    brand: 'Mood Recognition',
    modelTag: 'v0.4 · 360 决策树 · 纯本地推理',
    reset: '重置',
    moods: {
      neutral: '平静',
      frustrated: '受挫',
      confused: '困惑',
      lost: '迷失',
      away: '离开',
    },
    classes: {
      none: '平静 none',
      blocked: '受阻 blocked',
      frustrated: '受挫 frustrated',
      confused: '困惑 confused',
      lost: '迷失 lost',
      waiting: '等待 waiting',
    },
    fast: {
      shake: '晃动',
      orbit: '盘旋',
      rage: '连点',
      disabled: '禁用点击',
    },
    telemetry: {
      reaction: '响应强度',
      fastSignals: '即时信号',
      probabilities: '模型概率分布',
      offline: '0 KB 上传',
      loaded: '模型已就绪',
      fallback: '仅即时信号',
    },
    tabs: {
      checkout: '结算受阻',
      form: '严苛输入',
      settings: '深层设置',
    },
    checkout: {
      item: 'Arc 桌面无影护眼灯',
      variant: '阳极氧化岩灰 · 2400K–5500K',
      price: '¥698.00',
      subtotal: '商品金额',
      shipping: '配送运费',
      free: '免运费',
      total: '实付总额',
      pay: '立即支付 ¥698.00',
      processing: '正在安全授权...',
      terms: '我已阅读并同意销售条款与退换货政策',
      unlockCue: '勾选后即可支付',
      cancelWait: '等待过久？取消支付',
      paidTitle: '支付已完成',
      orderId: '订单号 #MR-8421',
      buyAgain: '重新体验',
      slowToggle: '模拟支付通道缓慢',
    },
    form: {
      heading: '设备序列号激活',
      label: '激活密钥',
      placeholder: '输入激活密钥',
      activate: '立即激活',
      invalid: '需为 XXXX-XXXX-XXXX（大写字母与数字）',
      formatHint: '格式示例：XXXX-XXXX-XXXX',
      fillSample: '填入示例',
      success: '设备已激活',
      resetKey: '重新输入',
    },
    settings: {
      targetLabel: '目标',
      targetValue: 'Webhook 签名密钥',
      searchPlaceholder: '搜索设置项...',
      foundToast: '已复制 Webhook 密钥',
      copyBtn: '复制密钥',
      copiedBtn: '已复制',
      sections: {
        profile: {
          title: '工作区资料',
          items: [
            { label: '工作区名称', value: 'Studio North' },
            { label: '访问标识', value: 'studio-north' },
            { label: '默认节点', value: '法兰克福 (eu-central)' },
          ],
        },
        appearance: {
          title: '界面外观',
          items: [
            { label: '布局密度', value: '均衡' },
            { label: '减弱动态效果', value: '跟随系统' },
            { label: '强调对比度', value: '标准' },
          ],
        },
        notifications: {
          title: '消息通知',
          items: [
            { label: '构建异常提醒', value: '即时推送' },
            { label: '每周汇总', value: '周一 09:00' },
            { label: '提及通知', value: '桌面 + 邮件' },
          ],
        },
        sync: {
          title: '本地同步与缓存',
          items: [
            { label: '离线缓存', value: '已开启 (128 MB)' },
            { label: '冲突策略', value: '保留最新版本' },
            { label: '快照保留周期', value: '30 天' },
          ],
        },
        billing: {
          title: '用量与配额',
          items: [
            { label: '当前方案', value: '个人版' },
            { label: '本月流量', value: '14.2 / 100 GB' },
            { label: '成员席位', value: '1 人在线' },
          ],
        },
        security: {
          title: '安全与密钥管理',
          items: [
            { label: '双重身份验证', value: '硬件安全密钥' },
            { label: '活跃登录会话', value: '2 台设备' },
            { label: 'Webhook 签名密钥', value: 'whsec_9f2k...81a4', isTarget: true },
          ],
        },
        integrations: {
          title: '第三方连接',
          items: [
            { label: 'GitHub 自动部署', value: '已授权' },
            { label: 'Linear 工单同步', value: '未绑定' },
            { label: 'Slack 告警通道', value: '已暂停' },
          ],
        },
      },
    },
  },
} as const;

export type CopyDict = (typeof COPY)[Lang];
