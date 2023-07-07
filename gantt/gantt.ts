import type IGantt from './gantt.d.ts'
export default class Gantt implements IGantt {
  config //甘特图设置
  constructor() {
    console.log('before')
  }

  init(dom) {
    console.log(dom.name)
  }
}