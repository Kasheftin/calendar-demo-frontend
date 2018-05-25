import $ from 'jquery'

export function getPopupPosition (targetDOM, approximateSize) {
  if (!targetDOM || !$(targetDOM).length) return undefined
  const popupClass = []
  let popupStyle = {}
  const o = $(targetDOM).offset()
  const w = $(targetDOM).width()
  const h = $(targetDOM).height()
  const approximatePopupHeight = (approximateSize || {}).height || 500
  const approximatePopupWidth = (approximateSize || {}).width || 300
  const winH = $(window).height()
  const winW = $(window).width()

  if (winW < o.left + w / 2 + approximatePopupWidth / 2) {
    popupClass.push('-left')
    if (winH < o.top + h / 2 + approximatePopupHeight / 2) {
      popupClass.push('-above')
      popupStyle = {
        left: o.left,
        top: o.top + h
      }
    } else if (o.top + h / 2 - approximatePopupHeight / 2 < 0) {
      popupClass.push('-below')
      popupStyle = {
        left: o.left,
        top: o.top
      }
    } else {
      popupClass.push('-middle')
      popupStyle = {
        left: o.left,
        top: o.top + h / 2
      }
    }
  } else if (o.left + w / 2 - approximatePopupWidth / 2 < 0) {
    popupClass.push('-right')
    if (winH < o.top + h / 2 + approximatePopupHeight / 2) {
      popupClass.push('-above')
      popupStyle = {
        left: o.left + w,
        top: o.top + h
      }
    } else if (o.top + h / 2 - approximatePopupHeight / 2 < 0) {
      popupClass.push('-below')
      popupStyle = {
        left: o.left + w,
        top: o.top
      }
    } else {
      popupClass.push('-middle')
      popupStyle = {
        left: o.left + w,
        top: o.top + h / 2
      }
    }
  } else {
    popupClass.push('-center')
    if (winH < o.top + h + approximatePopupHeight) {
      popupClass.push('-above')
      popupStyle = {
        left: o.left + w / 2,
        top: o.top
      }
    } else {
      popupClass.push('-below')
      popupStyle = {
        left: o.left + w / 2,
        top: o.top + h
      }
    }
  }
  return {
    style: popupStyle,
    class: popupClass
  }
}

export function ensurePopupFitsTheWindow (targetDOM) {
  if (!targetDOM) return undefined
  const rect = targetDOM.getBoundingClientRect()
  const winH = $(window).height()
  const winW = $(window).width()
  let moveX = 0
  let moveY = 0
  if (rect.left < 0) {
    moveX = -rect.left
  }
  if (rect.top < 0) {
    moveY = -rect.top
  }
  if (rect.left + rect.width > winW) {
    moveX = winW - rect.left - rect.width
  }
  if (rect.top + rect.height > winH) {
    moveY = winH - rect.top - rect.height
  }
  return {moveX, moveY}
}
