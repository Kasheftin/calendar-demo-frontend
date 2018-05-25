import Vue from 'vue'
import cookies from 'js-cookie'
import config from '~/config'

export const state = () => ({
  settings: {
    showTemporaryClosedBlocks: true,
    showClosedBlocks: false
  },
  snack: {}
})

export const mutations = {
  replaceSettings (state, data) {
    state.settings = data
  },
  extendSettings (state, data) {
    Vue.set(state, 'settings', {...state.settings, ...data})
  },
  updateSnack (state, data) {
    Vue.set(state, 'snack', data)
  }
}

export const actions = {
  saveToCookies ({state}) {
    cookies.set(config.settings.cookieName, state.settings)
    return Promise.resolve()
  },
  updateSettings ({commit, dispatch}, data) {
    commit('extendSettings', data)
    return dispatch('saveToCookies')
  },
  clearSettings ({commit, dispatch}) {
    commit('replaceSettings', {})
    return dispatch('saveToCookies')
  },
  updateSnack ({commit}, value) {
    commit('updateSnack', value)
    return Promise.resolve()
  }
}
