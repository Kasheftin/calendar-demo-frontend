<template>
  <div class="sis-ep" v-if="block">
    <div class="sis-ep__header">
      <button class="sis-ep__header-back" @click="switchTab('first', null)" v-if="currentTab.name !== 'first'"></button>
      <div class="sis-ep__header-text">{{block.name}}</div>
    </div>
    <div class="sis-ep__body">
      <transition-group tag="div" class="sis-ep__body-tabs" name="sis-ep-slide">
        <div class="sis-ep__body-tab" v-for="tab in tabs" :key="tab.name" :class="'-switch-' + direction">
          <div class="sis-ep__container" v-if="tab.name === 'first'">
            <div class="sis-ep__content">
              <div class="sis-ep__section">
                <div class="sis-ep__action -active" @click="switchTab('name', {name: block.name})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon"></div>
                    <div class="sis-ep__block-content" :class="{'-empty': !block.name}">{{block.name || 'Empty Name'}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                </div>
                <div class="sis-ep__action -active" @click="switchTab('description', {description: block.description})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon"></div>
                    <div class="sis-ep__block-content" :class="{'-empty': !block.description}">{{block.description || 'Empty Description'}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="sis-ep__section">
                <div class="sis-ep__action -active" @click="switchTab('status', {status: block.status.id})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon">
                      <div class="sis-ep__icon -status" :class="'-status-' + block.status.id"></div>
                    </div>
                    <div class="sis-ep__block-content">{{block.status.name}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="sis-ep__section">
                <div class="sis-ep__action -active" @click="switchTab('dayOfWeek', {dayOfWeek: block.dayOfWeek.id})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon">
                      <v-icon>date_range</v-icon>
                    </div>
                    <div class="sis-ep__block-content">{{block.dayOfWeek.name}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                </div>
                <div class="sis-ep__action -active" @click="switchTab('times', {minuteStart: block.minuteStart, minuteDuration: block.minuteDuration})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon">
                      <v-icon>access_time</v-icon>
                    </div>
                    <div class="sis-ep__block-content">{{timePrint}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon">
                      <v-icon>hourglass_empty</v-icon>
                    </div>
                    <div class="sis-ep__block-content">{{block.minuteDuration}}</div>
                  </div>
                </div>
                <div class="sis-ep__action -active" @click="switchTab('location', {location: block.location.id})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon">
                      <v-icon>place</v-icon>
                    </div>
                    <div class="sis-ep__block-content">{{block.location.name}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                </div>
                <div class="sis-ep__action -active" @click="switchTab('color', {color: block.color.id})">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-icon">
                      <div class="sis-ep__icon -color" :class="'-color-' + block.color.id"></div>
                    </div>
                    <div class="sis-ep__block-content">{{block.color.name}}</div>
                    <div class="sis-ep__block-control">
                      <span class="sis-ep__control -chevron-right"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sis-ep__footer">
              <div class="sis-ep__buttons">
                <v-btn flat color="sis-primary" class="sis-btn--bold" @click="$emit('close')">Close</v-btn>
              </div>
            </div>
          </div>
          <div class="sis-ep__container" v-else>
            <div class="sis-ep__content">
              <div class="sis-ep__content-inner -vcentered">
                <div class="sis-ep__section">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('name') >= 0">
                      <LabeledControl v-model="tab.data.name" :field="fields.name"></LabeledControl>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('description') >= 0">
                      <LabeledControl v-model="tab.data.description" :field="fields.description"></LabeledControl>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('status') >= 0">
                      <LabeledControl v-model="tab.data.status" :field="fields.status"></LabeledControl>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('location') >= 0">
                      <LabeledControl v-model="tab.data.location" :field="fields.location"></LabeledControl>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('dayOfWeek') >= 0">
                      <LabeledControl v-model="tab.data.dayOfWeek" :field="fields.dayOfWeek"></LabeledControl>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('color') >= 0">
                      <LabeledControl v-model="tab.data.color" :field="fields.color"></LabeledControl>
                    </div>
                  </div>
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first" v-if="tab.name.indexOf('time') >= 0">
                      <v-container grid-list-sm>
                        <v-layout>
                          <v-flex xs6>
                            <LabeledControl v-model="tab.data.minuteStart" :field="fields.minuteStart"></LabeledControl>
                          </v-flex>
                          <v-flex xs6>
                            <LabeledControl v-model="tab.data.minuteDuration" :field="fields.minuteDuration"></LabeledControl>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sis-ep__footer">
              <div class="sis-ep__section -rev">
                <div class="sis-ep__section-header">Change is Effective:</div>
                <div class="sis-ep__block">
                  <div class="sis-ep__block-content -last -first">
                    <v-radio-group v-model="formData.rangeType" :hide-details="true">
                      <v-radio :label="dateFromPrint + ' and Following'" value="all"></v-radio>
                      <v-radio :label="weekPrint + ' Week Only'" value="one"></v-radio>
                      <v-radio label="Custom Date Range" value="custom"></v-radio>
                    </v-radio-group>
                  </div>
                </div>
              </div>
              <transition :css="false" @before-enter="animHeightBeforeEnter" @enter="animHeightEnter" @leave="animHeightLeave">
                <div v-if="formData.rangeType === 'custom'">
                  <div class="sis-ep__section -rev">
                    <div class="sis-ep__block">
                      <div class="sis-ep__block-content -last -first">
                        <v-container grid-list-sm>
                          <v-layout>
                            <v-flex xs6>
                              <LabeledControl v-model="formData.startDate" :field="{type: 'date'}"></LabeledControl>
                            </v-flex>
                            <v-flex xs6>
                              <LabeledControl v-model="formData.endDate" :field="{type: 'date'}"></LabeledControl>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
              <div class="sis-ep__buttons">
                <v-btn flat @click="switchTab('first', null)" :loading="loading" :disabled="loading">Cancel</v-btn>
                <v-btn flat color="primary" @click="submitForm(tab)" :loading="loading" :disabled="loading">Save</v-btn>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import animHeight from '~/utils/anim_height'
import LabeledControl from '~/components/utils/LabeledControl'
import {getTime} from '~/utils/time'

export default {
  components: {
    LabeledControl
  },
  mixins: [animHeight],
  props: ['options', 'hoursStart', 'hoursEnd', 'rulerStep'],
  computed: {
    fields () { return this.$store.state.calendar.timeblockFields },
    block () {
      if (this.options.blockId) {
        const map = this.$store.getters['calendar/blockMap'][this.options.blockId]
        if (map) {
          const rows = this.$store.getters['calendar/rows']
          return ((((rows[map.rowIndex] || {}).subrows || [])[map.subrowIndex] || {}).timeblocks || [])[map.timeblockIndex] || {}
        }
      }
    },
    currentTab () {
      if (this.tabs.length > 0) {
        return this.tabs[this.tabs.length - 1]
      }
    },
    dateFrom () { return this.$store.getters['calendar/dateFrom'] },
    dateTo () { return this.$store.getters['calendar/dateTo'] },
    dateFromPrint () { return moment(this.dateFrom).format('DD.MM') },
    dateToPrint () { return moment(this.dateTo).format('DD.MM') },
    weekPrint () { return this.dateFromPrint + ' - ' + this.dateToPrint },
    timePrint () { return getTime(this.block.minuteStart) + ' - ' + getTime(this.block.minuteStart + this.block.minuteDuration) }
  },
  watch: {
    block (block) {
      if (!block) {
        this.$emit('close')
      }
    }
  },
  data () {
    return {
      tabs: [{name: this.options.tab, data: this.options.data || {}}],
      loading: false,
      formData: {
        rangeType: 'all',
        startDate: this.$store.getters['calendar/dateFrom'],
        endDate: null
      },
      direction: 'forward'
    }
  },
  methods: {
    switchTab (name, data) {
      this.direction = (name === 'first' ? 'backward' : 'forward')
      this.$nextTick(() => {
        this.tabs = [{name, data}]
      })
    },
    submitForm (tab) {
      let from = this.$store.state.calendar.week
      let to = null
      if (this.formData.rangeType === 'one') {
        to = from
      } else if (this.formData.rangeType === 'custom') {
        if (this.formData.startDate) {
          from = moment(this.formData.startDate).format('YYYYWW')
        }
        if (this.formData.endDate) {
          to = moment(this.formData.endDate).format('YYYYWW')
        }
      }
      const data = {
        id: this.block.id,
        rules: []
      }
      Object.keys(tab.data).forEach(type => {
        data.rules.push({
          type,
          value: tab.data[type],
          from,
          to
        })
      })
      this.loading = true
      this.$store
        .dispatch('fetch/fetch', {path: 'calendar.update', data})
        .then(response => {
          this.$snack({message: response.data.message, type: 'success'})
        }, error => {
          this.loading = false
          this.$snack({message: error.response.data.message, type: 'error'})
          return Promise.reject(error)
        })
        .then(() => this.$store.dispatch('calendar/fetch', true))
        .then(() => {
          this.switchTab('first')
          this.loading = false
        })
        .catch(console.error)
    }
  }
}
</script>
