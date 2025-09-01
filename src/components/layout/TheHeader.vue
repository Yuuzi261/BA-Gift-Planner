<template>
  <header class="header">
    <div class="header-title">
      <img :src="logoUrl" :alt="t('header.title')" />
    </div>
    <div class="controls">
      <button class="icon-btn" @click="$emit('openModal')">
        <img :src="addStudentsIconUrl" :alt="t('header.selectStudentsAlt')" draggable="false" />
      </button>
      <button class="icon-btn" @click="$emit('openShareModal')">
        <img :src="shareIconUrl" :alt="t('header.shareAlt')" draggable="false" />
      </button>
      <button class="icon-btn settings-btn" @click="handleSettingsClick">
        <img
          :src="gearIconUrl"
          :alt="t('header.settingsAlt')"
          :class="{ 'is-rotating': isSettingsIconRotating }"
          @animationend="isSettingsIconRotating = false"
          draggable="false"
        />
      </button>
      <button class="icon-btn theme-toggle-btn" @click="toggleTheme">
        <Transition name="icon-fade-slide" mode="out-in">
          <svg
            v-if="theme === 'light'"
            key="sun-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg
            v-else-if="theme === 'dark'"
            key="moon-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg
            v-else
            key="system-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 7 A5 5 0 0 0 12 17 Z" fill="currentColor" stroke="none"></path>
          </svg>
        </Transition>
      </button>
    </div>
  </header>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import { getAssetsFile } from '@utils/getAssetsFile'
  import { getTitleUrl } from '@utils/getTitleUrl'
  import { useI18n } from '@composables/useI18n'
  import { useWindowSize } from '@vueuse/core'

  const { t, currentLocale: locale } = useI18n()

  const emit = defineEmits(['openModal', 'openSettingsModal', 'openShareModal'])

  const settingStore = useSettingStore()
  const { theme } = storeToRefs(settingStore)
  const { toggleTheme } = settingStore

  const { width } = useWindowSize()
  const isMobile = computed(() => width.value <= 768)

  const addStudentsIconUrl = computed(() => getAssetsFile('icon/add_students.svg'))
  const shareIconUrl = computed(() => getAssetsFile('icon/share.svg'))
  const gearIconUrl = computed(() => getAssetsFile('icon/gear.svg'))

  const logoUrl = computed(() => getTitleUrl(locale.value, isMobile.value))

  const isSettingsIconRotating = ref(false)

  const handleSettingsClick = () => {
    isSettingsIconRotating.value = true
    emit('openSettingsModal')
  }
</script>

<style scoped>
  @keyframes rotate-gear {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(45deg, #87ceeb, #6495ed);
    color: white;
    padding: 5px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dark-mode .header {
    background: linear-gradient(45deg, #2a7fff, #00aeef);
  }

  .header-title {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .header-title img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .dark-mode .icon-btn {
    background: rgba(255, 255, 255, 0.1);
  }

  .dark-mode .icon-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .icon-btn img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
    transition: transform 0.5s ease-in-out;
  }

  .icon-btn img.is-rotating {
    animation: rotate-gear 0.5s ease-in-out;
  }

  .settings-btn:hover img {
    transform: rotate(90deg);
  }

  .theme-toggle-btn {
    padding: 8px;
  }

  .theme-toggle-btn svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .icon-fade-slide-enter-active,
  .icon-fade-slide-leave-active {
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .icon-fade-slide-enter-from {
    opacity: 0;
    transform: rotateY(90deg);
  }

  .icon-fade-slide-leave-to {
    opacity: 0;
    transform: rotateY(-90deg);
  }
</style>
