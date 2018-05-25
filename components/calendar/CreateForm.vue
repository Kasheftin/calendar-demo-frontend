<template>
  <div class="sis-ep -create">
    <div class="sis-ep__header">
      <div class="sis-ep__header-text">New Block</div>
    </div>
    <div class="sis-ep__body">
      <div class="sis-ep__body-tabs">
        <div class="sis-ep__body-tab">
          <div class="sis-ep__container">
            <div class="sis-ep__content">
              <div class="sis-ep__content-inner -vcentered">
                <div class="sis-ep__section">
                  <div class="sis-ep__block">
                    <div class="sis-ep__block-content -last -first">
                      <v-container grid-list-sm>
                        <v-layout row wrap>
                          <v-flex v-for="field in fields" :key="field.key" :class="field.size">
                            <LabeledControl v-model="inner[field.key]" :field="field"></LabeledControl>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sis-ep__footer">
              <div class="sis-ep__buttons">
                <v-btn flat @click="$emit('close')" :loading="loading" :disabled="loading">Cancel</v-btn>
                <v-btn flat color="primary" @click="submitForm()" :loading="loading" :disabled="loading">Add</v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LabeledControl from '~/components/utils/LabeledControl'

export default {
  components: {
    LabeledControl
  },
  props: ['options', 'hoursStart', 'hoursEnd', 'rulerStep'],
  computed: {
    fields () { return this.$store.state.calendar.timeblockFields }
  },
  data () {
    const inner = {}
    Object.keys(this.$store.state.calendar.timeblockFields).forEach(field => {
      inner[field] = this.options.data[field]
    })
    if (inner.hasOwnProperty('status') && !inner.status) inner.status = 1
    if (inner.hasOwnProperty('color') && !inner.color) inner.color = 'blue'
    return {
      inner,
      loading: false
    }
  },
  methods: {
    submitForm () {
      const data = {...this.inner}
      data.from = this.$store.state.calendar.week
      data.to = null
      this.loading = true
      this.$store
        .dispatch('fetch/fetch', {path: 'calendar.create', data})
        .then(response => {
          this.$snack({message: response.data.message, type: 'success'})
        }, error => {
          this.loading = false
          this.$snack({message: error.response.data.message, type: 'error'})
          return Promise.reject(error)
        })
        .then(() => this.$store.dispatch('calendar/fetch', true))
        .then(() => {
          this.$emit('close')
          this.loading = false
        })
        .catch(console.error)
    }
  }
}
</script>
