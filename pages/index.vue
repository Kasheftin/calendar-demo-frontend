<template>
  <v-layout column>
    <calendar-toolbar></calendar-toolbar>
    <calendar></calendar>
  </v-layout>
</template>

<script>
import moment from 'moment'
import CalendarToolbar from '~/components/calendar/Toolbar'
import Calendar from '~/components/calendar/Calendar'

export default {
  components: {
    CalendarToolbar,
    Calendar
  },
  fetch ({app, route, redirect, store}) {
    if (!route.query.week) {
      const newRoute = app.router.resolve({query: {...route.query, week: moment().format('YYYYWW')}}, route)
      return redirect(newRoute.href)
    }
    return Promise.resolve()
      .then(() => store.dispatch('calendar/set', {week: route.query.week}))
      .then(() => store.dispatch('calendar/fetch'))
  },
  computed: {
    week () { return this.$store.state.calendar.week },
    settings () { return this.$store.state.ux.settings }
  },
  watch: {
    week (week) {
      this.$router.push({
        query: {
          ...this.$route.query,
          week
        }
      })
      this.$store.dispatch('calendar/fetch')
    },
    settings () {
      this.$store.dispatch('calendar/fetch')
    }
  }
}
</script>
