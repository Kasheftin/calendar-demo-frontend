<template>
  <div class="ev-calendar">
    <div class="ev-calendar-header">
      <div
        class="ev-calendar-header-row"
        v-for="(row, index) in rows"
        :key="row.date"
        :class="{'-odd': index % 2, '-even': !(index % 2), '-today': row.date === today}"
      >
        <div class="ev-calendar-header-row__title">{{row.title}}</div>
        <div class="ev-calendar-header-row__subrows">
          <div
            class="ev-calendar-header-subrow"
            v-for="subrow in row.subrows"
            :key="subrow.id"
          >
            {{subrow.title}}
          </div>
        </div>
      </div>
    </div>
    <div class="ev-calendar-body">
      <div class="ev-calendar-side">
        <div class="ev-calendar-side-row" v-for="time in times" :key="time.value">
          <div class="ev-calendar-side-row__title">{{time.title}}</div>
        </div>
      </div>
      <div class="ev-calendar-content" ref="content">
        <div class="ev-calendar-draw" v-if="drawing"></div>
        <div class="ev-calendar-grid">
          <div class="ev-calendar-grid-row" v-for="time in times" :key="time.value" :class="{'-full': time.isFull, '-half': time.isHalf}">
          </div>
        </div>
        <div
          class="ev-calendar-content-row"
          v-for="(row, index) in rows"
          :key="row.date"
          :class="{'-odd': index % 2, '-even': !(index % 2), '-today': row.date === today}"
        >
          <div
            class="ev-calendar-content-subrow"
            v-for="subrow in row.subrows"
            :key="subrow.id"
            @mousedown="startDrawing($event)"
            :data-day-id="row.dayId"
            :data-date="row.date"
            :data-key="subrow.id"
            :data-location-id="subrow.locationId"
          >
            <div
              class="ev-calendar-timeblock"
              v-for="block in subrow.timeblocks"
              :key="block.id"
              v-if="!drawingBlock || drawingBlock.id !== block.id"
              :style="getBlockStyle(block)"
              @mousedown="startDrawing($event, block, 'move')"
              @mouseover="showTooltip($event, block)"
              @mouseout="hideTooltip(block)"
              :class="['-color-' + block.color.id, '-status-' + block.status.id]"
            >
              <div class="ev-calendar-timeblock__item">
                <div class="ev-calendar-timeblock__item-name">
                  <div class="ev-calendar-timeblock__item-name-text">
                    {{block.name}}
                  </div>
                </div>
              </div>
              <div class="ev-calendar-timeblock__top" @mousedown="startDrawing($event, block, 'top')"></div>
              <div class="ev-calendar-timeblock__bottom" @mousedown="startDrawing($event, block, 'bottom')"></div>
            </div>
            <div
              ref="drawingBlock"
              v-if="drawingBlock.key === subrow.id"
              class="ev-calendar-timeblock -drawing"
              key="new-timeblock"
              :style="getBlockStyle(drawingBlock)"
            >
              <div class="ev-calendar-timeblock__item">
                <div class="ev-calendar-timeblock__item-name">
                  <div class="ev-calendar-timeblock__item-name-text">
                    {{drawingBlock.name}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <calendar-popup :options="popup" @hide="hidePopup">
      <div v-if="popup">
        <component
            :is="popupComponent"
            :options="popup"
            :hoursStart="hoursStart"
            :hoursEnd="hoursEnd"
            :rulerStep="rulerStep"
            @cancel="hidePopup"
            @close="hidePopup"
            @success="hidePopup"
        ></component>
      </div>
    </calendar-popup>
    <transition-group name="fade" tag="div" class="ev-calendar-tooltips">
      <div v-for="tooltip in tooltips" :key="tooltip.id" class="ev-calendar-popup__window ev-calendar-tooltip" :class="tooltip.class" :style="{top: tooltip.style.top + 'px', left: tooltip.style.left + 'px'}">
        <div class="ev-calendar-tooltip__field ev-calendar-tooltip__time">{{tooltip.startTime}} - {{tooltip.endTime}}</div>
        <div class="ev-calendar-tooltip__field ev-calendar-tooltip__header">{{tooltip.name}}</div>
        <div class="ev-calendar-tooltip__field ev-calendar-tooltip__header" v-if="tooltip.status.id === 3">TEMPORARY CLOSED</div>
        <div class="ev-calendar-tooltip__field ev-calendar-tooltip__header" v-if="tooltip.status.id === 2">CLOSED</div>
        <div class="ev-calendar-tooltip__text">{{tooltip.description}}</div>
        <div class="ev-calendar-tooltip__field ev-calendar-tooltip__location" v-if="tooltip.location">{{tooltip.location.name}}</div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'underscore'
import moment from 'moment'
import CalendarPopup from '~/components/calendar/Popup'
import CalendarCreateForm from '~/components/calendar/CreateForm'
import CalendarEditForm from '~/components/calendar/EditForm'
import {getPopupPosition} from '~/utils/popup_position'

const drawingBlockTemplate = {
  id: null,
  date: null,
  key: null,
  dayId: null,
  locationId: null,
  minuteStart: null,
  minuteDuration: null,
  name: '',
  line: 0,
  extraLines: 0
}

export default {
  components: {
    CalendarPopup,
    CalendarCreateForm,
    CalendarEditForm
  },
  props: ['calendarType'],
  computed: {
    minuteStart () { return this.$store.state.calendar.minuteStart },
    minuteEnd () { return this.$store.state.calendar.minuteEnd },
    hoursStart () { return Math.floor(this.minuteStart / 60) },
    hoursEnd () { return Math.round(this.minuteEnd / 60) },
    minuteInterval () { return this.$store.state.calendar.minuteInterval },
    rulerStep () { return Math.floor(this.minuteInterval / 2) },
    rows () { return this.$store.getters['calendar/rows'] },
    times () {
      const out = []
      for (let i = this.minuteStart; i <= this.minuteEnd; i += this.minuteInterval) {
        out.push({
          value: i,
          title: moment(parseInt(i / 60) + ':' + (i % 60), 'k:m').format('HH:mm'),
          isFull: !(i % 60),
          isHalf: i % 60 === 30
        })
      }
      return out
    },
    minuteDuration () { return this.minuteEnd - this.minuteStart + this.minuteInterval }
  },
  data () {
    return {
      tooltips: [],
      drawingBlock: {...drawingBlockTemplate},
      today: moment().format('YYYY-MM-DD'),
      drawing: false,
      popup: null,
      popupComponent: null
    }
  },
  methods: {
    getBlockStyle (block) {
      const out = {
        top: Math.min(100, Math.max(0, (block.minuteStart - this.minuteStart) / this.minuteDuration * 100)),
        height: block.minuteDuration / this.minuteDuration * 100,
        left: block.line / (block.extraLines + 1) * 100,
        width: 1 / (block.extraLines + 1) * 100
      }
      if (out.top < 0) out.top = 0
      if (out.top + out.height > 100) out.height = 100 - out.top
      return _.mapObject(out, prop => prop + '%')
    },
    showTooltip (event, block) {
      const tooltip = this.tooltips.find(t => t.id === block.id)
      if (!tooltip) {
        const res = getPopupPosition(event.currentTarget, {width: 300, height: 100})
        if (res) {
          this.tooltips.push({
            ...block,
            class: res.class,
            style: res.style
          })
        }
      }
    },
    hideTooltip (block) {
      const i = this.tooltips.findIndex(t => t.id === block.id)
      if (i === 0 || i > 0) this.tooltips.splice(i, 1)
    },
    hideTooltips () {
      this.tooltips = []
    },
    startDrawing (event, block, drawType) {
      event && event.preventDefault()
      event && event.stopPropagation()
      if (this.drawing) return
      const currentTarget = event.currentTarget
      const step = this.$store.state.calendar.drawingBlockMinuteStep
      const minDuration = this.$store.state.calendar.drawingBlockMinimalMinuteDuration
      const cols = $(this.$refs.content)
        .find('.ev-calendar-content-subrow')
        .get()
        .map(col => ({
          dom: col,
          offset: $(col).offset(),
          width: $(col).width(),
          height: $(col).height(),
          date: $(col).data('date'),
          key: $(col).data('key'),
          dayId: $(col).data('dayId'),
          locationId: $(col).data('locationId')
        }))
      const getFromCoords = (x, y, startY) => {
        const out = {...drawingBlockTemplate}
        const col = cols.find((col, index) => {
          if (index === 0 && x < col.offset.left) return true
          if (index === cols.length - 1 && x > col.offset.left + col.width) return true
          return col.offset.left <= x && col.offset.left + col.width > x
        })
        if (col) {
          out.date = col.date
          out.key = col.key
          out.dayId = col.dayId
          out.locationId = col.locationId
          let minute
          if (block) {
            minute = block.minuteStart + (y - startY) / col.height * this.minuteDuration
          } else {
            minute = this.minuteStart + (y - col.offset.top) / col.height * this.minuteDuration
          }
          minute = Math.max(this.minuteStart, Math.min(this.minuteEnd, minute))
          if (block) {
            out.id = block.id
            out.name = block.name
            out.line = block.line
            out.extraLines = block.extraLines
          }
          if (block && drawType === 'top') {
            out.minuteStart = Math.max(this.minuteStart, Math.min(block.minuteStart + block.minuteDuration - minDuration, block.minuteStart + (y - startY) / col.height * this.minuteDuration))
            out.minuteDuration = block.minuteDuration + (block.minuteStart - out.minuteStart)
          } else if (block && drawType === 'bottom') {
            out.minuteStart = block.minuteStart
            out.minuteDuration = Math.min(this.minuteEnd - block.minuteStart, block.minuteDuration + (y - startY) / col.height * this.minuteDuration)
          } else if (block) {
            out.minuteDuration = block.minuteDuration
            out.minuteStart = Math.min(this.minuteEnd - block.minuteDuration, minute)
          } else {
            let minuteStart = Math.round((startY - col.offset.top) / col.height * this.minuteDuration / step) * step + this.minuteStart
            minuteStart = Math.max(this.minuteStart, Math.min(this.minuteEnd, minuteStart))
            out.minuteStart = Math.min(minute, minuteStart)
            out.minuteDuration = Math.max(minDuration, Math.abs(minute - minuteStart))
          }
          out.minuteStart = Math.round(out.minuteStart / step) * step
          out.minuteStart = Math.max(this.minuteStart, Math.min(this.minuteEnd, out.minuteStart))
          out.minuteDuration = Math.round(out.minuteDuration / step) * step
          out.minuteDuration = Math.max(minDuration, Math.min(this.minuteEnd - out.minuteStart, out.minuteDuration))
        }
        return out
      }
      this._move = (e) => {
        this.drawingBlock = getFromCoords(e.pageX, e.pageY, event.pageY)
      }
      this._up = (e) => {
        if (this.drawing) {
          this.endDrawing()
          const data = {}
          let tab = 'first'
          if (block) {
            const tabParts = []
            if (block.dayOfWeek.id !== this.drawingBlock.dayId) {
              tabParts.push('dayOfWeek')
              data.dayOfWeek = this.drawingBlock.dayId
            }
            if (block.minuteStart !== this.drawingBlock.minuteStart || block.minuteDuration !== this.drawingBlock.minuteDuration) {
              tabParts.push('time')
              data.minuteStart = this.drawingBlock.minuteStart
              data.minuteDuration = this.drawingBlock.minuteDuration
            }
            if (block.location.id !== this.drawingBlock.locationId) {
              tabParts.push('location')
              data.location = this.drawingBlock.locationId
            }
            if (tabParts.length) {
              tab = tabParts.join(',')
            }
          } else {
            data.dayOfWeek = this.drawingBlock.dayId
            data.minuteStart = this.drawingBlock.minuteStart
            data.minuteDuration = this.drawingBlock.minuteDuration
            data.location = this.drawingBlock.locationId
          }
          this.showPopup({
            blockId: (block || {}).id,
            data,
            tab,
            targetDOM: this.$refs.drawingBlock
          })
        } else {
          // Drawing has not yet been started, that's the mouse click;
          this.clearDrawing()
          this.showPopup({
            blockId: (block || {}).id,
            tab: 'first',
            targetDOM: currentTarget
          })
        }
      }
      this.clearDrawing()
      $(window).on('mouseup', this._up)
      this._clickTimeout = setTimeout(() => {
        this.hideTooltips()
        this.drawing = true
        this.drawingBlock = getFromCoords(event.pageX, event.pageY, event.pageY)
        $(window).on('mousemove', this._move)
      }, 200)
    },
    endDrawing () {
      this.drawing = false
      this._move && $(window).off('mousemove', this._move)
      this._up && $(window).off('mouseup', this._up)
      this._clickTimeout && clearTimeout(this._clickTimeout)
    },
    clearDrawing () {
      this.drawingBlock = {...drawingBlockTemplate}
      this.endDrawing()
    },
    showPopup (options) {
      this.popupComponent = (options.blockId ? 'CalendarEditForm' : 'CalendarCreateForm')
      this.popup = options
    },
    hidePopup (options) {
      this.popup = null
      this.clearDrawing()
    }
  },
  beforeDestroy () {
    this.clearDrawing()
  }
}
</script>
