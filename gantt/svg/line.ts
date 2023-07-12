import type { ILine, Coordinate } from './line.d'
import { createElementNS } from '@utils/utils'
export default class Line implements ILine {
  dom: SVGPathElement
  svgDom: SVGSVGElement
  startDotData: Coordinate
  endDotData: Coordinate
  namespace: string = "http://www.w3.org/2000/svg"
  constructor(svgDom: SVGSVGElement){
    this.dom = createElementNS(this.namespace, 'path', {
      stroke: "black",
      fill: "none",
      "marker-end": "url(#gantt-svg-arrow)"
    }) as SVGPathElement

    this.svgDom = svgDom
    svgDom.appendChild(this.dom)

  }
  connectPoints(startCoordinate: Coordinate, endCoordinate: Coordinate) {
    this.startDotData = startCoordinate
    this.endDotData = endCoordinate
    let arrow = document.getElementById('gantt-svg-arrow') as unknown as SVGMarkerElement || null
    if (!arrow) {
      arrow = createElementNS(this.namespace, 'marker', {
        id: 'gantt-svg-arrow',
        viewBox: "0 0 10 10",
        refX: 10,
        refY: 5,
        markerWidth: 6,
        markerHeight: 6,
        orient: "auto-start-reverse",
        "marker-end": "url(#arrow)"
      }, [
        ['path', { d: "M0,0 L10,5 L0,10", fill: "black" }]
      ]) as SVGMarkerElement
      this.svgDom.appendChild(arrow)
    }
    const d = this.calculatePath(startCoordinate, endCoordinate)
    this.dom.setAttribute('d', d)
  }

  private calculatePath(start: Coordinate, end: Coordinate): string {
    if (start.direction === end.direction && start.direction === 'left') {
      const minX = start.x > end.x ? end.x : start.x
      return `M${start.x},${start.y} H${minX - 30} V${end.y} H${end.x}`
    } else if (start.direction === end.direction && start.direction === 'right') {
      const maxX = start.x > end.x ? start.x : end.x
      return `M${start.x},${start.y} H${maxX + 30} V${end.y} H${end.x}`
    } else if (start.direction !== end.direction  && start.direction === 'left') {
      if (end.x - start.x > -60) {
        return `M${start.x},${start.y} H${start.x - 30} V${start.y > end.y ? start.y - 15 : start.y + 15} H${end.x + 30} V${end.y} H${end.x}`
      } else {
        return `M${start.x},${start.y} H${start.x - 30} V${end.y} H${end.x}`
      }
    } else if (start.direction !== end.direction  && start.direction === 'right') {
      if (start.x - end.x > -60) {
        return `M${start.x},${start.y} H${start.x + 30} V${start.y > end.y ? start.y - 15 : start.y + 15} H${end.x - 30} V${end.y} H${end.x}`
      } else {
        return `M${start.x},${start.y} H${start.x + 30} V${end.y} H${end.x}`
      }
    }
  }
}