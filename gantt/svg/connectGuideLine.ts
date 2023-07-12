import type { IConnectGuideLine } from './connectGuideLine.d'
import type { IRect } from './rect.d'
import { createElementNS } from '@utils/utils'
export default class ConnectGuideLine implements IConnectGuideLine { 
  dom: SVGPathElement
  startRect: IRect
  endRect: IRect
  namespace: string = "http://www.w3.org/2000/svg"
  startXY: Array<number>
  endXY: Array<number>
  startRectDirection: string
  endRectDirection: string

  constructor() {
    this.dom = createElementNS(this.namespace, 'path', {
      stroke: "red",
      fill: "none",
      d: 'M0,0',
      "stroke-width": 2,
      "stroke-dasharray": "5,5"
    }) as SVGPathElement
  }

  saveStartRect(rect: IRect, direction: string) {
    this.startRect = rect
    this.startRectDirection = direction
    
  }
  saveEndRect(rect: IRect, direction: string) {
    if (this.startRect.id !== rect.id) {
      this.endRect = rect
      this.endRectDirection = direction

    }
  }

  setStartXY(x: number, y: number) {
    this.startXY = [x,y]
  }

  setEndXY(x: number, y: number) {
    this.endXY = [x,y]

    this.dom.setAttribute('d', `M${this.startXY.join(',')} L${x},${y}`)
  }
}