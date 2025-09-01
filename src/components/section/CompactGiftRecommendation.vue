<template>
  <div class="compact-gift-row">
    <div class="compact-gift-island" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
      <ImageWithLoader
        :src="getGiftUrl(gift.id, gift.isSsr)"
        class="compact-gift-icon"
        object-fit="contain"
        loader-type="pulse"
      />
    </div>
    <div class="compact-recommendation-island">
      <div class="compact-rec-type" :class="gift.analysis.class">{{ t(gift.analysis.typeTextKey) }}</div>
      <div class="compact-character-avatars">
        <div
          v-for="char in gift.analysis.characters"
          :key="char.id"
          class="compact-character-avatar"
          :class="{ 'sub-optimal': !char.isOptimal }"
        >
          <ImageWithLoader :src="getAvatarUrl(char.id)" class="compact-character-avatar-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import { useI18n } from '@composables/useI18n.js'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  const { t } = useI18n()

  defineProps({
    gift: Object,
  })
</script>

<style scoped>
  .compact-gift-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .compact-gift-island {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }
  .gift-yellow {
    background: linear-gradient(45deg, #a97d51, #c7a579);
  }
  .gift-purple {
    background: linear-gradient(45deg, #7a5bbe, #9e82d6);
  }
  .compact-gift-icon {
    width: 90%;
    height: 90%;
    border-radius: 50%;
  }
  .compact-recommendation-island {
    flex: 1;
    background: #fff;
    border-radius: 15px;
    padding: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dark-mode .compact-recommendation-island {
    background: #2c3e50;
  }
  .compact-character-avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .compact-character-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  .compact-character-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .compact-character-avatar :deep(.compact-character-avatar-img img) {
    border-radius: 50%;
    border: 2px solid #6495ed;
  }
  .sub-optimal :deep(.compact-character-avatar-img img) {
    opacity: 0.75;
    border: 2px dashed #ccc !important;
    filter: none;
  }
  .dark-mode .compact-character-avatar :deep(.compact-character-avatar-img img) {
    border: 2px solid #00aeef;
  }
  .compact-rec-type {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
  }
  .rec-extra {
    background: #fce4ec;
    color: #c2185b;
  }
  .rec-best {
    background: #d4edda;
    color: #155724;
  }
  .rec-good {
    background: #fff3cd;
    color: #856404;
  }
  .rec-any {
    background: #d1ecf1;
    color: #0c5460;
  }
</style>