import type { GanttScales, GanttTask } from '@gantt/gantt.d'
export interface ISvg {
  dom: HTMLElement
  svgDom: SVGSVGElement

  setWidth(width: number): void
  renderData(tasks: Array<GanttTask>, scales: Array<GanttScales>): void
  
}