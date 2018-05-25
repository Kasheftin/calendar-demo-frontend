<template>
  <v-toolbar flat extended-height class="my-3">
    <v-toolbar-title class="display-1">Calendar</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-menu min-width="340px">
      <v-btn icon slot="activator"><v-icon>settings</v-icon></v-btn>
      <v-list>
        <v-list-tile>
          <v-list-tile-title>
            <v-checkbox label="Show Temporary Closed Blocks" :input-value="settings.showTemporaryClosedBlocks" @change="change('showTemporaryClosedBlocks')"></v-checkbox>
          </v-list-tile-title>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-title>
            <v-checkbox label="Show Closed Blocks" :input-value="settings.showClosedBlocks" @change="change('showClosedBlocks')"></v-checkbox>
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <v-btn icon @click="switchWeek(-1)">
      <v-icon>chevron_left</v-icon>
    </v-btn>
    <v-menu lazy offset-y transition="scale-transition">
      <v-btn flat slot="activator">
        <v-icon class="mr-1">event</v-icon>
        {{dateRange}}
      </v-btn>
      <v-date-picker :value="dateFrom" @change="setDate" v-bind="datePickerOptions">
        <v-spacer></v-spacer>
        <v-btn flat color="primary" @click="setCurrentDate">Today</v-btn>
      </v-date-picker>
    </v-menu>
    <v-btn icon @click="switchWeek(+1)">
      <v-icon>chevron_right</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import moment from 'moment'

export default {
  computed: {
    week () { return this.$store.state.calendar.week },
    datePickerOptions () { return this.$store.state.calendar.defaultOptions.datePicker },
    dateFrom () { return this.$store.getters['calendar/dateFrom'] },
    dateTo () { return this.$store.getters['calendar/dateTo'] },
    dateRange () { return moment(this.dateFrom).format('DD.MM') + ' - ' + moment(this.dateTo).format('DD.MM') },
    settings () { return this.$store.state.ux.settings }
  },
  methods: {
    switchWeek (direction) {
      this.setDate(moment(this.dateFrom).add(direction, 'weeks').format('YYYY-MM-DD'))
    },
    setCurrentDate () {
      this.setDate(moment().format('YYYY-MM-DD'))
    },
    setDate (date) {
      this.$store.dispatch('calendar/set', {week: moment(date).format('YYYYWW')})
    },
    change (what) {
      const obj = {}
      obj[what] = !this.settings[what]
      this.$store.dispatch('ux/updateSettings', obj)
    }
  }
}
</script>
