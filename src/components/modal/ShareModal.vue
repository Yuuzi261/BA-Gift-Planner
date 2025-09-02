<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ t('shareModal.title') }}</h3>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <!-- Screenshot Style Settings -->
            <div class="setting-group">
              <div class="setting-group-title-wrapper">
                <h4 class="setting-group-title">{{ t('shareModal.screenshotStyle') }}</h4>
              </div>
              <div class="toggle-switch">
                <span class="toggle-label">{{
                  screenshotStyle === 'student-preference'
                    ? t('shareModal.studentPreference')
                    : t('shareModal.giftRecommendation')
                }}</span>
                <input
                  id="screenshotStyleToggle"
                  type="checkbox"
                  :checked="screenshotStyle === 'student-preference'"
                  @change="toggleScreenshotStyle"
                />
                <label for="screenshotStyleToggle"></label>
              </div>
            </div>

            <!-- Screenshot Size Settings -->
            <div class="setting-group">
              <div class="setting-group-title-wrapper">
                <h4 class="setting-group-title">{{ t('shareModal.screenshotSize') }}</h4>
              </div>
              <div class="size-selector">
                <label>
                  <input
                    type="radio"
                    name="screenshotSize"
                    value="1"
                    :checked="screenshotSize == 1"
                    @change="updateScreenshotSize"
                  />
                  1x
                </label>
                <label>
                  <input
                    type="radio"
                    name="screenshotSize"
                    value="2"
                    :checked="screenshotSize == 2"
                    @change="updateScreenshotSize"
                  />
                  2x
                </label>
                <label>
                  <input
                    type="radio"
                    name="screenshotSize"
                    value="4"
                    :checked="screenshotSize == 4"
                    @change="updateScreenshotSize"
                  />
                  4x
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="download-button" @click="handleDownload">{{ t('shareModal.download') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { toRefs } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'

  const { t } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    screenshotStyle: { type: String, default: 'gift-recommendation' },
    screenshotSize: { type: [Number, String], default: 1 },
  })
  const emit = defineEmits(['close', 'downloadScreenshot', 'update:screenshotStyle', 'update:screenshotSize'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const toggleScreenshotStyle = (event) => {
    const newStyle = event.target.checked ? 'student-preference' : 'gift-recommendation'
    emit('update:screenshotStyle', newStyle)
  }

  const updateScreenshotSize = (event) => {
    emit('update:screenshotSize', event.target.value)
  }

  const handleDownload = () => {
    emit('downloadScreenshot')
    closeModal()
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

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .size-selector {
    display: flex;
    gap: 15px;
  }

  .size-selector label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-weight: 500;
  }

  .size-selector input[type='radio'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #ccc;
    border-radius: 50%;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dark-mode .size-selector input[type='radio'] {
    border-color: #2a4a6e;
  }

  .size-selector input[type='radio']:checked {
    background-color: #6495ed;
    border-color: #6495ed;
  }

  .dark-mode .size-selector input[type='radio']:checked {
    background-color: #00aeef;
    border-color: #00aeef;
  }

  .size-selector input[type='radio']:checked::before {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    margin: 2px;
    border-radius: 50%;
    background-color: white;
  }

  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .dark-mode .modal-footer {
    border-top-color: #2a4a6e;
  }

  .download-button {
    background-color: #6495ed;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .dark-mode .download-button {
    background-color: #00aeef;
  }

  .download-button:hover {
    background-color: #5a85d6;
  }

  .dark-mode .download-button:hover {
    background-color: #0098d4;
  }
</style>
