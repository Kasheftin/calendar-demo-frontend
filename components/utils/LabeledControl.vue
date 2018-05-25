<template>
  <div>
    <v-select v-if="field.type === 'select'" v-model="inner" :label="field.label" :items="options" item-value="id" item-text="name"></v-select>
    <v-menu v-else-if="field.type === 'date'" full-width>
      <v-text-field slot="activator" v-model="inner" :label="field.label" readonly></v-text-field>
      <v-date-picker v-model="inner">
        <v-spacer></v-spacer>
        <v-btn flat @click="inner = null">Clear</v-btn>
      </v-date-picker>
    </v-menu>
    <v-menu v-else-if="field.type === 'minuteTime'" full-width ref="menu" :close-on-content-click="false" :return-value.sync="inner">
      <v-text-field slot="activator" v-model="inner" :label="field.label" readonly></v-text-field>
      <v-time-picker v-model="inner" format="24hr" @change="$refs.menu.save(inner)"></v-time-picker>
    </v-menu>
    <v-text-field v-else-if="field.type === 'minuteDuration'" v-model="inner" type="number" suffix="min" :label="field.label"></v-text-field>
    <v-text-field v-else-if="field.type === 'text'" v-model="inner" :label="field.label"></v-text-field>
  </div>
</template>

<script>
import {getTime, getMinute} from '~/utils/time'

const valueToInner = (value, field) => {
  if (field.type === 'minuteTime') {
    return getTime(value)
  }
  return value
}

const innerToValue = (inner, field) => {
  if (field.type === 'minuteTime') {
    return getMinute(inner)
  }
  return inner
}

export default {
  props: ['value', 'field'],
  computed: {
    options () {
      if (this.field.type === 'select' && this.field.dataSource) {
        return this.getStoreValue(this.field.dataSource)
      }
      return []
    }
  },
  watch: {
    value (value) {
      this.inner = valueToInner(value, this.field)
    },
    inner (inner) {
      this.$emit('input', innerToValue(inner, this.field))
    }
  },
  data () {
    return {
      inner: valueToInner(this.value, this.field)
    }
  },
  methods: {
    getStoreValue (str) {
      const ar = str.split(/\./g)
      let out = this.$store
      for (let i = 0; i < ar.length; i++) {
        if (ar[i] in out) {
          out = out[ar[i]]
        } else {
          return []
        }
      }
      return out || []
    }
  }
}
</script>
