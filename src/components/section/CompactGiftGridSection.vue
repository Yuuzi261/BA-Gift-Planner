<template>
  <div v-if="gifts && gifts.length > 0" class="compact-gift-grid-section">
    <div class="compact-gift-grid-title">{{ title }}</div>
    <div class="compact-gift-grid-items">
      <div
        v-for="gift in gifts"
        :key="gift.id"
        class="compact-gift-grid-item"
        :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'"
      >
        <ImageWithLoader
          :src="getGiftUrl(gift.id, gift.isSsr)"
          class="compact-gift-icon"
          object-fit="contain"
          loader-type="pulse"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  defineProps({
    title: String,
    gifts: Array,
  })
</script>

<style scoped>
  .compact-gift-grid-section {
    margin-top: 20px;
    background: #fff;
    border-radius: 15px;
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  .dark-mode .compact-gift-grid-section {
    background: #2c3e50;
  }
  .compact-gift-grid-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
    text-align: center;
  }
  .dark-mode .compact-gift-grid-title {
    color: #e0e6ed;
  }
  .compact-gift-grid-items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .compact-gift-grid-item {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
</style>
