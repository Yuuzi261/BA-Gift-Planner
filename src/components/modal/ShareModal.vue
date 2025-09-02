<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <div class="modal-actions">
            <button class="icon-btn" @click="copyLink">
              <img :src="linkIconUrl" alt="Copy Link" />
            </button>
            <button class="icon-btn" @click="downloadScreenshot">
              <img :src="downloadIconUrl" alt="Download Screenshot" />
            </button>
          </div>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
        <div style="overflow-y: auto">
          <div ref="shareContent" class="modal-content">
            <div class="compact-gift-recommendation-grid">
              <CompactGiftRecommendation
                v-for="gift in recommendedGifts"
                :key="`${gift.id}-${gift.isSsr}`"
                :gift="gift"
              />
            </div>
            <CompactGiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
            <CompactGiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
  import { ref, computed, toRefs } from 'vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import { convertElementToJpg } from '@utils/snapDom.js'
  import { getAssetsFile } from '@utils/getAssetsFile'
  import { useI18n } from '@composables/useI18n.js'
  import { useModal } from '@composables/useModal.js'
  import CompactGiftRecommendation from '@components/section/CompactGiftRecommendation.vue'
  import CompactGiftGridSection from '@components/section/CompactGiftGridSection.vue'

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    recommendedGifts: Array,
    genericSsrGifts: Array,
    synthesisGifts: Array,
  })

  const { t } = useI18n()

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const settingStore = useSettingStore()
  const { isDarkMode } = storeToRefs(settingStore)

  const shareContent = ref(null)

  const linkIconUrl = computed(() => getAssetsFile('icon/link.svg'))
  const downloadIconUrl = computed(() => getAssetsFile('icon/download.svg'))

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  const downloadScreenshot = async () => {
    if (!shareContent.value) {
      console.error('Share content element not found.')
      return
    }
    try {
      await convertElementToJpg(shareContent.value, {
        fileName: 'gift-recommendations',
        backgroundColor: isDarkMode.value ? '#1e2a38' : '#f0f4f8',
      })
    } catch (error) {
      console.error('Failed to download screenshot:', error)
    }
  }
</script>

<style scoped>
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }
  .modal-container {
    background: #f0f4f8;
    padding: 20px;
    border-radius: 20px;
    width: 90%;
    max-width: 1000px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: slide-down 0.3s ease-out;
  }

  @keyframes slide-down {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .dark-mode .modal-container {
    background: #1e2a38;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  .modal-actions {
    display: flex;
    gap: 10px;
  }
  .icon-btn {
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s;
  }
  .icon-btn:hover {
    background: rgba(0, 0, 0, 0.2);
  }
  .icon-btn img {
    width: 24px;
    height: 24px;
  }
  .dark-mode .icon-btn img {
    filter: brightness(0) invert(1);
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #888;
  }
  .dark-mode .close-btn {
    color: #eee;
  }
  .modal-content {
    overflow-y: hide;
    padding: 10px;
  }

  .compact-gift-recommendation-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
</style>
