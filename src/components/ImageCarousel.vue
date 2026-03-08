<template>
  <view class="carousel">
    <swiper
      class="carousel-swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="500"
      :circular="true"
      indicator-color="rgba(255,255,255,0.4)"
      indicator-active-color="#FFCB05"
    >
      <swiper-item
        v-for="(img, index) in images"
        :key="index"
      >
        <image
          class="carousel-image"
          :src="img"
          mode="aspectFill"
          lazy-load
        />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
}

defineProps<Props>()
</script>

<style lang="less" scoped>
@import '../styles/variables.less';

.carousel {
  width: 100%;
  margin-bottom: @spacing-md;
  border-radius: @border-radius-md;
  overflow: hidden;
  box-shadow: @shadow-md;
}

.carousel-swiper {
  width: 100%;
  height: 480rpx;
}

.carousel-image {
  width: 100%;
  height: 100%;
}
</style>
