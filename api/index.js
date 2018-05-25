import axios from 'axios'
import _ from 'underscore'

export default {
  calendar: {
    options:
      [3, (options, params) => axios.get(`calendar/options/`, {params}, options)],
    timeblocks:
      [1, (options, params) => axios.get(`calendar/timeblocks/`, {params}, options)],
    create:
      [0, (options, params) => axios.post(`calendar/timeblocks/`, params, options)],
    update:
      [0, (options, params) => axios.patch(`calendar/timeblocks/${params.id}`, _.omit(params, 'id'), options)]
  }
}
