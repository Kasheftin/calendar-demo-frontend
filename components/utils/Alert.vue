<template>
  <div>
    <transition :css="false" @before-enter="animHeightBeforeEnter" @enter="animHeightEnter" @leave="animHeightLeave">
      <div v-if="state == 'showing' || state == 'visible'">
        <v-alert :type="message.type" :value="alwaysTrueHandler" @input="close" :dismissible="!persistent">
          <div v-html="messageHTML"></div>
        </v-alert>
      </div>
    </transition>
  </div>
</template>

<script>
import animHeight from '~/utils/anim_height'

export default {
  props: ['msg', 'persistent'],
  mixins: [animHeight],
  computed: {
    messageHTML () {
      if (this.message && this.message.message && this.message.message.length) {
        return this.message.message.trim().split(/\n/).join('<br>')
      }
    }
  },
  watch: {
    msg: {
      immediate: true,
      handler (msg) {
        let message = msg
        if (msg instanceof Error && msg.response) {
          let errorMessage = msg.message || msg.msg || msg.response.status + ' ' + msg.response.statusText
          if (msg.response.data) {
            if (msg.response.data.message) {
              errorMessage = msg.response.data.message
            }
            if (msg.response.data.msg) {
              errorMessage = msg.response.data.msg
            }
            if (msg.response.data.errorType) {
              errorMessage = msg.response.data.errorType + ': ' + errorMessage
            }
            if (msg.response.data.error && msg.response.data.error.errors) {
              errorMessage += ': ' + msg.response.data.error.errors.map(e => e.message).join(', ')
            }
          }
          message = {
            type: 'error',
            message: errorMessage
          }
        } else if (msg instanceof Error) {
          message = {
            type: 'error',
            message: msg.message
          }
        }
        if (message) {
          if (this.state === 'hidden') {
            this.run({message, state: 'showing'}, {state: 'visible'})
          } else {
            this.run({state: 'hiding'}, {state: 'hidden', message: null, nextRun: [{message, state: 'showing'}, {state: 'visible'}]})
          }
        } else {
          if (this.state !== 'hidden') {
            this.run({state: 'hiding'}, {state: 'hidden', message: null})
          }
        }
      }
    }
  },
  data () {
    return {
      state: 'hidden',
      message: null,
      next: null,
      alwaysTrueHandler: true
    }
  },
  methods: {
    run (now, next) {
      if (now.hasOwnProperty('message')) this.message = now.message
      if (now.hasOwnProperty('state')) this.state = now.state
      this.next = next
      if (this._running) return
      this._running = true
      this._runningTimeout = setTimeout(() => {
        this._running = false
        if (this.next.hasOwnProperty('message')) this.message = this.next.message
        if (this.next.hasOwnProperty('state')) this.state = this.next.state
        if (this.next.nextRun) this.run(this.next.nextRun[0], this.next.nextRun[1])
      }, 700)
    },
    close () {
      this.$emit('update:msg', null)
    }
  }
}
</script>
