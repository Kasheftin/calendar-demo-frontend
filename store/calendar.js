import {weekToDate} from '~/utils/time'
import {prepareRows} from '~/utils/rows'

export const state = () => {
  return {
    calendar_id: null,
    week: null,
    statuses: [],
    locations: [],
    colors: [],
    weekdays: [],
    timeblocks: [],
    minuteStart: 15 * 60,
    minuteEnd: 24 * 60,
    minuteInterval: 30,
    defaultOptions: {
      menu: {
        transition: 'scale-transition',
        offsetY: true,
        nudgeRight: 40,
        fullWidth: true,
        minWidth: '290px',
        maxWidth: '290px',
        closeOnContentClick: false
      },
      timePicker: {
        format: '24hr',
        allowedMinutes: [0, 15, 30, 45]
      },
      datePicker: {
        firstDayOfWeek: 1,
        noTitle: true,
        scrollable: true
      }
    },
    timeblockFields: {
      name: {key: 'name', type: 'text', label: 'Name', size: 'xs12'},
      description: {key: 'description', type: 'text', label: 'Description', size: 'xs12'},
      dayOfWeek: {key: 'dayOfWeek', type: 'select', label: 'Day Of Week', size: 'xs6', dataSource: 'state.calendar.weekdays'},
      status: {key: 'status', type: 'select', label: 'Status', size: 'xs6', dataSource: 'state.calendar.statuses'},
      minuteStart: {key: 'minuteStart', type: 'minuteTime', label: 'Start Time', size: 'xs6'},
      minuteDuration: {key: 'minuteDuration', type: 'minuteDuration', label: 'Duration', size: 'xs6'},
      location: {key: 'location', type: 'select', label: 'Location', size: 'xs12', dataSource: 'state.calendar.locations'},
      color: {key: 'color', type: 'select', label: 'Color', size: 'xs12', dataSource: 'state.calendar.colors'}
    },
    drawingBlockMinuteStep: 15,
    drawingBlockMinimalMinuteDuration: 15
  }
}

export const getters = {
  dateFrom (state) { return weekToDate(state.week, 1) },
  dateTo (state) { return weekToDate(state.week, 7) },
  rows (state) { return prepareRows(state) },
  blockMap (state, getters) {
    const map = {}
    getters.rows.forEach((row, rowIndex) => {
      row.subrows.forEach((subrow, subrowIndex) => {
        subrow.timeblocks.forEach((timeblock, timeblockIndex) => {
          map[timeblock.id] = {rowIndex, subrowIndex, timeblockIndex}
        })
      })
    })
    return map
  }
}

export const mutations = {
  set (state, data) {
    Object.keys(data).forEach(key => {
      if (state.hasOwnProperty(key)) {
        state[key] = data[key]
      }
    })
  }
}

export const actions = {
  set ({commit}, data) {
    commit('set', data)
    return Promise.resolve()
  },
  fetch ({state, dispatch, rootState}, force) {
    return Promise.resolve()
      .then(() => dispatch('fetch/fetch', {path: 'calendar.options'}, {root: true}))
      .then(response => dispatch('set', {
        statuses: response.data.data.status.options,
        locations: response.data.data.location.options,
        colors: response.data.data.color.options,
        weekdays: response.data.data.dayOfWeek.options.map(rw => ({...rw, date: weekToDate(state.week, rw.isoWeekday)}))
      }))
      .then(() => dispatch('fetch/fetch', {path: 'calendar.timeblocks', data: {week: state.week, ...rootState.ux.settings}, options: {force}}, {root: true}))
      .then(response => dispatch('set', {
        timeblocks: response.data.data
      }))
  }
}
