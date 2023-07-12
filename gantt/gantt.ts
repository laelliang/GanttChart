import type { IGantt, GanttTask, GanttScales } from './gantt.d'
import type { ITable } from "./table/table.d"
import type { ISvg } from './svg/svg.d'
import type { ISplitLine } from './splitLine/splitLine.d'
import type { IEventBus } from './eventBus.d'
import type { IModal } from './modal.d'
import EventBus from './eventBus'
import Table from './table/table'
import Svg from './svg/svg'
import SplitLine from './splitLine/splitLine'
import { verifyAndFormatDate } from './utils/utils'
import Modal from './modal'
export default class Gantt implements IGantt {
  scales: Array<GanttScales> = []
  dom: HTMLElement
  tasks: Array<GanttTask> = []
  private _table: ITable
  private _svg: ISvg
  private _splitLine: ISplitLine
  private _eventBus: IEventBus
  private _modal: IModal

  

  constructor() {
    this._eventBus = new EventBus()
    this._modal = new Modal()

    this._eventBus.subscribe('showModal', this.showModal.bind(this))
    this._eventBus.subscribe('setTaskDate', this.setTaskDate.bind(this))
  }


  private init(dom: HTMLElement): void {
    this._table = new Table(this._eventBus)
    this._svg = new Svg(this._eventBus)
    this._splitLine = new SplitLine()
    dom.classList.add('gantt')
    dom.appendChild(this._table.dom)
    dom.appendChild(this._splitLine.dom)
    dom.appendChild(this._svg.dom)
    this._splitLine.moveX((width) => {
      this._table.setWidth(width)
      this._svg.setWidth(width)
    })
    this.dom = dom
  }


  private parse(tasks: Array<GanttTask>): void {
    this._table.delAllRow()

    // 去重
    tasks = tasks.reduce((accumulator, currentValue) => {
      if (accumulator.findIndex(val => val.id == currentValue.id) < 0) {
        accumulator.push(currentValue);
      }
      return accumulator;
    }, []);

    // 校验并格式化
    this.tasks = tasks.map((val: GanttTask): GanttTask => {
      if (val.pre_task !== undefined) {
        const i = tasks.findIndex(task => task.id  === val.pre_task)
        if (i < 0) {
          alert(`id为${val.id}的前置任务没有找到`)
        }
      }
      try {
        val.start_date = verifyAndFormatDate(val.start_date, val.id, 'start_date')
        val.end_date = verifyAndFormatDate(val.end_date, val.id, 'end_date')
      } catch (error) {
        return
      }

      if (new Date(val.start_date) >= new Date(val.end_date)) {
        alert(`id为${val.id}的任务中start_date大于等于end_date`)
        return
      }

      return val
    }).filter(val => val !== undefined)

    this.tasks.forEach(task => {
      this._table.addRow(task)
    })
    
    this._svg.renderData(this.tasks, this.scales)
  }
  private setScales(scales: Array<GanttScales>): void {
    this.scales = scales
  }

  private showModal(id?: number, type: string = 'add') {
    if (type === 'add') {
      this._modal.show("新建任务", undefined, this.tasks, task => {
        this.addTask(task)
      })
    } else if (type === 'edit') {
      const task = this.tasks.find(task => task.id === id)
      if (task) {
        this._modal.show("编辑任务", task, this.tasks, task => {
          this.addTask(task)
        })
      }
    }
  }

  private setTaskDate(id: number, startDate: string, endDate: string) {
    const task = this.tasks.find(task => task.id === id)

    if (task) {
      task.start_date = startDate
      task.end_date = endDate
      this.addTask(task)
    }
  }

  private addTask(task: GanttTask): void {
    const itemIndex = this.tasks.findIndex(val => val.id === task.id)

    // 编辑
    if (itemIndex > -1) {
      this.tasks[itemIndex] = task
    // 新增
    } else {
      this.tasks.push(task)
    }

    // 表格添加行
    this._table.addRow(task)

    console.log(this.tasks)

    // 重新渲染svg
    this._svg.renderData(this.tasks, this.scales)

  }
  private deleteTask(id: number): void {
    const itemIndex = this.tasks.findIndex(val => val.id === id)

    if (itemIndex) {
      this.tasks.splice(itemIndex, 1)

      // 表格删除行
      this._table.deleteRow(id)

      // 重新渲染svg
      this._svg.renderData(this.tasks, this.scales)
    }
  }
  private getTask(id: number): GanttTask | undefined {
    return this.tasks.find(task => task.id === id)
  }
}