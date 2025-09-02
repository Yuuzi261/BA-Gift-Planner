<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ t('characterSelector.title') }}</h3>
            <button class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="fixed-section">
              <div ref="searchAndReset" class="search-and-reset modal-body-content-padding">
                <input
                  v-model="searchTerm"
                  type="text"
                  :placeholder="t('characterSelector.searchPlaceholder')"
                  class="search-input"
                />
                <div class="action-buttons">
                  <button v-if="!isFilterPanelOpen" class="reset-selection-button" @click="resetSelection">
                    {{ t('characterSelector.resetSelection') }}
                  </button>
                  <button v-if="isFilterPanelOpen" class="reset-button" @click="resetFilters">
                    {{ t('characterSelector.resetFilters') }}
                  </button>
                  <button class="filter-toggle-button" @click="toggleFilterPanel">
                    <img
                      :src="
                        isFilterPanelOpen
                          ? getAssetsFile('icon/filter_close.svg')
                          : getAssetsFile('icon/filter_open.svg')
                      "
                      alt="Toggle Filters"
                      class="filter-toggle-icon"
                      draggable="false"
                    />
                  </button>
                </div>
              </div>
              <div
                ref="filterControls"
                class="filter-controls"
                :class="{ 'is-open': isFilterPanelOpen, 'is-animating': isAnimating }"
              >
                <div ref="filterContentWrapper" class="filter-content-wrapper modal-body-content-padding">
                  <div v-for="group in filterOptions.filters" :key="group.id" class="filter-group">
                    <span class="filter-label">{{ t(group.labelKey) }}</span>
                    <div class="filter-buttons">
                      <button
                        :class="{ active: selectedFilters[group.id].length === 0 }"
                        @click="selectFilter(group.id, null)"
                      >
                        {{ t('common.all') }}
                      </button>
                      <button
                        v-for="option in group.options"
                        :key="option.value"
                        :class="{
                          active: selectedFilters[group.id].includes(option.value),
                          'has-icon': ['attackType', 'defenseType', 'school', 'collection'].includes(group.id),
                        }"
                        @click="selectFilter(group.id, option.value)"
                        style="font-family: inherit"
                      >
                        <template v-if="group.id === 'attackType'">
                          <div class="type-icon-wrapper" :class="`type-bg-${option.value.toLowerCase()}`">
                            <img :src="getAssetsFile(`icon/Type_Attack_s.webp`)" alt="Attack Icon" class="type-icon" />
                          </div>
                        </template>
                        <template v-else-if="group.id === 'defenseType'">
                          <div class="type-icon-wrapper" :class="`type-bg-${option.value.toLowerCase()}`">
                            <img
                              :src="getAssetsFile(`icon/Type_Defense_s.webp`)"
                              alt="Defense Icon"
                              class="type-icon"
                            />
                          </div>
                        </template>
                        <template v-else-if="group.id === 'school'">
                          <img :src="getSchoolIconUrl(option.value)" :alt="option.value" class="school-icon" />
                        </template>
                        <template v-else-if="group.id === 'collection'">
                          <img
                            :src="getAssetsFile(`icon/${option.value.toLowerCase()}.svg`)"
                            :alt="option.value"
                            class="collection-icon"
                          />
                        </template>

                        <span :class="{ 'nexon-font': ['weapon', 'position'].includes(group.id) }">
                          <span
                            v-if="group.id === 'position'"
                            :class="`position-type-${option.label.toLowerCase()}`"
                            class="position-button"
                          >
                            {{ option.label }}
                          </span>
                          <span v-else>{{ getOptionLabel(group, option) }}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="scrollable-section">
              <div class="student-grid modal-body-content-padding">
                <div
                  v-for="student in filteredStudents"
                  :key="student.id"
                  class="student-card"
                  :class="{ selected: selectedStudents.some((s) => s.id === student.id) }"
                  @click="toggleStudentSelection(student)"
                >
                  <ImageWithLoader
                    :src="getAvatarUrl(student.id)"
                    class="student-avatar-large"
                    :lazy="enableCharacterSelectorLazyLoad"
                  />
                  <span class="student-name">{{ t(`student.name.${student.id}`) }}</span>
                </div>
                <div v-if="filteredStudents.length === 0" class="no-results">
                  {{ t('characterSelector.noResults') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { ref, computed, toRefs, onMounted, onBeforeUnmount, reactive, watch, nextTick } from 'vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { getAssetsFile } from '@utils/getAssetsFile'
  import { getSchoolIconUrl } from '@utils/getSchoolIconUrl'
  import { useModal } from '@composables/useModal.js'
  import { useI18n } from '@composables/useI18n.js'
  import filterOptions from '@/data/filterOptions.json'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'

  const { t } = useI18n()

  const props = defineProps({
    isModalOpen: Boolean,
    studentsData: Array,
    selectedStudents: Array,
  })

  const emit = defineEmits(['closeModal', 'toggleStudent', 'resetSelection'])

  const settingStore = useSettingStore()
  const { enableCharacterSelectorLazyLoad } = storeToRefs(settingStore)

  const searchTerm = ref('')
  const isFilterPanelOpen = ref(false)
  const isAnimating = ref(false)

  const selectedFilters = reactive(
    filterOptions.filters.reduce((acc, filter) => {
      acc[filter.id] = []
      return acc
    }, {})
  )

  const searchAndReset = ref(null)
  const filterControls = ref(null)
  const filterContentWrapper = ref(null)

  const getOptionLabel = (group, option) => {
    if (group.id === 'position') {
      return option.label
    }
    if (group.id === 'weapon') {
      return option.value
    }
    const prefix = group.labelKeyPrefix || group.id
    return t(`${prefix}.${option.value}`)
  }

  const closeModal = () => {
    emit('closeModal')
  }

  const { isModalOpen: isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  watch(isVisible, (newValue) => {
    if (newValue && isFilterPanelOpen.value) {
      adjustFilterHeight()
    }
  })

  const adjustFilterHeight = () => {
    if (isFilterPanelOpen.value) {
      nextTick(() => {
        const modalBodyHeight = document.querySelector('.modal-body').offsetHeight
        const searchAndResetHeight = searchAndReset.value.offsetHeight
        const maxHeight = modalBodyHeight - searchAndResetHeight - 20
        if (filterContentWrapper.value) {
          filterContentWrapper.value.style.maxHeight = `${maxHeight}px`
        }
      })
    }
  }

  const toggleFilterPanel = () => {
    isFilterPanelOpen.value = !isFilterPanelOpen.value
    isAnimating.value = true

    if (isFilterPanelOpen.value) {
      adjustFilterHeight()
    } else {
      if (filterContentWrapper.value) {
        filterContentWrapper.value.style.maxHeight = ''
      }
    }

    setTimeout(() => {
      isAnimating.value = false
    }, 320)
  }

  const selectFilter = (filterType, value) => {
    const targetArray = selectedFilters[filterType]
    if (!targetArray) return

    if (value === null) {
      selectedFilters[filterType] = []
    } else {
      const index = targetArray.indexOf(value)
      if (index > -1) {
        targetArray.splice(index, 1)
      } else {
        targetArray.push(value)
      }
    }
  }

  const resetFilters = () => {
    searchTerm.value = ''
    for (const key in selectedFilters) {
      selectedFilters[key] = []
    }
  }

  const resetSelection = () => {
    emit('resetSelection')
  }

  const filteredStudents = computed(() => {
    return props.studentsData.filter((student) => {
      const translatedName = t(`student.name.${student.id}`)
      const searchMatch = !searchTerm.value || translatedName.toLowerCase().includes(searchTerm.value.toLowerCase())

      const filtersMatch = filterOptions.filters.every((group) => {
        if (group.id === 'rating') return true // not in student data

        const selected = selectedFilters[group.id]
        if (selected.length === 0) return true

        if (group.id === 'collection') {
          const isSelected = props.selectedStudents.some((s) => s.id === student.id)
          return selected.some((option) => {
            if (option === 'Selected') return isSelected
            if (option === 'Unselected') return !isSelected
            return false
          })
        }

        return selected.includes(student[group.id])
      })

      return searchMatch && filtersMatch
    })
  })

  const toggleStudentSelection = (student) => {
    emit('toggleStudent', student)
  }

  onMounted(() => {
    window.addEventListener('resize', adjustFilterHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustFilterHeight)
  })
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
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
    overflow: hidden;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    border-color: #2a4a6e;
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
    display: flex;
    flex-direction: column;
    height: calc(80vh - 60px);
    padding-top: 20px;
  }

  .fixed-section {
    flex-shrink: 0;
  }

  .scrollable-section {
    flex-grow: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #bdc3c7 #f8f9fa;
    mask-image: linear-gradient(to bottom, transparent, black 15px);
  }

  .dark-mode .scrollable-section {
    scrollbar-color: #7f8c8d #1a2b40;
  }

  .modal-body-content-padding {
    padding: 0 20px;
  }

  .search-and-reset {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input {
    flex-grow: 1;
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
    font-family: inherit;
    min-width: 0;
  }

  .dark-mode .search-input {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .filter-controls {
    margin: 15px 0;
    border-bottom: 1px solid #dee2e6;
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    margin-bottom: 0;
    border-bottom-width: 0;
    transition:
      grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      border-bottom-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .filter-controls.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
    border-bottom-width: 1px;
  }

  .dark-mode .filter-controls {
    border-bottom-color: #2a4a6e;
  }

  .filter-content-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 20px;
    min-height: 0;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: #bdc3c7 #f8f9fa;
  }

  .filter-content-wrapper::after {
    content: '';
    display: block;
    height: 15px;
    flex-shrink: 0;
  }

  .dark-mode .filter-content-wrapper {
    scrollbar-color: #7f8c8d #1a2b40;
  }

  .filter-controls.is-open:not(.is-animating) .filter-content-wrapper {
    overflow-y: auto;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-label {
    font-weight: bold;
    margin-right: 8px;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .reset-selection-button {
    padding: 10px 15px;
    border: 1px solid transparent;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    font-family: inherit;
    white-space: nowrap;
    background: linear-gradient(45deg, #5dade2, #2e86c1);
    color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transform: translateY(0);
  }

  .reset-selection-button:hover {
    background: linear-gradient(45deg, #2e86c1, #21618c);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  .reset-selection-button:active {
    background: linear-gradient(45deg, #21618c, #1b4f72);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transform: translateY(0);
  }

  .dark-mode .reset-selection-button {
    background: linear-gradient(45deg, #5dade2, #2e86c1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  .dark-mode .reset-selection-button:hover {
    background: linear-gradient(45deg, #2e86c1, #21618c);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }

  .dark-mode .reset-selection-button:active {
    background: linear-gradient(45deg, #21618c, #1b4f72);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .reset-button {
    padding: 10px 15px;
    border: 1px solid transparent;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    font-family: inherit;
    white-space: nowrap;
    background: linear-gradient(45deg, #ff6b6b, #e74c3c);
    color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transform: translateY(0);
  }

  .reset-button:hover {
    background: linear-gradient(45deg, #ff4d4d, #d63031);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  .reset-button:active {
    background: linear-gradient(45deg, #d63031, #c02a2a);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transform: translateY(0);
  }

  .dark-mode .reset-button {
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  .dark-mode .reset-button:hover {
    background: linear-gradient(45deg, #c0392b, #a93226);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }

  .dark-mode .reset-button:active {
    background: linear-gradient(45deg, #a93226, #922b20);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .filter-toggle-button {
    display: flex;
    padding: 0;
    background: linear-gradient(45deg, #87ceeb, #6495ed);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .filter-toggle-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .filter-toggle-button:active {
    transform: translateY(0);
    background: linear-gradient(45deg, #6495ed, #4682b4);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .filter-toggle-icon {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
  }

  .dark-mode .filter-toggle-button {
    background: linear-gradient(45deg, #2a7fff, #00aeef);
  }

  .dark-mode .filter-toggle-button:active {
    background: linear-gradient(45deg, #0062cc, #008fbf);
  }

  .filter-group button {
    padding: 5px 12px;
    border: 1px solid #bdc3c7;
    border-radius: 15px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.86rem;
  }

  .filter-group button.has-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px 5px 8px;
  }

  .dark-mode .filter-group button {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .filter-group button:hover {
    background-color: #e9ecef;
    border-color: #6495ed;
  }

  .dark-mode .filter-group button:hover {
    background-color: #2a4a6e;
    border-color: #00aeef;
  }

  .filter-group button.active {
    background-color: #6495ed;
    color: white;
    border-color: #6495ed;
    font-weight: bold;
  }

  .dark-mode .filter-group button.active {
    background-color: #00aeef;
    border-color: #00aeef;
  }

  .type-icon-wrapper {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  .type-icon {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  .school-icon,
  .collection-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .filter-group button .school-icon {
    filter: invert(1);
  }

  .filter-group button.active .school-icon {
    filter: none;
  }

  .dark-mode .filter-group button .school-icon {
    filter: none;
  }

  .filter-group button.active .collection-icon {
    filter: invert(1);
  }

  .dark-mode .filter-group button .collection-icon {
    filter: invert(1);
  }

  .type-bg-explosive,
  .type-bg-light {
    background: #a70c19;
  }
  .type-bg-piercing,
  .type-bg-heavy {
    background: #b26d1f;
  }
  .type-bg-mystic,
  .type-bg-special {
    background: #216f9c;
  }
  .type-bg-sonic,
  .type-bg-elastic {
    background: #9431a5;
  }

  .nexon-font {
    font-family: 'NEXON Football Gothic', sans-serif;
    font-style: italic;
    font-weight: 300;
    margin-right: 4px;
  }

  .position-type-striker {
    color: #cc1a25;
  }

  .position-type-special {
    color: #006bff;
  }

  .filter-group button.active .position-button {
    color: white;
  }

  .student-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
    padding: 15px 20px 20px;
  }

  .student-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition:
      background-color 0.2s,
      transform 0.2s;
    border: 2px solid transparent;
  }

  .dark-mode .student-card {
    color: #e0e6ed;
  }

  .student-card:hover {
    background-color: #e9ecef;
    transform: translateY(-3px);
  }

  .dark-mode .student-card:hover {
    background-color: #1f3048;
  }

  .student-card.selected {
    border-color: #6495ed;
    background: linear-gradient(135deg, rgba(100, 149, 237, 0.15) 0%, rgba(135, 206, 235, 0.1) 100%);
    box-shadow:
      0 0 0 3px rgba(100, 149, 237, 0.3),
      0 8px 25px rgba(100, 149, 237, 0.2);
    transform: translateY(-2px);
  }

  .dark-mode .student-card.selected {
    border-color: #00aeef;
    background: linear-gradient(135deg, rgba(0, 174, 239, 0.2) 0%, rgba(42, 127, 255, 0.15) 100%);
    box-shadow:
      0 0 0 3px rgba(0, 174, 239, 0.4),
      0 8px 25px rgba(0, 174, 239, 0.3);
  }

  .student-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 8px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .student-avatar-large :deep(img) {
    border-radius: 50%;
    border: 3px solid #6495ed;
    transition: border-color 0.2s;
  }

  .dark-mode .student-avatar-large :deep(img) {
    border-color: #00aeef;
  }

  /* 頭像邊框在選中時的變化 */
  .student-card.selected .student-avatar-large {
    transform: scale(1.05);
  }

  .student-card.selected .student-avatar-large :deep(img) {
    border-color: #6495ed;
    box-shadow: 0 0 15px rgba(100, 149, 237, 0.4);
  }

  .dark-mode .student-card.selected .student-avatar-large :deep(img) {
    border-color: #00aeef;
    box-shadow: 0 0 15px rgba(0, 174, 239, 0.5);
  }

  /* 選中時的名稱文字效果 */
  .student-card.selected .student-name {
    color: #4169e1;
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(100, 149, 237, 0.3);
  }

  .dark-mode .student-card.selected .student-name {
    color: #87ceeb;
    text-shadow: 0 1px 3px rgba(0, 174, 239, 0.4);
  }

  .student-name {
    font-weight: bold;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
  }

  .nexon-font {
    font-family: 'NEXON Football Gothic', sans-serif;
    font-style: italic;
    font-weight: 700;
    margin-right: 4px;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .scrollable-section::-webkit-scrollbar,
  .filter-content-wrapper::-webkit-scrollbar {
    width: 12px;
  }

  .scrollable-section::-webkit-scrollbar-track,
  .filter-content-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable-section::-webkit-scrollbar-thumb,
  .filter-content-wrapper::-webkit-scrollbar-thumb {
    background-color: #bdc3c7;
    border-radius: 10px;
    border: 3px solid #f8f9fa;
  }

  .dark-mode .scrollable-section::-webkit-scrollbar-thumb,
  .dark-mode .filter-content-wrapper::-webkit-scrollbar-thumb {
    background-color: #7f8c8d;
    border-color: #1a2b40;
  }

  .scrollable-section::-webkit-scrollbar-thumb:hover,
  .filter-content-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #a9a9a9;
  }

  .dark-mode .scrollable-section::-webkit-scrollbar-thumb:hover,
  .dark-mode .filter-content-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #95a5a6;
  }
</style>
