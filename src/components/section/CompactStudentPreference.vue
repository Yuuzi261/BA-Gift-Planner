<template>
  <div class="compact-student-row">
    <div class="compact-student-island">
      <ImageWithLoader :src="getAvatarUrl(student.id)" class="compact-student-avatar-img" />
    </div>
    <div class="compact-recommendation-island">
      <div class="compact-gift-grid">
        <div
          v-for="gift in student.gifts"
          :key="gift.id"
          v-tooltip:fav-gift-tooltip="gift.name"
          class="compact-gift-grid-item"
          :class="[gift.isSsr ? 'gift-purple' : 'gift-yellow', { 'non-recommended': !gift.isRecommended }]"
        >
          <ImageWithLoader
            :src="getGiftUrl(gift.id, gift.isSsr)"
            class="compact-gift-icon"
            object-fit="contain"
            loader-type="pulse"
          />
          <div class="bond-xp-capsule">
            <div class="tooltip-wrapper">
              <ImageWithLoader
                :src="getInteractionUrl(getInteractionLevel(gift, student))"
                class="interaction-icon"
                object-fit="contain"
                loader-type="pulse"
              />
              <span class="tooltip-text">{{ getPreferenceValue(student, gift) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import { getInteractionUrl } from '@utils/getInteractionUrl'
  import { getPreferenceValue } from '@utils/getPreferenceValue'
  import { getInteractionLevel } from '@utils/getInteractionLevel'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  defineProps({
    student: Object,
  })
</script>

<style scoped>
  .compact-student-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .compact-student-island {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .compact-student-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #6495ed;
  }
  .dark-mode .compact-student-avatar-img {
    border: 2px solid #00aeef;
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
  .compact-gift-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 15px 10px;
    justify-content: flex-start;
  }
  .compact-gift-grid-item {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  .non-recommended {
    opacity: 0.4;
    filter: grayscale(50%);
  }
  .compact-gift-grid-item:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .gift-yellow {
    background: linear-gradient(45deg, #a97d51, #c7a579);
  }
  .gift-purple {
    background: linear-gradient(45deg, #7a5bbe, #9e82d6);
  }
  .compact-gift-icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .bond-xp-capsule {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: #212529;
    color: white;
    border-radius: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  .dark-mode .bond-xp-capsule {
    background: #dee2e6;
    color: #201e2e;
  }
  .tooltip-wrapper {
    display: inline-flex;
    align-items: center;
    padding: 2px 3px;
    gap: 3px;
  }
  .interaction-icon {
    width: 18px;
    height: 18px;
  }
  .tooltip-text {
    font-style: italic;
    padding-right: 3px;
  }
</style>
