export interface IRect {
  dom: SVGRectElement
  x: number
  y: number
  width: number
  height: number
  namespace: string
  id: number
  joinpoint: Joinpoint
  dotStatus: boolean
  showDot(callback: Function): void
  hideDot(): void
}

export interface Joinpoint {
  left: SVGCircleElement,
  right: SVGCircleElement
}
