<template>
  <div ref="shareContentForScreenshot" class="share-content-for-screenshot" :class="{ 'dark-mode': isDarkMode }">
    <div v-if="screenshotStyle === 'gift-recommendation'" class="compact-gift-recommendation-grid">
      <CompactGiftRecommendation v-for="gift in recommendedGifts" :key="`${gift.id}-${gift.isSsr}`" :gift="gift" />
    </div>
    <div v-else class="compact-student-preference-grid">
      <CompactStudentPreference v-for="student in studentPreferences" :key="student.id" :student="student" />
    </div>
    <CompactGiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
    <CompactGiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { convertElementToJpg } from '@utils/snapDom.js'
  import { useI18n } from '@composables/useI18n'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import CompactGiftRecommendation from '@components/section/CompactGiftRecommendation.vue'
  import CompactStudentPreference from '@components/section/CompactStudentPreference.vue'
  import CompactGiftGridSection from '@components/section/CompactGiftGridSection.vue'

  const props = defineProps({
    recommendedGifts: Array,
    studentPreferences: Array,
    genericSsrGifts: Array,
    synthesisGifts: Array,
    isDarkMode: Boolean,
  })

  const { t } = useI18n()
  const settingStore = useSettingStore()
  const { screenshotStyle } = storeToRefs(settingStore)
  const shareContentForScreenshot = ref(null)

  const takeScreenshot = async () => {
    if (!shareContentForScreenshot.value) {
      console.error('Share content element for screenshot not found.')
      return
    }
    try {
      await convertElementToJpg(shareContentForScreenshot.value, {
        fileName: 'gift-recommendations',
        backgroundColor: props.isDarkMode ? '#1e2a38' : '#f0f4f8',
      })
    } catch (error) {
      console.error('Failed to download screenshot:', error)
    }
  }

  defineExpose({
    takeScreenshot,
  })
</script>

<style scoped>
  .share-content-for-screenshot {
    position: absolute;
    left: -9999px;
    top: -9999px;
    z-index: -1;
    width: 90%;
    width: 1000px;
    padding: 20px;
    height: auto;
    overflow: hidden;
  }

  .share-content-for-screenshot .compact-gift-recommendation-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .share-content-for-screenshot .compact-student-preference-grid {
    display: block;
    margin-bottom: 20px;
  }
</style>
