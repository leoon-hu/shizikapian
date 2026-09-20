/**
 * 同一作者的另外三个学习站：首页底部与 cards.html 页脚一行「更多应用」互相链接（需求 C6）。
 * 四个站各有一份同样的名单，改了要一起改；顺序固定 AI加词 → 同步练 → 拼音学习机 → 识字卡片，本站不列自己。
 */
export interface SisterSite {
  name: string
  /** 一句话说明，给不认识这个名字的家长 */
  desc: string
  url: string
}

export const SISTER_SITES: readonly SisterSite[] = [
  { name: 'AI加词', desc: '背单词', url: 'https://jiaci.app' },
  { name: '同步练', desc: '人教版小学同步练习', url: 'https://tongbulian.jiaci.app' },
  { name: '拼音学习机', desc: '拼音点读、拼读、测验', url: 'https://pinyin.jiaci.app' },
]

/**
 * 站长联系方式（需求 C6，2026-09-21 四个站统一）：一张微信二维码，首页页脚与设置页点「联系站长」弹出来看，
 * cards.html 页脚与根页面的静态启动页折叠着放同一张。图片在 public/，四个站各放一份同一张图。
 */
export const AUTHOR_CONTACT = {
  label: '联系站长',
  /** public/ 里的文件名；base 是 './'，用的时候拼 BASE_URL（静态页直接用相对路径） */
  qr: 'wechat-qrcode.jpg',
  hint: '用微信扫一扫（手机上长按二维码识别）加站长微信，有问题、建议或想要的卡片都欢迎直接说。',
} as const

/** 本站的公开地址与源码仓库（需求 C6「开源与分享」）：页脚「GitHub 源码」、分享出去的链接兜底（file:// 打开时）都用它 */
export const SITE_URL = 'https://kapian.jiaci.app'
export const REPO_URL = 'https://github.com/leoon-hu/shizikapian'
/** 页脚「开源」一句：首页、设置页、cards.html 与根页面静态启动页同一句（后两处是生成 / 手写的，改了要同步） */
export const OPEN_CLAIM = '免费、无广告、不用注册、不收集个人信息，图片和发音全部打包在应用里、不联网也能用；代码全部开源（MIT），谁都能查、也能自己部署。'
/** 「分享给朋友」发出去的一句话（后面跟站点链接） */
export const SHARE_TEXT = '识字卡片：给 2–4 岁宝宝的看图听音认知卡片，256 张卡、真实照片 + 插画 + 中英文例句，点一下就朗读。免费、开源、离线、无广告。'
