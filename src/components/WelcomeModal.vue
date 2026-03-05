<template>
  <view v-if="welcomeStore.shouldShow" class="welcome-modal">
    <view class="modal-overlay" @tap="handleClose"></view>
    <view class="modal-content">
      <view class="modal-header">
        <text class="modal-title">欢迎来到宝可梦世界！</text>
        <view class="close-button" @tap="handleClose">
          <text>✕</text>
        </view>
      </view>
      <view class="modal-body">
        <view class="greeting-animation">
          <text class="greeting-word greeting-cn">你好</text>
          <text class="greeting-word greeting-jp">こんにちは</text>
          <text class="greeting-word greeting-en">Hello</text>
        </view>
        <text class="greeting-text">探索神奇的宝可梦世界</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useWelcomeStore } from '../stores/welcome'

const welcomeStore = useWelcomeStore()

const handleClose = () => {
  welcomeStore.markAsShown()
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.welcome-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 203, 5, 0.3), rgba(59, 76, 202, 0.3));
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  position: relative;
  width: 80%;
  max-width: 500px;
  background: white;
  border-radius: @border-radius-large;
  box-shadow: @shadow-large;
  padding: @spacing-large;
  animation: slideUp 0.4s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @spacing-medium;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: @pokemon-primary;
}

.close-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: @pokemon-light;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: @pokemon-secondary;
    transform: scale(1.1);
  }

  text {
    font-size: 24px;
    color: @pokemon-dark;
  }
}

.modal-body {
  text-align: center;
}

.greeting-animation {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: @spacing-medium;
}

.greeting-word {
  position: absolute;
  font-size: 48px;
  font-weight: bold;
  opacity: 0;
  animation: greetingFade 6s infinite;
}

.greeting-cn {
  color: @pokemon-primary;
  animation-delay: 0s;
}

.greeting-jp {
  color: @pokemon-secondary;
  animation-delay: 2s;
}

.greeting-en {
  color: #3b4cca;
  animation-delay: 4s;
}

@keyframes greetingFade {
  0%, 100% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  10%, 23% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  33% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
}

.greeting-text {
  display: block;
  font-size: 16px;
  color: @text-secondary;
  margin-top: @spacing-small;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
