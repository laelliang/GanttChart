export interface ILine {
  dom: SVGPathElement
  namespace: string
  svgDom: SVGSVGElement
  startDotData: Coordinate
  endDotData: Coordinate
  connectPoints(startCoordinate: Coordinate, endCoordinate: Coordinate): void
}

export interface Coordinate {
  x: number,
  y: number,
  direction: string,
  id: number
}