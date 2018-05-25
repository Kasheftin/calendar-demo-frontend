import {getTime, getMinute, getDuration} from '~/utils/time'

export default {
  watch: {
    'innerData.end' (value) {
      this.startEndDurationCalc('end')
    },
    'innerData.minuteDuration' (value) {
      this.startEndDurationCalc('duration')
    }
  },
  methods: {
    startEndDurationCalc (from) {
      if (this._startEndDurationCalcTimeout) clearTimeout(this._startEndDurationCalcTimeout)
      this._startEndDurationCalcTimeout = setTimeout(() => {
        if (this._startEndDurationCalcRunning) return false
        this._startEndDurationCalcRunning = true
        if (from === 'end') {
          if (this.innerData.start && this.innerData.end) {
            const duration = getDuration(this.innerData.start, this.innerData.end)
            if (duration) {
              this.innerData.minuteDuration = duration
            }
          }
        } else if (from === 'duration') {
          const minute = getMinute(this.innerData.start) + parseInt(this.innerData.minuteDuration)
          if (minute && !isNaN(minute)) {
            this.innerData.end = getTime(minute)
          }
        }
        setTimeout(() => {
          this._startEndDurationCalcRunning = false
        }, 300)
      }, 200)
    }
  }
}
