<template>
  <v-layout align-center justify-center>
    <v-jumbotron class="elevation-10" :style="{maxWidth: '500px', height: 'auto'}">
      <v-container fill-height>
        <v-layout align-center>
          <v-flex>
            <h3 class="display-2 my-3">Weekly Calendar Demo</h3>
            <span class="subheading">This is the demo for [...] and [...] articles.</span>
            <v-divider class="my-3"></v-divider>
            <div class="title mb-3">Available Actions: </div>
            <v-btn large block color="primary" class="btn--wrap" :loading="loading" :disabled="loading" @click="create('empty')">Create New Empty Calendar</v-btn>
            <v-btn large block color="primary" class="btn--wrap" :loading="loading" :disabled="loading" @click="create('copy-dance-seed')">Create New Calendar and Populate it with Dance Studio Seed</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      loading: false
    }
  },
  methods: {
    create (type) {
      this.loading = true
      this.$store
        .dispatch('fetch/fetch', {path: 'calendar.init', data: {type}})
        .then(response => {
          this.loading = false
          this.$snack({message: response.data.message, type: 'success'})
          this.$router.push({name: ':calendarid', params: {calendarid: response.data.data.calendar_id}})
        })
        .catch(error => {
          this.loading = false
          this.$snack({message: error.response.data.message, type: 'error'})
        })
    }
  }
}
</script>
