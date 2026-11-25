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
    pageTitle: 'Mood Recognition · On-Device Adaptive UI',
    brand: 'Mood Recognition',
    modelTag: 'v0.4 · 360 GBDT',
    reset: 'Reset',
    hud: 'HUD',
    states: {
      s1: 'S1',
      s2: 'S2',
      s3: 'S3',
    },
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
      probabilities: 'GBDT Output',
      offline: '0 KB sent',
      loaded: 'Ready',
      fallback: 'Fast only',
    },
    tabs: {
      checkout: 'Checkout',
      form: 'Strict Input',
      settings: 'Settings',
    },
    checkout: {
      sku: 'ARC-04',
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
      unlockCue: 'Required',
      cancelWait: 'Cancel authorization',
      paidTitle: 'Payment confirmed',
      orderId: 'ORD-8421',
      buyAgain: 'Reset order',
      slowToggle: 'Slow gateway',
    },
    form: {
      heading: 'Device Activation',
      label: 'Serial Key',
      placeholder: 'Enter activation key',
      activate: 'Activate',
      invalid: 'Expected XXXX-XXXX-XXXX (A–Z, 0–9)',
      formatHint: 'XXXX-XXXX-XXXX',
      fillSample: 'Fill sample',
      success: 'Device activated',
      resetKey: 'Reset key',
    },
    settings: {
      targetLabel: 'Target',
      targetValue: 'Webhook Signing Secret',
      searchPlaceholder: 'Filter settings...',
      copyBtn: 'Copy',
      copiedBtn: 'Copied',
      sections: {
        profile: {
          title: 'Workspace Profile',
          items: [
            { label: 'Display Name', value: 'Studio North' },
            { label: 'Slug', value: 'studio-north' },
            { label: 'Region', value: 'eu-central-1' },
          ],
        },
        appearance: {
          title: 'Appearance',
          items: [
            { label: 'Density', value: 'Compact' },
            { label: 'Reduced Motion', value: 'System' },
            { label: 'Contrast', value: 'Standard' },
          ],
        },
        notifications: {
          title: 'Notifications',
          items: [
            { label: 'Build Failures', value: 'Immediate' },
            { label: 'Digest', value: 'Mon 09:00' },
            { label: 'Mentions', value: 'Desktop + Mail' },
          ],
        },
        sync: {
          title: 'Local Sync & Storage',
          items: [
            { label: 'Offline Cache', value: '128 MB' },
            { label: 'Conflict Policy', value: 'Latest write' },
            { label: 'Snapshots', value: '30 days' },
          ],
        },
        billing: {
          title: 'Usage & Quotas',
          items: [
            { label: 'Tier', value: 'Personal' },
            { label: 'Bandwidth', value: '14.2 / 100 GB' },
            { label: 'Seats', value: '1 active' },
          ],
        },
        security: {
          title: 'Security & Keys',
          items: [
            { label: 'Two-Factor Auth', value: 'WebAuthn' },
            { label: 'Active Sessions', value: '2 devices' },
            { label: 'Webhook Signing Secret', value: 'whsec_9f2k...81a4', isTarget: true },
          ],
        },
        integrations: {
          title: 'Connected Apps',
          items: [
            { label: 'GitHub Pages', value: 'Active' },
            { label: 'Linear', value: 'Unlinked' },
            { label: 'Slack', value: 'Paused' },
          ],
        },
      },
    },
  },
  zh: {
    pageTitle: 'Mood Recognition · 端侧情绪感知界面',
    brand: 'Mood Recognition',
    modelTag: 'v0.4 · 360 GBDT',
    reset: '重置',
    hud: '准星',
    states: {
      s1: 'S1',
      s2: 'S2',
      s3: 'S3',
    },
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
      probabilities: '模型分布',
      offline: '0 KB 上传',
      loaded: '就绪',
      fallback: '仅即时',
    },
    tabs: {
      checkout: '结算受阻',
      form: '严苛输入',
      settings: '深层设置',
    },
    checkout: {
      sku: 'ARC-04',
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
      unlockCue: '必选',
      cancelWait: '取消授权',
      paidTitle: '支付已完成',
      orderId: 'ORD-8421',
      buyAgain: '重置订单',
      slowToggle: '慢速通道',
    },
    form: {
      heading: '设备序列号激活',
      label: '激活密钥',
      placeholder: '输入激活密钥',
      activate: '激活设备',
      invalid: '需匹配 XXXX-XXXX-XXXX（大写字母与数字）',
      formatHint: 'XXXX-XXXX-XXXX',
      fillSample: '填入示例',
      success: '设备已激活',
      resetKey: '重置密钥',
    },
    settings: {
      targetLabel: '目标',
      targetValue: 'Webhook 签名密钥',
      searchPlaceholder: '筛选设置项...',
      copyBtn: '复制',
      copiedBtn: '已复制',
      sections: {
        profile: {
          title: '工作区资料',
          items: [
            { label: '名称', value: 'Studio North' },
            { label: '标识', value: 'studio-north' },
            { label: '节点', value: 'eu-central-1' },
          ],
        },
        appearance: {
          title: '界面外观',
          items: [
            { label: '密度', value: '紧凑' },
            { label: '减弱动效', value: '跟随系统' },
            { label: '对比度', value: '标准' },
          ],
        },
        notifications: {
          title: '消息通知',
          items: [
            { label: '构建失败', value: '即时' },
            { label: '周报汇总', value: '周一 09:00' },
            { label: '提及提醒', value: '桌面 + 邮件' },
          ],
        },
        sync: {
          title: '本地同步与缓存',
          items: [
            { label: '离线缓存', value: '128 MB' },
            { label: '冲突策略', value: '最新优先' },
            { label: '快照保留', value: '30 天' },
          ],
        },
        billing: {
          title: '用量与配额',
          items: [
            { label: '方案', value: '个人版' },
            { label: '本月流量', value: '14.2 / 100 GB' },
            { label: '席位', value: '1 在线' },
          ],
        },
        security: {
          title: '安全与密钥',
          items: [
            { label: '双重验证', value: 'WebAuthn' },
            { label: '活跃会话', value: '2 台设备' },
            { label: 'Webhook 签名密钥', value: 'whsec_9f2k...81a4', isTarget: true },
          ],
        },
        integrations: {
          title: '外部连接',
          items: [
            { label: 'GitHub Pages', value: '已启用' },
            { label: 'Linear', value: '未绑定' },
            { label: 'Slack', value: '已暂停' },
          ],
        },
      },
    },
  },
} as const;

export type CopyDict = (typeof COPY)[Lang];
