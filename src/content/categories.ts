import type { Category } from './types'
import { animals } from './animals'
import { zoo } from './zoo'
import { family } from './family'
import { body } from './body'
import { fruits } from './fruits'
import { food } from './food'
import { things } from './things'
import { home } from './home'
import { clothes } from './clothes'
import { actions } from './actions'
import { feelings } from './feelings'
import { vehicles } from './vehicles'
import { nature } from './nature'
import { vegetables } from './vegetables'
import { colors } from './colors'
import { numbers } from './numbers'
import { shapes } from './shapes'

/**
 * 分类顺序 = 首页方砖顺序，固定不变（幼儿靠位置记忆）。
 * 按 2–4 岁词汇发展排：先是身边的动物、人和自己的身体、吃的、家里的东西、动作和情绪，
 * 抽象的颜色 / 数字 / 形状放最后。
 */
export const categories: Category[] = [
  animals,
  zoo,
  family,
  body,
  fruits,
  food,
  things,
  home,
  clothes,
  actions,
  feelings,
  vehicles,
  nature,
  vegetables,
  colors,
  numbers,
  shapes,
]
