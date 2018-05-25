<template>
  <transition name="fade">
    <div class="sis-calendar-popup" v-if="!!options">
      <div class="sis-calendar-popup__background" @click.self.prevent="hide"></div>
      <div class="sis-calendar-popup__window"
        :style="{top: popupStyle.top + 'px', left: popupStyle.left + 'px'}"
        :class="popupClass"
        ref="popup"
      >
        <slot/>
      </div>
    </div>
  </transition>
</template>
<script>
import $ from 'jquery'
import {getPopupPosition, ensurePopupFitsTheWindow} from '~/utils/popup_position'

export default {
  props: {
    options: Object
  },
  data () {
    return {
      popupClass: [],
      popupStyle: {},
      hideEnabled: false
    }
  },
  watch: {
    options (options) {
      if (!options) return
      this.hideEnabled = false
      setTimeout(() => {
        this.hideEnabled = true
      }, 200)
      const res = getPopupPosition(options.targetDOM, {width: 300, height: 500})
      if (res) {
        this.popupClass = res.class
        this.popupStyle = res.style
        this.ensurePopupFitsTheWindow()
      }
    }
  },
  methods: {
    hide () {
      if (!this.hideEnabled) return
      this.$emit('hide')
      this.$emit('close')
    },
    ensurePopupFitsTheWindow () {
      const run = () => {
        const res = ensurePopupFitsTheWindow(this.$refs.popup)
        if (res && (res.moveX !== 0 || res.moveY !== 0)) {
          this.popupStyle.top += res.moveY
          this.popupStyle.left += res.moveX
        }
      }
      this.$nextTick(() => {
        run()
        setTimeout(run, 200)
      })
    }
  },
  mounted () {
    $(window).on('resize', this.ensurePopupFitsTheWindow)
  },
  beforeDestroy () {
    $(window).off('resize', this.ensurePopupFitsTheWindow)
  }
}
</script>
