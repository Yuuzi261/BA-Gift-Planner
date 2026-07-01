<template>
  <BaseModal :is-visible="isOpen" :show-close-button="false" class="migration-modal">
    <template #body>
      <div class="migration-content">
        <h2>{{ t('migration.title') }}</h2>
        <p>
          {{ t('migration.description1') }}<br />
          {{ t('migration.description2') }}
        </p>

        <div class="migration-box">
          <h3>{{ t('migration.newUrlTitle') }}</h3>
          <a href="https://ba-gift-planner.ba-tools.cc" target="_blank" class="new-url">
            https://ba-gift-planner.ba-tools.cc
          </a>
        </div>

        <p class="instruction">
          <strong>{{ t('migration.stepsTitle') }}</strong
          ><br />
          {{ t('migration.step1') }}<br />
          {{ t('migration.step2') }}<br />
          {{ t('migration.step3') }}
        </p>

        <div class="action-buttons">
          <button class="btn-skew btn-text btn-yellow" @click="handleExport">
            <span>{{ t('migration.exportBtn') }}</span>
          </button>
          <a
            href="https://ba-gift-planner.ba-tools.cc"
            target="_blank"
            class="btn-skew btn-text btn-blue"
            style="text-decoration: none"
          >
            <span>{{ t('migration.goToNewBtn') }}</span>
          </a>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import BaseModal from '@components/ui/BaseModal.vue'
  import { generateExportFile } from '@/utils/saveManager'
  import { useToast } from '@/composables/useToast'
  import { useI18n } from '@/composables/useI18n'

  const { t } = useI18n()
  const { addToast } = useToast()

  // Initialize to false and set to true onMounted to trigger BaseModal's useModal watch
  const isOpen = ref(false)

  onMounted(() => {
    // A small delay ensures the transition works and the watch is triggered
    setTimeout(() => {
      isOpen.value = true
    }, 50)
  })

  const handleExport = () => {
    try {
      generateExportFile()
      addToast(t('migration.exportSuccess'), 'success')
    } catch (e) {
      console.error(e)
      addToast(t('migration.exportFailed'), 'error')
    }
  }
</script>

<style scoped>
  .migration-content {
    padding: 20px;
    text-align: center;
    color: #2c3e50;
  }
  .dark-mode .migration-content {
    color: #e0e6ed;
  }

  .migration-content h2 {
    color: #dc3545;
    margin-bottom: 16px;
  }
  .dark-mode .migration-content h2 {
    color: #ff6b6b;
  }

  .migration-content p {
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 1.05rem;
  }

  .migration-box {
    background-color: #f8f9fa;
    border: 2px dashed #4285f4;
    border-radius: 8px;
    padding: 16px;
    margin: 24px 0;
  }
  .dark-mode .migration-box {
    background-color: #2a3441;
    border-color: #6ea8fe;
  }

  .new-url {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4285f4;
    text-decoration: none;
    word-break: break-all;
  }
  .dark-mode .new-url {
    color: #6ea8fe;
  }

  .instruction {
    text-align: left;
    background-color: #fff3cd;
    padding: 16px;
    border-radius: 8px;
    color: #856404;
  }
  .dark-mode .instruction {
    background-color: #4d4020;
    color: #ffda6a;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    flex-wrap: wrap;
  }
</style>
