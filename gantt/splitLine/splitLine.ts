import type ISplitLine from './splitLine'
import { createElement } from '../utils/utils'

export default class SplitLine implements ISplitLine {
  dom
  private _splitLine
  private _x
  private _isRightButtonClicked
  private _moveXCallBackList = []
  constructor() {
    const splitLineBox = createElement('div', {
      class: 'gantt-split-line-box'
    })
    const splitLineDom = createElement('div', {
      id: `gantt-split-line-${Date.now()}`,
      class: 'gantt-split-line'
    })
    splitLineBox.appendChild(splitLineDom)
    this._splitLine = splitLineDom
    this.dom = splitLineBox

    this.dom.addEventListener('mousedown', (ev:MouseEvent) => {
      if (ev.button === 0) {
        this._isRightButtonClicked = true
      }
    })
    document.addEventListener('mouseup', () => {
      this._isRightButtonClicked = false
    })
    document.addEventListener('mousemove', (ev:MouseEvent) => {
      if (this._isRightButtonClicked) {
        const { left } = this.dom.parentNode.getBoundingClientRect()
        const { clientX } = ev
        if(this._moveXCallBackList.length > 0) {
          this._moveXCallBackList.forEach(callback => {
            callback(clientX - left)
          })
        }
      }
    })
  }

  moveX(callback) {
    this._moveXCallBackList.push(callback)
  }
}