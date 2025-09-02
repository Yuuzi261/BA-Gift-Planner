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
    const screenshotStyle = ref('gift-recommendation') // 'gift-recommendation' or 'student-preference'

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

    function toggleScreenshotStyle() {
      screenshotStyle.value =
        screenshotStyle.value === 'gift-recommendation' ? 'student-preference' : 'gift-recommendation'
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
      screenshotStyle,
      toggleTheme,
      toggleCharacterSelectorLazyLoad,
      toggleShowOnlyOptimalSolution,
      toggleScreenshotStyle,
      setLocale,
      initThemeListener,
    }
  },
  { persist: true }
)
