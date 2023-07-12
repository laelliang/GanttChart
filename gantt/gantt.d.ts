export interface IGantt {
  dom: HTMLElement
  scales: Array<GanttScales>
}

export interface GanttScales {
  unit: string,
  step: number,
  format: string
}

export interface GanttTask {
  id: number,
  text: string,
  start_date: string,
  end_date: string,
  progress: number,
  pre_task?: number
}

