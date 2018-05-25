import moment from 'moment'

export function getMinute (str) {
  const ar = (str || '').split(/:/)
  if (ar.length === 2 && !isNaN(ar[0]) && !isNaN(ar[1])) {
    return parseInt(ar[0]) * 60 + parseInt(ar[1])
  }
  return 0
}

export function getTime (minute) {
  const h = parseInt(minute / 60)
  const m = minute % 60
  return (h < 10 ? '0' : '') + h.toString() + ':' + (m < 10 ? '0' : '') + m.toString()
}

export function getDuration (start, end) {
  const minuteStart = getMinute(start)
  const minuteEnd = getMinute(end)
  return minuteEnd - minuteStart
}

export function weekToDate (week, isoWeekday, format) {
  if (/^\d{6}$/.test(week)) {
    week = week.toString()
    return moment().year(week.substr(0, 4)).isoWeek(week.substr(4)).isoWeekday(isoWeekday).format(format || 'YYYY-MM-DD')
  }
}
