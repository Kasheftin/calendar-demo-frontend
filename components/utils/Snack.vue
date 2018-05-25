<template>
  <v-snackbar v-model="snack.value" :color="snack.type" :timeout="snack.timeout">
    <div v-html="messageHTML"></div>
    <v-btn v-if="snack.hideable" dark flat @click="snack.value = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  computed: {
    snackInput () { return this.$store.state.ux.snack },
    messageHTML () {
      if (this.snack && this.snack.message && this.snack.message.length) {
        return this.snack.message.trim().split(/\n/).join('<br>')
      }
    }
  },
  data () {
    const defaultOptions = {
      value: false,
      type: '',
      timeout: 5000,
      hideable: true,
      message: ''
    }
    return {
      defaultOptions,
      snack: Object.assign({}, defaultOptions)
    }
  },
  watch: {
    snackInput (data) {
      this.updateSnack(data)
    }
  },
  methods: {
    updateSnack (msg) {
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
      if (!message) {
        this.snack.value = false
        return
      }
      Object.keys(this.defaultOptions).forEach(field => {
        this.snack[field] = (message.hasOwnProperty(field) ? message[field] : this.defaultOptions[field])
      })
      this.snack.value = true
    }
  }
}
</script>
