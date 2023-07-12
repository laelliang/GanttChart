export const createElement = (type: string, attrs?: Record<string, any>, children?: any[]): HTMLElement => {
  const dom = document.createElement(type)
  if (attrs) {
    Object.keys(attrs).forEach(key => {
      dom.setAttribute(key, attrs[key])
    })
  }
  if (children) {
    children.forEach(val => {
      if (Array.isArray(val)) {
        dom.appendChild(createElement(val[0], val[1], val[2]))
      } else if (val instanceof HTMLElement) {
        dom.appendChild(val)
      } else {
        const textNode = document.createTextNode(val);
        dom.appendChild(textNode)
      }
    })
  }
  return dom
}

export const createElementNS = (namespace: string, type: string, attrs?: Record<string, any>, children?: any[]): Element | MathMLElement | SVGElement | HTMLElement | SVGRectElement => {
  const dom = document.createElementNS(namespace, type)
  if (attrs) {
    Object.keys(attrs).forEach(key => {
      dom.setAttribute(key, attrs[key])
    })
  }
  if (children) {
    children.forEach(val => {
      if (Array.isArray(val)) {
        dom.appendChild(createElementNS(namespace, val[0], val[1], val[2]))
      } else {
        const textNode = document.createTextNode(val);
        dom.appendChild(textNode)
      }
    })
  }
  return dom
}


export const verifyAndFormatDate = (dateStr: string, id: number, key: string) => {

  const regex = /^(\d{4})[-/](0?[1-9]|1[0-2])[-/]([0-3]?[1-9]) ([0-2]?[0-9]):([0-6][0-9])$/
  // 验证时间格式 20xx-01-01 01:01
  if (!regex.test(dateStr)) {
    const msg = `id为${id}的任务中${key}字段格式不正确，${dateStr}`
    alert(msg)
    throw new Error(msg)
  }

  const result = regex.exec(dateStr)
  
  if (!/^20\d{2}$/.test(result[1])) {
    const msg = `id为${id}的任务中${key}字段的日期不支持，仅支持20xx年的日期`
    alert(msg)
    throw new Error(msg)
  }

  const date = new Date(Number(result[1]), Number(result[2]) - 1)
  const month = date.getMonth() + 1;
  date.setMonth(month);
  date.setDate(0);

  if (Number(result[3]) === 0 && Number(result[3]) > date.getDate()) {
    const msg = `id为${id}的任务中${result[0]}日期错误`
    alert(msg)
    throw new Error(msg)
  }

  if (Number(result[4]) === 0 && Number(result[4]) > 23) {
    const msg = `id为${id}的任务中${result[0]}小时错误`
    alert(msg)
    throw new Error(msg)
  }
  if (Number(result[5]) === 0 && Number(result[5]) > 59) {
    const msg = `id为${id}的任务中${result[0]}分钟错误`
    alert(msg)
    throw new Error(msg)

  }
  
  return `${result[1]}-` + 
  `${result[2].length === 2 ? result[2] : '0' + result[2]}-` + 
  `${result[3].length === 2 ? result[3] : '0' + result[3]} ` +
  `${result[4].length === 2 ? result[4] : '0' + result[4]}:` +
  `${result[5].length === 2 ? result[5] : '0' + result[5]}`

}

export const formatDate = (dateString, format) => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  let formattedDate = format
    .replace('%Y', year)
    .replace('%M', month)
    .replace('%D', day)
    .replace('%H', hours)
    .replace('%m', minutes)

  return formattedDate;
}

export const getStandardFormatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}



