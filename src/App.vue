<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <TheHeader />
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <FooterSection />

    <!-- Global Modals -->
    <StudentSelectionModal
      :is-modal-open="isStudentSelectionModalOpen"
      :students-data="studentsData"
      :selected-students="selectedStudents"
      @close-modal="closeStudentSelectionModal"
      @toggle-student="toggleStudent"
      @reset-selection="resetSelection"
    />
    <SettingsModal :is-visible="isSettingsModalOpen" @close="closeSettingsModal" />
    <ShareModal
      :is-visible="isShareModalOpen"
      v-model:screenshot-style="screenshotRenderStyle"
      v-model:screenshot-layout="screenshotLayout"
      v-model:screenshot-size="screenshotRenderSize"
      @close="closeShareModal"
      @download-screenshot="handleDownloadShareScreenshot"
    />
    <MigrationModal />
  </div>
</template>

<script setup>
  import { watch, onMounted } from 'vue'
  import { useOverlayScrollbars } from 'overlayscrollbars-vue'
  import { runIPGeolocation } from '@utils/ipGeolocation'
  import { useSettingStore } from '@store/setting'
  import { useModalStore } from '@store/modal'
  import { useStudentStore } from '@store/student'
  import { useScreenshotStore } from '@store/screenshot'
  import { storeToRefs } from 'pinia'
  import TheHeader from '@components/layout/TheHeader.vue'
  import FooterSection from '@components/layout/FooterSection.vue'
  import StudentSelectionModal from '@components/modal/StudentSelectionModal.vue'
  import SettingsModal from '@components/modal/SettingsModal.vue'
  import ShareModal from '@components/modal/ShareModal.vue'
  import MigrationModal from '@components/modal/MigrationModal.vue'
  import { useI18n } from '@composables/useI18n'

  const { t, isLoaded, currentLocale: locale } = useI18n()
  const settingStore = useSettingStore()
  const { isDarkMode } = storeToRefs(settingStore)

  const modalStore = useModalStore()
  const { isStudentSelectionModalOpen, isSettingsModalOpen, isShareModalOpen } = storeToRefs(modalStore)
  const { closeStudentSelectionModal, closeSettingsModal, closeShareModal } = modalStore

  const studentStore = useStudentStore()
  const { studentsData, selectedStudents } = storeToRefs(studentStore)
  const { toggleStudent, resetSelection } = studentStore

  const screenshotStore = useScreenshotStore()
  const { screenshotRenderStyle, screenshotLayout, screenshotRenderSize, onDownload } = storeToRefs(screenshotStore)

  const [initBodyOverlayScrollbars, getBodyOverlayScrollbarsInstance] = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        theme: isDarkMode.value ? 'os-theme-light' : 'os-theme-dark',
        clickScroll: true,
      },
    },
  })

  function handleDownloadShareScreenshot() {
    if (onDownload.value) {
      onDownload.value()
    }
  }

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
</script>

<style scoped>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 80px - 40px); /* Subtract header(80px) & padding(40px) height */
  }

  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .page-fade-enter-from,
  .page-fade-leave-to {
    opacity: 0;
  }
</style>
