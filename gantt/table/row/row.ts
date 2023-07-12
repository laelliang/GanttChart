import type { IRow } from './row.d'
import { createElement } from '@utils/utils'
import type { GanttTask } from '@gantt/gantt.d'
export default class Row implements IRow {
  dom: HTMLElement
  id: number
  constructor(task: GanttTask) {
    this.id = task.id
    const trDom = createElement('tr', {
      "data-taskid": task.id
    }, [
      ['td', undefined, [task.id]],
      ['td', undefined, [task.text]],
      ['td', undefined, [task.start_date]],
      ['td', undefined, [task.end_date]],
      ['td', undefined, [task.progress]],
      ['td', undefined, [task.pre_task ? task.pre_task : '']],
      ['td', undefined,[
        ['div', { class: 'gantt-table-tr-add', "data-taskid": task.id }]
      ]]
    ])
    this.dom = trDom
  }
}