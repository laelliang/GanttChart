import type { ICol } from './col.d'
import { createElement } from '@utils/utils'
export default class Col implements ICol {
  dom: HTMLElement
  width: number | string;
  constructor(key: string, children: any[], attrs?: Record<string, any>) {
    const colDom = createElement('col', {dataKey: key, ...attrs}, children)
    this.dom = colDom
  }

  // setWidth(width: number | string): void {
  //   if (typeof width === 'number') {
  //     this.dom.style.width = `${width}px`
  //   } else {
  //     this.dom.style.width = width
  //   }
  // }
}