<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ t('common.settings') }}</h3>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <!-- Language Settings -->
            <div class="setting-group">
              <h4 class="setting-group-title">{{ t('settingsModal.language') }}</h4>
              <div class="language-selector">
                <button ref="dropdownToggleRef" class="dropdown-toggle" @click="toggleMenu">
                  {{ currentLanguageName }} <span class="caret" :class="{ open: isOpen }"></span>
                </button>
                <transition name="dropdown">
                  <ul v-if="isOpen" ref="languageMenuRef" class="language-menu">
                    <li
                      v-for="lang in availableLanguages"
                      :key="lang.code"
                      @click="
                        () => {
                          handleLocaleChange(lang.code)
                          isOpen = false
                        }
                      "
                    >
                      {{ lang.name }}
                    </li>
                  </ul>
                </transition>
              </div>
            </div>

            <!-- Show Only Optimal Solution Settings -->
            <div class="setting-group">
              <div class="setting-group-title-wrapper">
                <h4 class="setting-group-title">{{ t('settingsModal.showOnlyOptimalSolution') }}</h4>
              </div>
              <div class="toggle-switch">
                <span class="toggle-label">{{
                  isShowOnlyOptimalSolutionEnabled ? t('common.enabled') : t('common.disabled')
                }}</span>
                <input
                  id="showOnlyOptimalSolutionToggle"
                  type="checkbox"
                  :checked="isShowOnlyOptimalSolutionEnabled"
                  @change="toggleShowOnlyOptimalSolution"
                />
                <label for="showOnlyOptimalSolutionToggle"></label>
              </div>
            </div>

            <!-- Lazy Load Settings -->
            <div class="setting-group">
              <div class="setting-group-title-wrapper">
                <h4 class="setting-group-title">{{ t('settingsModal.characterSelectorLazyLoad') }}</h4>
              </div>
              <div class="toggle-switch">
                <span class="toggle-label">{{ isLazyLoadEnabled ? t('common.enabled') : t('common.disabled') }}</span>
                <input id="lazyLoadToggle" type="checkbox" :checked="isLazyLoadEnabled" @change="toggleLazyLoad" />
                <label for="lazyLoadToggle"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { ref, computed, toRefs, watch } from 'vue'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'

  const { t, currentLocale: locale } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const settingStore = useSettingStore()
  const {
    enableCharacterSelectorLazyLoad: isLazyLoadEnabled,
    showOnlyOptimalSolution: isShowOnlyOptimalSolutionEnabled,
  } = storeToRefs(settingStore)

  const { toggleCharacterSelectorLazyLoad, toggleShowOnlyOptimalSolution } = settingStore

  const availableLanguages = [
    { code: 'zh-tw', name: '繁體中文' },
    { code: 'zh-cn', name: '简体中文' },
  ]

  const isOpen = ref(false)
  const dropdownToggleRef = ref(null)
  const languageMenuRef = ref(null)

  const toggleMenu = () => {
    isOpen.value = !isOpen.value
  }

  const closeMenu = () => {
    isOpen.value = false
  }

  const handleClickOutside = (event) => {
    const isClickInsideButton = dropdownToggleRef.value && dropdownToggleRef.value.contains(event.target)
    const isClickInsideMenu = languageMenuRef.value && languageMenuRef.value.contains(event.target)

    if (!isClickInsideButton && !isClickInsideMenu) {
      closeMenu()
    }
  }

  watch(isOpen, (isMenuOpen) => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside, true)
    } else {
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  const currentLanguageName = computed(() => {
    return availableLanguages.find((lang) => lang.code === locale.value)?.name || ''
  })

  const handleLocaleChange = (newLocale) => {
    if (locale.value === newLocale) {
      return
    }
    settingStore.setLocale(newLocale)
    // window.location.reload()
  }

  const toggleLazyLoad = () => {
    toggleCharacterSelectorLazyLoad()
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #f8f9fa;
    border-radius: 15px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    color: #e0e6ed;
  }

  .modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(45deg, #87ceeb, #6495ed);
    color: white;
    border-radius: 15px 15px 0 0;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #2a7fff, #00aeef);
    border-bottom-color: #2a4a6e;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: white;
    cursor: pointer;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  .close-button:hover {
    opacity: 1;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
  }

  .setting-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #e9ecef;
  }

  .setting-group:last-child {
    border-bottom: none;
  }

  .setting-group-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
  }

  .dark-mode .setting-group {
    border-bottom-color: #2a4a6e;
  }

  .setting-group-title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .language-selector {
    position: relative;
    max-width: 200px;
  }

  .dropdown-toggle {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #bdc3c7;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
  }

  .dark-mode .dropdown-toggle {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .dropdown-toggle:hover {
    border-color: #6495ed;
    background-color: #e9ecef;
  }

  .dark-mode .dropdown-toggle:hover {
    border-color: #00aeef;
    background-color: #2a4a6e;
  }

  .caret {
    margin-left: 10px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #000;
    transition: transform 0.3s ease;
  }

  .dark-mode .caret {
    border-top-color: #e0e6ed;
  }

  .caret.open {
    transform: rotate(180deg);
  }

  .language-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #bdc3c7;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    list-style: none;
    padding: 0;
    margin: 5px 0 0 0;
    z-index: 1000;
    overflow: hidden;
  }

  .dark-mode .language-menu {
    background-color: #1f3048;
    border-color: #2a4a6e;
  }

  .language-menu li {
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .language-menu li:hover {
    background-color: #e9ecef;
  }

  .dark-mode .language-menu li:hover {
    background-color: #2a4a6e;
  }

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .toggle-switch {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toggle-switch input[type='checkbox'] {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-switch label {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 28px;
    background-color: #ccc;
    border-radius: 28px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .toggle-switch label:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    top: 4px;
    left: 4px;
    transition: transform 0.3s;
  }

  input[type='checkbox']:checked + label {
    background-color: #6495ed;
  }

  .dark-mode input[type='checkbox']:checked + label {
    background-color: #00aeef;
  }

  input[type='checkbox']:checked + label:before {
    transform: translateX(20px);
  }

  .toggle-label {
    font-weight: 500;
    user-select: none;
  }
</style>
