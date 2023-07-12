import type { ISvg } from './svg.d'
import type { GanttScales, GanttTask } from '@gantt/gantt.d'
import type { IRect } from './rect.d'
import type { ILine } from './line.d'
import type { IEventBus } from '@gantt/eventBus.d'
import type { IConnectGuideLine } from './connectGuideLine.d'
import ConnectGuideLine from './connectGuideLine'
import Rect from './rect'
import Line from './line'
import { createElementNS, createElement, getStandardFormatDate } from '../utils/utils'
export default class Svg implements ISvg {
  dom: HTMLElement
  svgDom: SVGSVGElement
  rectArr: Array<IRect> = []
  lineArr: Array<ILine> = []
  activeRect: IRect
  rectHeight: number = 26
  scales: Array<GanttScales>
  private _isRightButtonClicked: boolean = false
  private _activeBack: SVGRectElement
  private _zoomIn: number
  private _clickX: number
  private _zoomOut: number
  private _minDate: number
  private _connectGuideLine: IConnectGuideLine
  private _activeEvent: string
  private _activeEventRect: IRect
  private _guideLine: SVGGElement
  private _showDotRect: IRect
  namespace: string = "http://www.w3.org/2000/svg"
  private _eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this._eventBus = eventBus
    this._eventBus.subscribe('setSvgActiveItem', this.setSvgActiveItem.bind(this))
    this._eventBus.subscribe('svgScrollSync', this.svgScrollSync.bind(this))
    const svgBox = createElement('div', {
      class: 'gantt-svg-box',
      style: 'width: calc(100% - 300px)'
    })
    const svgDom = createElementNS(this.namespace, 'svg', {
      id: `gantt-svg-${Date.now()}`,
      class: 'gantt-svg'
    })
    svgBox.appendChild(svgDom)
    this.svgDom = svgDom as SVGSVGElement
    this.dom = svgBox

    this.dom.addEventListener('mousedown', (ev:MouseEvent) => {
      if (ev.button === 0) {
        this._isRightButtonClicked = true
      }

      this._clickX = ev.clientX


      // 设置活跃项
      const target= ev.target as Element
      let rect
      const findRect = (dom) => {
        if (dom.parentNode && dom.parentNode.localName === 'rect') {
          rect = dom.parentNode
        } else if (dom && dom.parentNode) {
          findRect(dom.parentNode)
        }
      }
      if (target.localName === 'rect') {
        rect = target
      } else {
        findRect(target)
      }
      
      this.svgDom.appendChild(this._guideLine)
      const taskId = rect && rect.dataset.taskid ? Number(rect.dataset.taskid) : undefined
      this.setSvgActiveItem(taskId)
    })
    document.body.addEventListener('mouseup', (ev) => {
      if (this._isRightButtonClicked) {
        this._isRightButtonClicked = false
      }
      if (this._activeEventRect && this._activeEvent) {
        const x = parseFloat(this._activeEventRect.dom.getAttribute('x'))
        const width = parseFloat(this._activeEventRect.dom.getAttribute('width'))
        const startDate = getStandardFormatDate(this._minDate + x * this._zoomOut / this._zoomIn * 60 * 1000)
        const endDate = getStandardFormatDate(this._minDate + ( x + width ) * this._zoomOut / this._zoomIn * 60 * 1000)
        this._activeEventRect.x = x
        this._activeEventRect.width = width
        this._eventBus.publish('setTaskDate', this._activeEventRect.id, startDate, endDate)
      }
      if (this._activeEvent) {
        this._activeEvent = undefined
        this._activeEventRect = undefined
        this.svgDom.style.cursor = 'default'
        this._guideLine.setAttribute('transform', 'translate(-300, 0)')
        this.svgDom.removeChild(this._guideLine)
      }

      if (this._connectGuideLine) {
        const line = new Line(this.svgDom)
        line.connectPoints({
          id: this._connectGuideLine.startRect.id,
          direction: this._connectGuideLine.startRectDirection,
          x: this._connectGuideLine.startXY[0],
          y: this._connectGuideLine.startXY[1]
        }, {
          id: this._connectGuideLine.endRect.id,
          direction: this._connectGuideLine.endRectDirection,
          x: this._connectGuideLine.endXY[0],
          y: this._connectGuideLine.endXY[1]
        })
        this.lineArr.push(line)
        this.svgDom.removeChild(this._connectGuideLine.dom)
        this._connectGuideLine = undefined
      }
    })
    const mouseXY = {
      x: undefined,
      y: undefined
    }
    document.addEventListener('mousemove', (ev:MouseEvent) => {
      const { left, top } = this.svgDom.getBoundingClientRect()
      const { clientX, clientY } = ev

      if (mouseXY.x === clientX && mouseXY.y === clientY) {
        return
      }
      const index = Math.ceil((clientY - 10) / 30)  - 2

      const x = clientX - left
      const rect = this.rectArr[index]

      // 移动
      if (this._activeEvent === 'move' || (!this._activeEvent && rect && x - rect.x >= 10  && rect.x + rect.width - x >= 10)) {
        if (this._clickX && this._isRightButtonClicked) {
          this._activeEvent = 'move'
          if (this._activeEventRect) {
            this.moveRect(this._activeEventRect, clientX)
          } else {
            this._activeEventRect = rect
            this.moveRect(rect, clientX)
          }
        } else if (this.svgDom.style.cursor !== 'move') {
          this.svgDom.style.cursor = 'move'
        }
      // 左拉伸 
      } else if (this._activeEvent === 'resizeLeft' || (!this._activeEvent && rect && Math.abs(x - rect.x) < 10)) {
        if (this._clickX && this._isRightButtonClicked) {
          this._activeEvent = 'resizeLeft'
          if (this._activeEventRect) {
            this.resizeRect(this._activeEventRect, clientX, 'start')
          } else {
            this._activeEventRect = rect
            this.resizeRect(rect, clientX, 'start')
          }
        } else if (this.svgDom.style.cursor !== 'ew-resize') {
          this.svgDom.style.cursor = 'ew-resize'
        }
      // 右拉伸
      } else if (this._activeEvent === 'resizeRight' || (!this._activeEvent && rect && Math.abs(x - rect.x - rect.width) < 10)) {
        if (this._clickX && this._isRightButtonClicked) {
          this._activeEvent = 'resizeRight'
          if (this._activeEventRect) {
            this.resizeRect(this._activeEventRect, clientX, 'end')
          } else {
            this._activeEventRect = rect
            this.resizeRect(rect, clientX, 'end')
          }
        } else if (this.svgDom.style.cursor !== 'ew-resize') {
          this.svgDom.style.cursor = 'ew-resize'
        }


      // 显示连接点 
      } else if (this.svgDom.style.cursor !== 'default') {
        this.svgDom.style.cursor = 'default'
      }

      // 移动连接线
      if (this._activeEvent && this._activeEventRect) {
        const line1 = this.lineArr.find(line => line.startDotData.id === this._activeEventRect.id)
        const activeEventRectX = parseFloat(this._activeEventRect.dom.getAttribute('x'))
        const activeEventRectWidth = parseFloat(this._activeEventRect.dom.getAttribute('width'))
        if (line1) {
          if (line1.startDotData.direction === 'left') {
            line1.connectPoints({
              ...line1.startDotData,
              x: activeEventRectX
            }, line1.endDotData)
          } else if (line1.startDotData.direction === 'right') {
            line1.connectPoints({
              ...line1.startDotData,
              x: activeEventRectX + activeEventRectWidth
            }, line1.endDotData)
          }
        } else {
          const line2 = this.lineArr.find(line => line.endDotData.id === this._activeEventRect.id)
          if (line2) {
            if (line2.endDotData.direction === 'left') {
              line2.connectPoints(
                line2.startDotData,
                {
                  ...line2.endDotData,
                  x: activeEventRectX
                }
              )
            } else if (line2.endDotData.direction === 'right') {
              line2.connectPoints(
                line2.startDotData,
                {
                  ...line2.endDotData,
                  x: activeEventRectX + activeEventRectWidth
                }
              )
            }
          }
        }
      }

      if (this._activeEvent === 'connectLine' && this._connectGuideLine) {
        this._connectGuideLine.setEndXY(clientX - left, clientY - top)
      }


      
      // 显示连接点
      if ((['move', 'resizeLeft', 'resizeRight'].find(val => val === this._activeEvent) && this._showDotRect) || (this._showDotRect && this._showDotRect !== rect)) {
        this._showDotRect.hideDot()
      }
      
      if (!['move', 'resizeLeft', 'resizeRight'].find(val => val === this._activeEvent) && rect && x - rect.x >= -20  && x - rect.x - rect.width <= 20 && !rect.dotStatus) {
        this._showDotRect = rect
        rect.showDot((direction, evType, x, y) => {
          const rectCopy = rect
          if (evType === 'mousedown') {
            this._activeEvent = 'connectLine'
            this._connectGuideLine = new ConnectGuideLine()
            this._connectGuideLine.saveStartRect(rectCopy, direction)
            this._connectGuideLine.setStartXY(x,y)
            this.svgDom.appendChild(this._connectGuideLine.dom)
          } else if (evType === 'mouseup' && this._connectGuideLine) {
            this._connectGuideLine.saveEndRect(rectCopy, direction)
            this._connectGuideLine.setEndXY(x,y)
          }
        })
      }

    })
    const rect = createElementNS(this.namespace, 'rect', {
      x: 0,
      y: -100,
      width: '100%',
      height: 30,
      fill: '#fff3a1',
      "data-not-delete": true
    })
    const g = createElementNS(this.namespace, 'g', {
      transform: "translate(-300, 0)",
      "data-not-delete": true
    }, [
      ['line', { x1: '-1', y1: '0', x2: '1', y2: '100%', stroke: 'red', "stroke-width": "1", "stroke-dasharray": "4 4"}],
      ['text', { x: '6', y: '0', fill: 'red', "text-anchor": "start", "dominant-baseline": "middle"}, ['2023-01-02 19:33']]
    ])
    // "text-anchor":"middle",
    // "dominant-baseline": "middle",
    this._guideLine = g as SVGGElement
    this._activeBack = rect as SVGRectElement
    this.svgDom.append(this._activeBack)

    // 滚动相关
    this.dom.addEventListener("scroll", (ev) => {
      const scrollTop = (ev.target as Element).scrollTop
      this.svgScrollSync(scrollTop)
    });
  }

  setWidth(width: number) {
    this.dom.style.width = `calc(100% - ${width}px)`
  }

  private moveRect(rect: IRect, clientX: number) {
    let x = clientX - this._clickX + rect.x
    x = x < 0 ? 0 : x

    const domX = rect.dom.getAttribute('x')
    if (Number(domX) > x) {
      this.setGuideLine(rect, x)
    } else if (Number(domX) < x) {
      this.setGuideLine(rect, x + rect.width, 'end')
    }
    rect.dom.setAttribute('x', String(x))
  }

  private resizeRect(rect: IRect, clientX: number, textAnchor: string) {
    if (textAnchor === 'start') {
      let x = clientX - this._clickX + rect.x
      x = x < 0 ? 0 : x
      let width = rect.x + rect.width - x
      width = width > 30 ? width : 30
      rect.dom.setAttribute('x', String(x))
      rect.dom.setAttribute('width', String(width))
      this.setGuideLine(rect, x)
    } else if (textAnchor === 'end') {
      let width = clientX - this._clickX + rect.width
      width = width > 30 ? width : 30
      rect.dom.setAttribute('width', String(width))
      this.setGuideLine(rect, rect.x + width, 'end')
    }
  }


  renderData(tasks: Array<GanttTask>, scales: Array<GanttScales>) {
    this.scales = scales
    this.delAllDomAndData()
    let minDate // tasks中最小的时间
    let maxDate // tasks中最大的时间
    let minTimeLevel = 5 // scales中最小的时间级别
    const headData = {} //svg head 部分数据
    let headDataKeys = []
    let headRowHeight = 40 //每个scales的高度
    let zoomIn // 放大倍数,1分钟等于1px，然后放大zoomIn倍
    let zoomOut // 缩小倍数,根据minTimeLevel对宽度进行缩小，因为一年有365* 24 * 60 分钟，如果Scales“最小”为年，还是太宽
    const timeLevel = {
      year: 5,
      month: 4,
      day: 3,
      hour: 2,
      minute: 1
    }

    // 选出最大最小时间
    tasks.forEach(task => {
      const startDateTimestamp = new Date(task.start_date).getTime();
      const endDateTimestamp = new Date(task.end_date).getTime();

      if (startDateTimestamp > endDateTimestamp) {
        maxDate = maxDate > startDateTimestamp ? maxDate : startDateTimestamp
        minDate = minDate < endDateTimestamp ? minDate : endDateTimestamp
      } else {
        maxDate = maxDate > endDateTimestamp ? maxDate : endDateTimestamp
        minDate = minDate < startDateTimestamp ? minDate : startDateTimestamp
      }
    })


    // 左右加些空间
    const milliseconds = (maxDate - minDate) / 3
    minDate -= milliseconds
    maxDate += milliseconds

    this._minDate = minDate

    
    // 选出最小的时间级别
    scales.forEach(val => {
      minTimeLevel = minTimeLevel > timeLevel[val.unit] ? timeLevel[val.unit] : minTimeLevel
    })

    // 根据最小时间级别和最大最小时间确定宽度
    scales.forEach(val => {
      if (val.unit === 'minute') {
        const date = new Date(minDate)
        let endOfMinuteTimestamp = minDate
        headData[val.unit] = []
        while(endOfMinuteTimestamp <= maxDate) {
          const minute = String(date.getMinutes)
          if (!zoomIn) {
            zoomIn = (val.format.replace("%m", minute).length + 1) * 10
          }
          // x即为分钟数 * 放大倍数
          headData[val.unit].push({
            x: (endOfMinuteTimestamp - minDate) / 1000 / 60 * zoomIn,
            text: val.format.replace("%m", minute)
          })
          date.setMinutes(date.getMinutes() + val.step) //设置成下一分钟
          date.setSeconds(0) //0秒
          endOfMinuteTimestamp = date.setMilliseconds(0) //0毫秒
        }
      } else if (val.unit === 'hour') {
        const date = new Date(minDate)
        let endOfHourTimestamp = minDate
        headData[val.unit] = []
        while(endOfHourTimestamp <= maxDate) {
          const hour = String(date.getHours())
          if (!zoomIn) {
            zoomIn = (val.format.replace("%H", hour).length + 1) * 10
          }
          // x即为分钟数 * 放大倍数
          headData[val.unit].push({
            x: (endOfHourTimestamp - minDate) / 1000 / 60 * zoomIn,
            text: val.format.replace("%H", hour)
          })
          date.setHours(date.getHours() + val.step) //设置成下一小时
          date.setMinutes(0) //0分钟
          date.setSeconds(0) //0秒
          endOfHourTimestamp = date.setMilliseconds(0) //0毫秒
        }
      } else if (val.unit === 'day') {
        const date = new Date(minDate)
        let endOfDayTimestamp = minDate
        headData[val.unit] = []
        while(endOfDayTimestamp <= maxDate) {
          const month = String(date.getMonth() + 1)
          const year = String(date.getFullYear())
          const day = String(date.getDate())
          if (!zoomIn) {
            zoomIn = (val.format.replace("%Y", year).replace("%M", month).replace("%D", day).length + 1) * 10
          }
          // x即为分钟数 * 放大倍数
          headData[val.unit].push({
            x: (endOfDayTimestamp - minDate) / 1000 / 60 * zoomIn,
            text: val.format.replace("%Y", year).replace("%M", month).replace("%D", day)
          })
          date.setDate(date.getDate() + val.step) //设置下一天
          date.setHours(0) //设置成0点
          date.setMinutes(0) //0分钟
          date.setSeconds(0) //0秒
          endOfDayTimestamp = date.setMilliseconds(0) //0毫秒
        }

      } else if (val.unit === 'month') {
        const date = new Date(minDate)
        let endOfMonthTimestamp = minDate
        headData[val.unit] = []
        while(endOfMonthTimestamp <= maxDate) {
          const month = String(date.getMonth() + 1)
          const year = String(date.getFullYear())
          if (!zoomIn) {
            zoomIn = (val.format.replace("%Y", year).replace("%M", month).length + 1) * 10
          }
          // x即为分钟数 * 放大倍数
          headData[val.unit].push({
            x: (endOfMonthTimestamp - minDate) / 1000 / 60 * zoomIn,
            text: val.format.replace("%Y", year).replace("%M", month)
          })
          date.setMonth(date.getMonth() + val.step) //设置成下一个月
          date.setDate(1) //设置成月初第一天
          date.setHours(0) //设置成0点
          date.setMinutes(0) //0分钟
          date.setSeconds(0) //0秒
          endOfMonthTimestamp = date.setMilliseconds(0) //0毫秒
        }

      } else if (val.unit === 'year') {
        const date = new Date(minDate)
        let endOfYearTimestamp = minDate
        headData[val.unit] = []
        while(endOfYearTimestamp <= maxDate) {
          const year = date.getFullYear()
          if (!zoomIn) {
            zoomIn = (val.format.replace("%Y", String(year)).length + 1) * 10
          }
          // x即为分钟数 * 放大倍数
          headData[val.unit].push({
            x: (endOfYearTimestamp - minDate) / 1000 / 60 * zoomIn,
            text: val.format.replace("%Y", String(year))
          })
          date.setFullYear(date.getFullYear() + val.step)
          date.setMonth(0) //设置成第一个月
          date.setDate(1) //设置成月初第一天
          date.setHours(0) //设置成0点
          date.setMinutes(0) //0分钟
          date.setSeconds(0) //0秒
          endOfYearTimestamp = date.setMilliseconds(0) //0毫秒
        }
      }
    })

    // 补全坐标
    headDataKeys = Object.keys(headData).sort((a, b) => timeLevel[a] - timeLevel[b])
    headDataKeys.forEach((key, i) => {
      headData[key].push({
        x: (maxDate - minDate) / 1000 / 60 * zoomIn,
        text: ''
      })
    })



    // 计算zoomOut
    const svgBoxWidth = this.dom.getBoundingClientRect().width
    for (let key in headData) {
      if (timeLevel[key] === minTimeLevel) {
        zoomOut = (maxDate - minDate) / 1000 / 60 / (headData[key].length - 1)
        const num = svgBoxWidth / ((maxDate - minDate) / 1000 / 60 * zoomIn / zoomOut)
        zoomOut = num > 1 ? zoomOut / num : zoomOut
      }
    }

    // 生成dom并添加
    headRowHeight = 40 / headDataKeys.length
    headDataKeys.forEach((key, i) => {
      const points = headData[key].map(val => {
        return `${val.x / zoomOut},${40 - i * headRowHeight} ${val.x / zoomOut},${40 - (i+1) * headRowHeight} ${val.x / zoomOut},${40 - i * headRowHeight}`
      })
      const polyline = createElementNS(this.namespace, 'polyline', {
        points,
        fill: "node",
        stroke: "black"
      })
      this.svgDom.setAttribute('width', String((maxDate - minDate) / 1000 / 60 * zoomIn / zoomOut))

      const defs = createElementNS(this.namespace, 'defs')
      headData[key].forEach((val, j) => {
        const next = headData[key][j+1]
        if (next) {
          const clipPath = createElementNS(this.namespace, 'clipPath', { id: `clip-path-${key}-${j}` }, [
            ['rect', {
              x: val.x / zoomOut,
              y: 40 - ( i + 1 ) * headRowHeight + 1,
              width: (next.x - val.x) / zoomOut,
              height: headRowHeight
            }]
          ])

          const text = createElementNS(this.namespace, 'text', {
            x: (val.x + next.x) / zoomOut / 2,
            y: 40 - (i + 0.5) * headRowHeight + 1,
            stroke: "black",
            "clip-path": `url(#clip-path-${key}-${j})`,
            "text-anchor":"middle",
            "dominant-baseline": "middle",
            class: 'gantt-svg-head-text'
          }, [val.text] )
          defs.appendChild(clipPath)
          this.svgDom.appendChild(text)
        }
      })
      this.svgDom.appendChild(defs)
      this.svgDom.appendChild(polyline)

    })
    const defs = createElementNS(this.namespace, 'defs')
    tasks.forEach((task, i) => {
      const startDateTimestamp = new Date(task.start_date).getTime();
      const endDateTimestamp = new Date(task.end_date).getTime();
      

      const linearGradient = createElementNS(this.namespace, 'linearGradient', { id: `linear-gradient-${task.id}` }, [
        ['stop', { offset: '0%', style: 'stop-color: #7fb80e' }],
        ['stop', { offset: `${task.progress * 100}%`, style: 'stop-color: #7fb80e' }],
        ['stop', { offset: `${task.progress * 100}%`, style: 'stop-color: #1296db' }],
        ['stop', { offset: '100%', style: 'stop-color: #1296db' }],
      ])
      defs.appendChild(linearGradient)
      const rect = new Rect({
        x: (startDateTimestamp - minDate) / 1000 / 60 * zoomIn / zoomOut,
        y: 40 + i * 30 + (30 - this.rectHeight) / 2,
        rx: 4,
        ry: 4,
        "data-taskid": task.id,
        width: (endDateTimestamp - startDateTimestamp) / 1000 / 60 * zoomIn / zoomOut,
        height: this.rectHeight,
        fill: `url(#linear-gradient-${task.id})`,
        class: 'gantt-svg-rect'
      }, task.id)

      this.rectArr.push(rect)
      this.svgDom.appendChild(rect.dom)
    })

    tasks.forEach((task, i) => {
      if (task.pre_task) {
        const startRect = this.rectArr.find(rect => rect.id === task.pre_task)
        const endRect = this.rectArr.find(rect => rect.id === task.id)
        if (startRect && endRect) {
          const line = new Line(this.svgDom)
          line.connectPoints({
            id: startRect.id,
            direction: 'right',
            x: startRect.x + startRect.width,
            y: startRect.y + 13
          }, {
            id: endRect.id,
            direction: 'left',
            x: endRect.x,
            y: endRect.y + 13
          })
          this.lineArr.push(line)
        }
      }
    })


    this.svgDom.appendChild(defs)

    this.svgDom.setAttribute('height', String(40 + tasks.length * 30))
    this._zoomIn = zoomIn
    this._zoomOut = zoomOut

  }

  private delAllDomAndData () {
    for (const dom of Array.from(this.svgDom.children)) {
      if (!(dom as SVGAElement).dataset.notDelete) {
        this.svgDom.removeChild(dom);
      }
    }
    this.rectArr = []
    this.lineArr = []
  }

  private setSvgActiveItem(id?: number, isLinked: boolean = true) {
    if (isLinked) {
      this._eventBus.publish('setTableActiveItem', id, false)
    }
    if (id !== undefined) {
      this.activeRect = this.rectArr.find(rect => rect.id === id)
      this._activeBack.setAttribute('y', String(this.activeRect.y - (30 - this.rectHeight) / 2))
    } else {
      this.activeRect = undefined
      this._activeBack.setAttribute('y', '-100')
    }
  }

  private svgScrollSync(scrollTop?: number, isLinked: boolean = true) {
    if (isLinked) {
      this._eventBus.publish('tableScrollSync', scrollTop, false);
    }
    if (!isLinked) {
      this.dom.scrollTop = scrollTop
    }
  }

  private setGuideLine(rect: IRect, x:number, textAnchor: string = 'start'): void {
    this._guideLine.setAttribute('transform', `translate(${x}, 0)`)
    const y = rect.y < 70 ? 85 : rect.y - 15
    const text = this._guideLine.children[1]
    text.setAttribute('y', String(y))
    const timestamp = this._minDate + x * this._zoomOut / this._zoomIn * 60 * 1000
    const dateStr = getStandardFormatDate(timestamp)
    text.innerHTML = dateStr

    if (text.getAttribute('text-anchor') !== textAnchor) {
      if (textAnchor === 'start') {
        text.setAttribute('x', '6')
      } else if (textAnchor === 'end') {
        text.setAttribute('x', '-6')
      }
      text.setAttribute('text-anchor', textAnchor)

    }
  }
}