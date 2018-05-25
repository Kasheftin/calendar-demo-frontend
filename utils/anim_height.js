import $ from 'jquery'
import velocity from '~/utils/velocity'

export default {
  methods: {
    animHeightBeforeEnter (el) {
      el.style.height = 0
      el.style.overflow = 'hidden'
    },
    animHeightEnter (el, done) {
      setTimeout(() => {
        const targetHeight = $(el).children().eq(0).outerHeight(true)
        velocity(el, {height: targetHeight}, {
          duration: this.anim_height_duration || 500,
          complete: () => {
            el.style.removeProperty('height')
            el.style.removeProperty('overflow')
            done()
          }
        })
      }, 200)
    },
    animHeightAfterEnter (el) {
    },
    animHeightBeforeLeave (el) {
    },
    animHeightLeave (el, done) {
      el.style.overflow = 'hidden'
      setTimeout(() => {
        velocity(el, {height: 0}, {
          duration: this.anim_height_duration || 500,
          complete: () => {
            done()
          }
        })
      }, 200)
    },
    animHeightAfterLeave (el) {
    }
  }
}
