import type ITable from './table'
import type { ICol } from './col/col.d'
import type { IRow } from './row/row.d'
import type { GanttTask } from '@gantt/gantt.d'
import type { IEventBus } from '@gantt/eventBus.d'
import Row from './row/row'
import Col from './col/col'
import { createElement } from '../utils/utils'

export default class Table implements ITable {
  dom: HTMLElement
  width: number = 300
  cols: Array<ICol> = []
  rows: Array<IRow> = []
  tableDom: HTMLElement
  colgroupDom: HTMLElement
  theadDom: HTMLElement
  tbodyDom: HTMLElement
  private _activeItem: IRow
  private _eventBus: IEventBus;
  constructor(eventBus: IEventBus) {
    this._eventBus = eventBus
    this._eventBus.subscribe('setTableActiveItem', this.setTableActiveItem.bind(this))
    this._eventBus.subscribe('tableScrollSync', this.tableScrollSync.bind(this))
    const tableBox = createElement('div', {
      class: 'gantt-table-box', 
      style: `width: ${this.width}px`
    })
    const tableDom = createElement('table', {
      id: `gantt-table-${Date.now()}`,
      class: 'gantt-table'
    })
    this.tableDom = tableDom
    tableBox.appendChild(tableDom)

    const colgroupDom = createElement('colgroup', {
      class: 'gantt-table-colgroup'
    })
    this.colgroupDom = colgroupDom
    tableDom.appendChild(colgroupDom)

    const theadDom = createElement('thead', {
      class: 'gantt-table-thead'
    })
    this.theadDom = theadDom
    tableDom.appendChild(theadDom)

    const tbodyDom = createElement('tbody', {
      class: 'gantt-table-tbody'
    })
    this.tbodyDom = tbodyDom
    tableDom.appendChild(tbodyDom)
    
    this.dom = tableBox

    this.initHead()

    // 活跃项和添加相关
    this.dom.addEventListener('click',(ev) => {
      const target= ev.target as HTMLElement
      let tr

      const findTr = (dom) => {
        if (dom.parentNode && dom.parentNode.localName === 'tr') {
          tr = dom.parentNode
        } else if (dom && dom.parentNode) {
          findTr(dom.parentNode)
        }
      }
      
      if (target.localName === 'tr') {
        tr = target
      } else {

        // 添加点击
        if (target.classList.contains("gantt-table-tr-add")) {
          const taskId = target.dataset.taskid ? Number(target.dataset.taskid) : undefined
          this._eventBus.publish('showModal', taskId)
        }
        findTr(target)
      }

      const taskId = tr && tr.dataset.taskid ? Number(tr.dataset.taskid) : undefined

      this.setTableActiveItem(taskId)



    })

    // 滚动相关
    this.dom.addEventListener("scroll", (ev) => {
      const scrollTop = (ev.target as Element).scrollTop
      this.tableScrollSync(scrollTop)
    });


  }

  setWidth(width: number): void {
    this.width = width
    this.dom.style.width = `${width}px`
  }

  addRow(task: GanttTask): void {
    const itemIndex = this.rows.findIndex(row => row.id === task.id)

    if (itemIndex > -1) {
      const row = new Row(task)
      this.rows[itemIndex].dom.parentNode.replaceChild(row.dom, this.rows[itemIndex].dom)
      this.rows[itemIndex] = row
    } else {
      const row = new Row(task)
      this.rows.push(row)
      this.tbodyDom.appendChild(row.dom)
    }
  }

  delAllRow(): void {
    this.rows = []
    this.tbodyDom.innerHTML = ''
  }

  deleteRow(id: number): void {
    const itemIndex = this.rows.findIndex(row => row.id === id)

    if (itemIndex > -1) {
      this.tableDom.removeChild(this.rows[itemIndex].dom)
      this.rows.splice(itemIndex, 1)
    }

  }

  private initHead() {
    const headData = [
      { key: 'id', text: 'ID' },
      { key: 'text', text: '任务内容' },
      { key: 'start_date', text: '开始时间' },
      { key: 'end_date', text: '结束时间' },
      { key: 'progress', text: '进度' },
      { key: 'pre_task', text: '前置任务' }

    ]
    const tr = createElement('tr')

    headData.forEach(val => {
      const th = createElement('th', undefined, [val.text])
      tr.appendChild(th)
    })

    const th = createElement('th', undefined,[
      ['div', {class: 'gantt-table-tr-add'}]
    ])
    tr.appendChild(th)

    this.theadDom.appendChild(tr)
  }

  private tableScrollSync(scrollTop?: number, isLinked: boolean = true) {
    if (isLinked) {
      this._eventBus.publish('svgScrollSync', scrollTop, false);
    }
    if (!isLinked) {
      this.dom.scrollTop = scrollTop
    }
  }

  private setTableActiveItem(id?: number, isLinked: boolean = true) {

    if (isLinked) {
      this._eventBus.publish('setSvgActiveItem', id, false);
    }
    if (this._activeItem) {
      this._activeItem.dom.classList.remove('gantt-table-active-item')
    }
    if (id !== undefined) {
      this._activeItem = this.rows.find(row => row.id === id)

    } else {
      this._activeItem = undefined
    }

    if (this._activeItem) {
      this._activeItem.dom.classList.add('gantt-table-active-item')
    }

  }
}