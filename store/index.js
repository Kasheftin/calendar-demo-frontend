import cookie from 'cookie'
import config from '~/config'

export const actions = {
  nuxtServerInit ({dispatch, commit}, context) {
    return Promise.resolve()
      .then(() => {
        try {
          const cookies = cookie.parse(context.req.headers.cookie || '')
          if (cookies.hasOwnProperty(config.settings.cookieName)) {
            const settings = JSON.parse(cookies[config.settings.cookieName])
            commit('ux/replaceSettings', settings)
          }
        } catch (error) {
          console.log('Settings cookie parse error', error)
        }
      })
  }
}
