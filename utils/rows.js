import moment from 'moment'
import {getTime} from '~/utils/time'

export function timeblocksOverlap (t1, t2) {
  if (!t1.minuteDuration) return t2.minuteStart <= t1.minuteStart && t2.minuteStart + t2.minuteDuration >= t1.minuteStart
  if (!t2.minuteDuration) return t1.minuteStart <= t2.minuteStart && t1.minuteStart + t1.minuteDuration >= t2.minuteStart
  return Math.min(t1.minuteStart + t1.minuteDuration, t2.minuteStart + t2.minuteDuration) - Math.max(t1.minuteStart, t2.minuteStart) > 0
}

// The obj is the object like {extraLines: 0, timeblocks: [..]} and may have additional properties;
// The timeblock is the object like {extraLines: 0, line: 0, minuteStart: .., minuteDuration: ..} and may have additional properties;
// The function will mutate the incomming obj: change `extraLines` property and sort the timeblocks;
// It will mutate each timeblock as well: change `extraLines` and `line` properties;
export function handleOverlap (obj) {
  if (!obj || !obj.timeblocks || obj.timeblocks.length === 0) return obj
  const lines = []
  obj.timeblocks.sort((t1, t2) => t1.minuteStart - t2.minuteStart)
  obj.timeblocks.forEach(t => {
    let l = 0
    for (l = 0; l < lines.length; l++) {
      if (lines[l].minuteEnd <= t.minuteStart) break
    }
    t.line = l
    if (l < lines.length) {
      lines[l].timeblocks.push(t)
      lines[l].minuteEnd = t.minuteStart + t.minuteDuration
    } else {
      lines.push({
        timeblocks: [t],
        minuteEnd: t.minuteStart + t.minuteDuration
      })
    }
  })
  obj.extraLines = lines.length - 1
  // Now we'll check if the timeblock can be stretched or not. That's the complex task in general (chaining timeblocks problem), we'll simplify it and stretch only the timeblocks without neighbours.
  if (obj.extraLines > 0) {
    obj.timeblocks.forEach(t1 => {
      const t2 = obj.timeblocks.find(t => t1.id !== t.id && timeblocksOverlap(t1, t))
      if (t2) {
        t1.extraLines = obj.extraLines
      } else {
        t1.extraLines = 0
        t1.line = 0
      }
    })
  }
  return obj
}

export function prepareRows (state) {
  const rows = {}
  state.weekdays.forEach(day => {
    const subrows = {}
    state.locations.forEach(location => {
      subrows[location.id] = {
        id: day.date + '-' + location.id,
        title: location.name,
        locationId: location.id,
        extraLines: 0,
        timeblocks: []
      }
    })
    rows[day.isoWeekday] = {
      id: day.date,
      date: day.date,
      dayId: day.id,
      title: moment(day.date).format('ddd, DD.MM'),
      subrows
    }
  })
  state.timeblocks.forEach(timeblock => {
    if (timeblock.dayOfWeek && timeblock.location) {
      const row = rows[timeblock.dayOfWeek.isoWeekday]
      if (row) {
        const subrow = row.subrows[timeblock.location.id]
        if (subrow) {
          subrow.timeblocks.push({
            ...timeblock,
            startTime: getTime(timeblock.minuteStart),
            endTime: getTime(timeblock.minuteStart + timeblock.minuteDuration),
            minuteStart: timeblock.minuteStart,
            minuteDuration: timeblock.minuteDuration,
            extraLines: 0,
            line: 0
          })
        }
      }
    }
  })

  return Object.values(rows).map(row => ({...row, subrows: Object.values(row.subrows).map(handleOverlap)}))
}
