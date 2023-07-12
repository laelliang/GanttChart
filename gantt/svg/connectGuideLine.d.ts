import type { IRect } from './rect.d'
export interface IConnectGuideLine{
  dom: SVGPathElement
  namespace: string
  startRect: IRect
  endRect: IRect
  startXY: Array<number>
  endXY: Array<number>
  startRectDirection: string
  endRectDirection: string
  saveStartRect(rect: IRect, direction: string): void
  saveEndRect(rect: IRect, direction: string): void
  setStartXY(x: number, y: number): void
  setEndXY(x: number, y: number): void
}