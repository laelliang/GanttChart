import type { IRect, Joinpoint } from './rect.d'
import { createElementNS } from '@utils/utils'
export default class Rect implements IRect {
  dom: SVGRectElement
  x: number
  y: number
  width: number
  height: number
  namespace: string = "http://www.w3.org/2000/svg"
  id: number
  joinpoint: Joinpoint
  dotStatus: boolean = false

  constructor(attrs: Record<string, any>, taskId: number) {
    this.id = taskId
    const {x, y, width, height} = attrs
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.dom = createElementNS(this.namespace, "rect", attrs) as SVGRectElement;
  }

  showDot(callback: Function) {
    if (!this.joinpoint) {
      const leftDot = createElementNS(this.namespace, 'circle', {
        cx: this.x - 15,
        cy: this.y + 13,
        r: 5,
        // fill: '#f0f0f0',
        fill: 'red',
        class: 'gantt-svg-rect-circle'
      }) as SVGCircleElement
      const rightDot = createElementNS(this.namespace, 'circle', {
        cx: this.x + this.width + 15,
        cy: this.y + 13,
        r: 5,
        // fill: '#f0f0f0',
        fill: 'red',
        class: 'gantt-svg-rect-circle'
      }) as SVGCircleElement

      const leftDotMousedown = (ev) => {
        if (ev.button === 0) {
          callback('left','mousedown', this.x, this.y + 13)
        }
      }
      const leftDotMouseup = () => {
        callback('left','mouseup',this.x, this.y + 13)
      }

      const rightDotMousedown = (ev) => {
        if (ev.button === 0) {
          callback('right','mousedown', this.x + this.width, this.y + 13)
        }
      }
      const rightDotMouseup = () => {
        callback('right','mouseup', this.x + this.width, this.y + 13)
      }

      this.dotStatus = true
      leftDot.addEventListener('mousedown', leftDotMousedown)
      rightDot.addEventListener('mousedown', rightDotMousedown)

      leftDot.addEventListener('mouseup', leftDotMouseup)
      rightDot.addEventListener('mouseup', rightDotMouseup)
      
      this.joinpoint = {
        left: leftDot,
        right: rightDot
      }


    }
    
    this.joinpoint.left.setAttribute('cx', String(this.x - 15))
    this.joinpoint.left.setAttribute('cy', String(this.y + 13))
    this.joinpoint.right.setAttribute('cx', String(this.x + this.width + 15))
    this.joinpoint.right.setAttribute('cy', String(this.y + 13))
    this.dom.parentNode.appendChild(this.joinpoint.left)
    this.dom.parentNode.appendChild(this.joinpoint.right)
    this.dotStatus = true

    // this.joinpoint.left.classList.remove('hide')
    // this.joinpoint.right.classList.remove('hide')


  }

  hideDot() {
    if (this.joinpoint && this.dotStatus) {
      this.joinpoint.left.parentNode.removeChild(this.joinpoint.left)
      this.joinpoint.right.parentNode.removeChild(this.joinpoint.right)

      // this.joinpoint.left.classList.add('hide')
      // this.joinpoint.right.classList.add('hide')
      this.dotStatus = false

    }
  }
}