/*
 * New API cacher.
 * Why do we need this at all? Why don't keep caches as plain objects inside the api?
 * The reason is ssr.
 * We want to be able to make some requests on server side and cache them, and then use the cache on client side.
 * But plain objects are not transfered from ssr to client side, only the store does.
 * That's why we keep cache in the store, and also we will try to restrict vuex reactivity by Object.freeze.
 * We will test if it takes some memory/performance optimization.
 * $store.dispatch('fetch/fetch', {path, data, options})
 * - path: 'student.typeahead', 'activity.update' etc. related to the resources object inside ~/api2;
 * - data: in case the data is an array, api called as `path`.apply(this, data), otherwise called as `path`.call(this, data);
 * - options:
 *    - cache: number in seconds - overwrites the default cache option for the specified resource; It affects only resources with enabled caching;
 *    - force: the same as cache=0
 *    - rerun: by default if there's pending request, the next one will wait for it's result. This option will stop the current request and will send the new one, so that the old callback will be triggered after this new request will pass;
 *    - cacheKey: if set, the cache key will be `path-cacheKey`, otherwise it will be `path-JSON.stringify(data)`
 */
import _ from 'underscore'
import Vue from 'vue'
import axios from 'axios'
import resources from '~/api'

export const state = () => ({
  cachedReactiveData: {}
})

const cachedLocalData = {}

export const mutations = {
  setEntry (state, {cacheKey, response, receivedAt}) {
    Vue.set(state.cachedReactiveData, cacheKey, {
      response: Object.freeze(response),
      receivedAt
    })
  }
}

const getResource = (path) => {
  const pathParts = path.split('.')
  let out = resources
  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] in out) {
      out = out[pathParts[i]]
    } else return undefined
  }
  if (out && _.isArray(out) && out.length > 1) return out[1]
}

const getResourceOptions = (path) => {
  const pathParts = path.split('.')
  let out = resources
  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] in out) {
      out = out[pathParts[i]]
    } else return {}
  }
  let options = {}
  if (out && _.isArray(out) && out.length > 0) {
    const cacheIntervals = [0, 5, 60, 3600]
    options.cache = cacheIntervals[out[0]] || 0
    if (out.length > 2) {
      options = {
        ...options,
        ...out[2]
      }
    }
  }
  return options
}

const initCacheEntry = (cacheKey) => {
  if (!cachedLocalData.hasOwnProperty(cacheKey)) {
    cachedLocalData[cacheKey] = {
      loading: false,
      axiosSource: null,
      resolvers: [],
      rejecters: []
    }
  }
  return cachedLocalData[cacheKey]
}

const processResponse = (response, opts, store) => {
  if (opts.prepareItem) {
    if (response.data.results && response.data.results.length) {
      response.data.results = response.data.results.map(resultRw => opts.prepareItem(resultRw, store))
    } else if (response.data && response.data.length) {
      response.data = response.data.map(resultRw => opts.prepareItem(resultRw, store))
    }
  } else if (opts.prepareResponse) {
    response.data = opts.prepareResponse(response.data, store)
  }
  return response
}

export const actions = {
  fetch ({state, commit, rootState}, {path, data, options, url}) {
    const resource = getResource(path)
    if (!resource) return Promise.reject(new Error('Path ' + path + ' is not supported.'))
    const opts = {
      ...getResourceOptions(path),
      ...options
    }
    const params = {...data}
    // Push calendar_id to every request if defined;
    if (rootState.calendar.calendar_id) {
      params.calendar_id = rootState.calendar.calendar_id
    }
    if (!opts.cache) return (url ? axios.get(url, {params}) : resource.apply(this, [{}, params])).then(response => processResponse(response, opts, {state: rootState}))
    const cacheKey = path + '-' + (opts.hasOwnProperty('cacheKey') ? opts.cacheKey : JSON.stringify(params)) + (url || '')
    const cacheEntry = initCacheEntry(cacheKey)
    if (!opts.force && state.cachedReactiveData[cacheKey] && ((new Date()).getTime() - state.cachedReactiveData[cacheKey].receivedAt < opts.cache * 1000)) {
      return Promise.resolve(state.cachedReactiveData[cacheKey].response)
    }
    return new Promise((resolve, reject) => {
      if (cacheEntry.loading) {
        if (opts.rerun) {
          cacheEntry.axiosSource && cacheEntry.axiosSource.cancel()
        } else {
          cacheEntry.resolvers.push(resolve)
          cacheEntry.rejecters.push(reject)
          return
        }
      }
      cacheEntry.loading = true
      cacheEntry.axiosSource = axios.CancelToken.source()
      cacheEntry.resolvers.push(resolve)
      cacheEntry.rejecters.push(reject)
      // Since the first argument in resources is options, we have to prepend it.
      const run = () => {
        if (url) return axios.get(url, {params}, {cancelToken: cacheEntry.axiosSource.token})
        return resource.apply(this, [{cancelToken: cacheEntry.axiosSource.token}, params])
      }
      run()
        .then(response => processResponse(response, opts, {state: rootState}))
        .then(response => {
          commit('setEntry', {cacheKey, response: {data: response.data}, receivedAt: (new Date()).getTime()})
          cacheEntry.resolvers.forEach(resolve => resolve(response))
          cacheEntry.loading = false
          cacheEntry.axiosSource = null
          cacheEntry.resolvers = []
          cacheEntry.rejecters = []
        }, error => {
          if (!axios.isCancel(error)) {
            cacheEntry.rejecters.forEach(reject => reject(error))
            cacheEntry.loading = false
            cacheEntry.axiosSource = null
            cacheEntry.resolvers = []
            cacheEntry.rejecters = []
          }
        })
    })
  }
}
