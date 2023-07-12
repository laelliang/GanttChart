import type { GanttTask } from '@gantt/gantt.d'
export interface ITable {
  dom: HTMLElement
  setWidth(width: number): void
  addRow(task: GanttTask): void
  deleteRow(id: Number): void
  delAllRow(): void
}