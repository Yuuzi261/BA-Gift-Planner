<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <TheHeader
      @open-modal="openModal"
      @open-settings-modal="openSettingsModal"
      @copy-share-link="handleCopyShareLink"
      @open-share-modal="openShareModal"
    />

    <main>
      <WelcomeMessage v-if="selectedStudents.length === 0" />
      <template v-else>
        <GiftRecommendation v-for="gift in recommendedGifts" :key="`${gift.id}-${gift.isSsr}`" :gift="gift" />
        <GiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
        <GiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
      </template>
    </main>

    <FooterSection />

    <SilentScreenshotRenderer
      ref="silentScreenshotRendererRef"
      :recommended-gifts="recommendedGifts"
      :student-preferences="studentPreferences"
      :generic-ssr-gifts="genericSsrGifts"
      :synthesis-gifts="synthesisGifts"
      :is-dark-mode="isDarkMode"
      :style="screenshotRenderStyle"
      :size="screenshotRenderSize"
    />

    <StudentSelectionModal
      :is-modal-open="isModalOpen"
      :students-data="studentsData"
      :selected-students="selectedStudents"
      @close-modal="closeModal"
      @toggle-student="toggleStudent"
      @reset-selection="selectedStudentIds = []"
    />

    <SettingsModal :is-visible="isSettingsModalVisible" @close="closeSettingsModal" />
    <ShareModal
      :is-visible="isShareModalVisible"
      v-model:screenshot-style="screenshotRenderStyle"
      v-model:screenshot-size="screenshotRenderSize"
      @close="closeShareModal"
      @download-screenshot="handleDownloadShareScreenshot"
    />

    <LoadingOverlay :is-visible="isDownloadingScreenshot" />
    <ToastNotification />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useOverlayScrollbars } from 'overlayscrollbars-vue'
  import { runIPGeolocation } from '@utils/ipGeolocation'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import TheHeader from '@components/layout/TheHeader.vue'
  import WelcomeMessage from '@components/section/WelcomeMessage.vue'
  import GiftRecommendation from '@components/section/GiftRecommendation.vue'
  import GiftGridSection from '@components/section/GiftGridSection.vue'
  import StudentSelectionModal from '@components/modal/StudentSelectionModal.vue'
  import SettingsModal from '@components/modal/SettingsModal.vue'
  import ShareModal from '@components/modal/ShareModal.vue'
  import FooterSection from '@components/layout/FooterSection.vue'
  import SilentScreenshotRenderer from '@components/utility/SilentScreenshotRenderer.vue'
  import LoadingOverlay from '@components/utility/LoadingOverlay.vue'
  import ToastNotification from '@components/ui/ToastNotification.vue'
  import { useStudentData } from '@utils/fetchStudentData'
  import { useSrGiftData } from '@utils/fetchSrGiftData'
  import { useSsrGiftData } from '@utils/fetchSsrGiftData'
  import { getPreferenceValue } from '@utils/getPreferenceValue'
  import { useI18n } from '@composables/useI18n'
  import { useShareableSelection } from '@composables/useShareableSelection'
  import { useToast } from '@composables/useToast'

  const { t, isLoaded, currentLocale: locale } = useI18n()
  const { addToast } = useToast()
  const settingStore = useSettingStore()
  const { isDarkMode, showOnlyOptimalSolution } = storeToRefs(settingStore)

  const [initBodyOverlayScrollbars, getBodyOverlayScrollbarsInstance] = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        theme: isDarkMode.value ? 'os-theme-light' : 'os-theme-dark',
        clickScroll: true,
      },
    },
  })

  // Data Fetching
  const { data: fetchedStudentsData } = useStudentData()
  const { data: srGiftsData } = useSrGiftData(locale)
  const { data: ssrGiftsData } = useSsrGiftData(locale)

  const studentsData = computed(() => fetchedStudentsData.value || [])

  const giftsData = computed(() => {
    if (!srGiftsData.value || !ssrGiftsData.value) {
      return []
    }
    return [
      ...srGiftsData.value.map((g) => ({ ...g, isSsr: false })),
      ...ssrGiftsData.value.map((g) => ({ ...g, isSsr: true })),
    ]
  })

  const selectedStudentIds = ref([])
  const isModalOpen = ref(false)
  const isSettingsModalVisible = ref(false)
  const isShareModalVisible = ref(false)
  const screenshotRenderStyle = ref('gift-recommendation') // Default style for screenshot rendering
  const screenshotRenderSize = ref('1') // Default size for screenshot rendering
  const silentScreenshotRendererRef = ref(null)
  const isDownloadingScreenshot = ref(false)

  useShareableSelection(selectedStudentIds, studentsData)

  // Use computed to ensure student names are updated responsively
  const selectedStudents = computed(() => {
    return selectedStudentIds.value.map((id) => studentsData.value.find((student) => student.id === id)).filter(Boolean) // Filter out students who may not be found
  })

  onMounted(async () => {
    // Wait for IP location to set locale
    await runIPGeolocation()
    settingStore.initThemeListener()
    initBodyOverlayScrollbars({ target: document.body })
  })

  watch(
    [isLoaded, locale],
    ([loaded, newLocale]) => {
      if (loaded && newLocale) {
        document.title = t('common.title')
      }
    },
    { immediate: true }
  )

  watch(
    isDarkMode,
    (isDark) => {
      if (isDark) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }

      // Dynamically update the theme of the OverlayScrollbars instance
      const instance = getBodyOverlayScrollbarsInstance()
      if (instance) {
        instance.options({
          scrollbars: {
            theme: isDark ? 'os-theme-light' : 'os-theme-dark',
          },
        })
      }
    },
    { immediate: true }
  )

  function openModal() {
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
  }

  function openSettingsModal() {
    isSettingsModalVisible.value = true
  }

  function closeSettingsModal() {
    isSettingsModalVisible.value = false
  }

  function openShareModal() {
    isShareModalVisible.value = true
  }

  function closeShareModal() {
    isShareModalVisible.value = false
  }

  function handleCopyShareLink() {
    navigator.clipboard.writeText(window.location.href)
    addToast(t('toast.link_copied_to_clipboard'), 'success')
  }

  async function handleDownloadShareScreenshot() {
    isDownloadingScreenshot.value = true
    try {
      if (silentScreenshotRendererRef.value) {
        await silentScreenshotRendererRef.value.takeScreenshot()
      }
    } finally {
      isDownloadingScreenshot.value = false
    }
  }

  function toggleStudent(student) {
    const index = selectedStudentIds.value.findIndex((id) => id === student.id)
    if (index > -1) {
      selectedStudentIds.value.splice(index, 1)
    } else {
      selectedStudentIds.value.push(student.id)
    }
  }

  const analyzedGifts = computed(() => {
    if (selectedStudents.value.length === 0) {
      return []
    }

    return giftsData.value.map((gift) => {
      const analysis = analyzeGift(gift, showOnlyOptimalSolution.value)
      return { ...gift, analysis }
    })
  })

  const synthesisGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.shouldSynthesize)
  })

  const genericSsrGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.isGeneric)
  })

  const recommendedGifts = computed(() => {
    return analyzedGifts.value
      .filter((gift) => gift.analysis.isRecommended)
      .sort((a, b) => b.analysis.maxValue - a.analysis.maxValue)
  })

  const studentPreferences = computed(() => {
    if (selectedStudents.value.length === 0) {
      return []
    }

    const preferencesMap = new Map(
      selectedStudents.value.map((student) => [
        student.id,
        {
          id: student.id,
          favor: student.favor,
          gifts: [],
        },
      ])
    )

    recommendedGifts.value.forEach((gift) => {
      if (gift.analysis && gift.analysis.characters) {
        gift.analysis.characters.forEach((character) => {
          const studentPref = preferencesMap.get(character.id)
          if (studentPref) {
            studentPref.gifts.push({
              ...gift,
              isRecommended: character.isOptimal,
              preferenceValue: character.value,
            })
          }
        })
      }
    })

    const result = Array.from(preferencesMap.values())
    result.forEach((studentPref) => {
      studentPref.gifts.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) {
          return a.isRecommended ? -1 : 1
        }
        return b.preferenceValue - a.preferenceValue
      })
    })

    return result
  })

  function analyzeGift(gift, showOnlyOptimal) {
    const preferences = selectedStudents.value.map((student) => ({
      student,
      value: getPreferenceValue(student, gift),
    }))
    const maxValue = Math.max(0, ...preferences.map((p) => p.value))

    const analysis = {
      isRecommended: false,
      isGeneric: false,
      shouldSynthesize: false,
      maxValue,
    }

    const baseThreshold = gift.isSsr ? 180 : 40

    if (maxValue < baseThreshold) {
      if (gift.isSsr) {
        analysis.isGeneric = true
      } else {
        analysis.shouldSynthesize = true
      }
      return analysis
    }

    const potentialCharacters = preferences
      .filter((p) => p.value >= baseThreshold)
      .map((p) => ({
        ...p.student,
        isOptimal: p.value === maxValue,
        value: p.value,
      }))

    const finalCharacters = showOnlyOptimal
      ? potentialCharacters.filter((c) => c.isOptimal)
      : potentialCharacters.sort((a, b) => b.value - a.value)

    if (finalCharacters.length === 0) {
      if (gift.isSsr) analysis.isGeneric = true
      else analysis.shouldSynthesize = true
      return analysis
    }

    analysis.isRecommended = true
    analysis.characters = finalCharacters

    if (gift.isSsr) {
      if (maxValue >= 240) {
        analysis.class = 'rec-best'
        analysis.typeTextKey = 'app.analysis.recBest'
        analysis.titleKey = 'app.analysis.bestChoice'
        analysis.titleValue = maxValue
      } else {
        // >= 180
        analysis.class = 'rec-good'
        analysis.typeTextKey = 'app.analysis.recGood'
        analysis.titleKey = 'app.analysis.goodChoice'
        analysis.titleValue = maxValue
      }
    } else {
      // SR
      if (maxValue >= 80) {
        analysis.class = 'rec-extra'
        analysis.typeTextKey = 'app.analysis.recExtra'
        analysis.titleKey = 'app.analysis.extraChoice'
        analysis.titleValue = maxValue
      } else if (maxValue >= 60) {
        analysis.class = 'rec-best'
        analysis.typeTextKey = 'app.analysis.recBest'
        analysis.titleKey = 'app.analysis.bestChoice'
        analysis.titleValue = maxValue
      } else {
        // >= 40
        analysis.class = 'rec-good'
        analysis.typeTextKey = 'app.analysis.recGood'
        analysis.titleKey = 'app.analysis.goodChoice'
        analysis.titleValue = maxValue
      }
    }

    return analysis
  }
</script>

<style scoped>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 80px - 40px); /* Subtract header(80px) & padding(40px) height */
  }
</style>
