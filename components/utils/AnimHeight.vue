<template>
  <transition :css="false" @before-enter="animHeightBeforeEnter" @enter="animHeightEnter" @leave="animHeightLeave">
    <div v-if="visible">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
import animHeight from '~/utils/anim_height'

export default {
  mixins: [animHeight],
  props: ['visible']
}
</script>
