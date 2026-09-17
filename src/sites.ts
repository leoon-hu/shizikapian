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
