<template>
  <div class="faq-accordion-item">
    <button class="faq-question" @click="toggleAnswer">
      <span>{{ question }}</span>
      <i class="fa" :class="isOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
    </button>
    <div class="faq-answer" v-if="isOpen" :style="{ maxHeight: isOpen ? answerHeight + 'px' : '0' }">
      <p>{{ answer }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';

const props = defineProps({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
});

const isOpen = ref(false);
const answerHeight = ref(0);
const answerRef = ref<HTMLDivElement | null>(null);

// 切换答案显示/隐藏
const toggleAnswer = () => {
  isOpen.value = !isOpen.value;
};

// 计算答案高度用于动画
onMounted(() => {
  // 创建一个临时元素来计算高度
  const tempElement = document.createElement('div');
  tempElement.innerHTML = `<p>${props.answer}</p>`;
  tempElement.style.visibility = 'hidden';
  tempElement.style.position = 'absolute';
  tempElement.style.width = '100%';
  tempElement.style.fontSize = '0.9375rem';
  tempElement.style.lineHeight = '1.6';
  tempElement.style.color = '#94a3b8';
  
  document.body.appendChild(tempElement);
  answerHeight.value = tempElement.offsetHeight;
  document.body.removeChild(tempElement);
});
</script>

<style scoped>
.faq-accordion-item {
  background-color: #1e293b;
  border-radius: 0.5rem;
  border: 1px solid rgba(59, 130, 246, 0.1);
  overflow: hidden;
}

.faq-question {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.faq-question i {
  color: #94a3b8;
  transition: transform 0.3s ease;
}

.faq-answer {
  padding: 0 1.5rem;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-answer p {
  margin: 0;
  padding: 0 0 1rem 0;
  color: #94a3b8;
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* 打开状态 */
.faq-accordion-item:has(.faq-answer[style*="max-height: 0px"]) .faq-answer {
  padding: 0 1.5rem;
}
</style>
