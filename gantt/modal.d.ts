import type { GanttTask } from './gantt.d'
export interface IModal {
  dom: HTMLElement
  show(title: string, task: GanttTask, tasks: Array<GanttTask>, callback: Function): void
  cancel():void

}