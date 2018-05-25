import animHeight from '~/utils/anim_height'
import $ from 'jquery'
const allClasses = 'v-enter v-enter-active v-enter-to v-leave v-leave-active v-leave-to'

export default {
  transition: {
    name: 'anim-height',
    mode: '',
    beforeEnter (el) {
      $(el).removeClass(allClasses).addClass('v-enter')
      return animHeight.methods.animHeightBeforeEnter(el)
    },
    enter (el, done) {
      $(el).removeClass(allClasses).addClass('v-enter-active')
      return animHeight.methods.animHeightEnter(el, done)
    },
    afterEnter (el) {
      $(el).removeClass(allClasses).addClass('v-enter-to')
      return animHeight.methods.animHeightAfterEnter(el)
    },
    beforeLeave (el) {
      $(el).removeClass(allClasses).addClass('v-leave')
      return animHeight.methods.animHeightBeforeLeave(el)
    },
    leave (el, done) {
      $(el).removeClass(allClasses).addClass('v-leave-active')
      return animHeight.methods.animHeightLeave(el, done)
    },
    afterLeave (el) {
      $(el).removeClass(allClasses).addClass('v-leave-to')
      return animHeight.methods.animHeightAfterLeave(el)
    }
  }
}
