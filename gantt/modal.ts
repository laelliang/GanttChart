import type { IModal } from './modal.d'
import type { GanttTask } from './gantt.d'
import { createElement, formatDate } from './utils/utils'
export default class Modal implements IModal {
  dom: HTMLElement
  formDom: HTMLFormElement
  titleDom: HTMLElement
  saveBtn: HTMLElement
  cancelBtn: HTMLElement
  private _tasks: Array<GanttTask>
  private _task: GanttTask
  private _callback: Function
  private _keys: Array<string> = [ 'start_date', 'end_date', 'id', 'text', 'progress', 'pre_task' ]
  constructor() {
    const title = createElement('h1', {
      class: 'gantt-modal-title'
    })
    const save = createElement('button', {
      type: "button"
    }, ['保存'])
    const cancel = createElement('button', {
      type: "button"
    }, ['取消'])
    // const startDate = createElement('input', { type: 'date', id: 'start_date', name: 'start_date' })
    // const endDate = createElement('input', { type: 'date', id: 'end_date', name: 'end_date' })
    // const taskId = createElement('input', { type: 'text', id: 'id', name: 'id' })
    // const text = createElement('input', { type: 'text', id: 'text', name: 'text' })
    // const progress = createElement('input', { type: 'text', id: 'progress', name: 'progress' })
    // const submit = createElement('input', { type: 'submit', value: '提交' })
    const form = createElement('form', { class: 'gantt-modal-form' }, [
      ['label', undefined, [
        ['span', undefined, ['开始时间：']],
        ['input', { type: 'datetime-local', id: 'start_date', name: 'start_date' }]
      ]],
      ['label', undefined, [
        ['span', undefined, ['结束时间：']],
        ['input', { type: 'datetime-local', id: 'end_date', name: 'end_date' }]
      ]],
      ['label', undefined, [
        ['span', undefined, ['任务id：']],
        ['input', { type: 'number', id: 'id', name: 'id', min: '1', step: '1', pattern: '\d+' }]
      ]],
      ['label', undefined, [
        ['span', undefined, ['任务内容：']],
        ['input', { type: 'text', id: 'text', name: 'text' }]
      ]],
      ['label', undefined, [
        ['span', undefined, ['任务进度：']],
        ['input', { type: 'number', id: 'progress', name: 'progress', min: '0', max: '1', step: '0.01', pattern: '\d+(\.\d{1,2})?' }]
      ]],
      ['label', undefined, [
        ['span', undefined, ['前置任务id：']],
        ['input', { type: 'number', id: 'pre_task', name: 'pre_task', min: '1', step: '1', pattern: '\d+' }]
      ]],
      ['div', { class: 'gantt-modal-footer' }, [
        save, cancel
      ]]
    ])
    const modal = createElement('div', {
      class: 'gantt-modal-overlay'
    }, [
      ['div', { class: 'gantt-modal-container' }, [
        title,
        form
      ]]
    ])

    save.addEventListener('click', this.save.bind(this))
    cancel.addEventListener('click', this.cancel.bind(this))

    this.formDom = form as HTMLFormElement

    this.titleDom = title
    this.saveBtn = save
    this.cancelBtn = cancel

    this.dom = modal
  }

  show(title: string, task: GanttTask | undefined, tasks: Array<GanttTask>, callback: Function) {
    this._callback = callback
    this._tasks = tasks
    if (task) {
      this._task = task
      this._keys.forEach(key => {
        const input = this.formDom.querySelector(`input[name="${key}"]`) as HTMLInputElement
        input.value = task[key]
      })

    }
    this.titleDom.innerText = title
    document.body.appendChild(this.dom)
  }

  save() {
    const formData = new FormData(this.formDom)
    const obj: Record<string, any> = {}
    this._keys.forEach(key => {
      obj[key] = formData.get(key)
    })

    console.log(formData)
    console.log(this._keys)

    console.log(obj)

    if (this.verifyData(obj)) {
      obj.start_date = formatDate(obj.start_date, '%Y-%M-%D %H:%m')
      obj.end_date = formatDate(obj.end_date, '%Y-%M-%D %H:%m')
      obj.id = Number(obj.id)
      if (obj.pre_task) {
        obj.pre_task = Number(obj.pre_task)
      } else {
        obj.pre_task = undefined
      }
      obj.progress = Number(obj.progress)
      console.log(obj)
      if (this._callback) {
        this._callback(obj as GanttTask)
      }
      this._task = undefined
      this.cancel()
      this.formDom.reset()
    }
  }

  verifyData(data: any): boolean {

    if (data.pre_task) {
      data.pre_task = Number(data.pre_task)
      if (this._tasks.findIndex(task => task.id === data.pre_task) < 0) {
        alert(`id为${data.pre_task}前置任务没有找到`)
        return false
      }
    }

    if (new Date(data.start_date).getTime() >= new Date(data.end_date).getTime()) {
      alert('开始时间不得大于等于结束时间')
      return false
    }
    if (!data.id) {
      alert('任务id不得为空')
      return false
    }

    if (this._task && this._task.id !== Number(data.id) && this._tasks.find(tssk => tssk.id === Number(data.id))) {
      alert('任务id重复')
      return false
    }

    return true
  }

  cancel() {
    this.dom.parentNode.removeChild(this.dom)
  }

}