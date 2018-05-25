import Vue from 'vue'

const snack = function (data) {
  this.$store.dispatch('ux/updateSnack', data)
}

const VueSnack = function () {
}

VueSnack.install = function (Vue) {
  Vue.snack = snack
  if (!Vue.prototype.hasOwnProperty('$snack')) {
    Object.defineProperty(Vue.prototype, '$snack', {
      get: function () {
        return snack
      }
    })
  }
}

Vue.use(VueSnack)
