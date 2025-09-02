import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingStore = defineStore(
  'setting',
  () => {
    // State
    const theme = ref('system') // 'light', 'dark', 'system'
    const osPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
    const locale = ref(null)
    const showOnlyOptimalSolution = ref(false)
    const enableCharacterSelectorLazyLoad = ref(true)
    const recommendationView = ref('gift') // 'gift' or 'student'

    // Getters (Computed)
    const isDarkMode = computed(() => {
      if (theme.value === 'dark') return true
      if (theme.value === 'light') return false
      return osPrefersDark.value // 'system'
    })

    // Actions
    function toggleTheme() {
      const themes = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(theme.value)
      const nextIndex = (currentIndex + 1) % themes.length
      theme.value = themes[nextIndex]
    }

    function toggleCharacterSelectorLazyLoad() {
      enableCharacterSelectorLazyLoad.value = !enableCharacterSelectorLazyLoad.value
    }

    function toggleShowOnlyOptimalSolution() {
      showOnlyOptimalSolution.value = !showOnlyOptimalSolution.value
    }

    function toggleRecommendationView() {
      recommendationView.value = recommendationView.value === 'gift' ? 'student' : 'gift'
    }

    function setLocale(newLocale) {
      locale.value = newLocale
    }

    function initThemeListener() {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        osPrefersDark.value = e.matches
      })
    }

    return {
      theme,
      locale,
      isDarkMode,
      enableCharacterSelectorLazyLoad,
      showOnlyOptimalSolution,
      recommendationView,
      toggleTheme,
      toggleCharacterSelectorLazyLoad,
      toggleShowOnlyOptimalSolution,
      toggleRecommendationView,
      setLocale,
      initThemeListener,
    }
  },
  { persist: true }
)
