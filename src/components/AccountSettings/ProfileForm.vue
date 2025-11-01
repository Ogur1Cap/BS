<template>
  <SettingsCard 
    title="基本信息" 
    description="管理您的个人资料和公开信息"
  >
    <form class="profile-form" @submit.prevent="onSave">
      <!-- 头像上传 -->
      <div class="form-group avatar-group">
        <label class="form-label">头像</label>
        <div class="avatar-uploader">
          <div class="avatar-preview">
            <img :src="formData.avatar" alt="用户头像" class="avatar-img">
          </div>
          <div class="avatar-actions">
            <label class="upload-btn">
              <i class="fa fa-upload"></i>
              <span>上传新头像</span>
              <input 
                type="file" 
                class="avatar-input" 
                accept="image/*"
                @change="previewAvatar"
              >
            </label>
            <button 
              type="button" 
              class="reset-btn"
              @click="resetAvatar"
              :disabled="formData.avatar === originalAvatar"
            >
              <i class="fa fa-times"></i>
              <span>恢复原图</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 用户名 & 昵称 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">用户名 <span class="required">*</span></label>
          <input
            type="text"
            v-model="formData.username"
            class="form-input"
            :class="{ error: errors.username }"
            maxlength="20"
          >
          <p class="input-hint">3-20个字符，支持字母、数字和下划线</p>
          <p class="error-text" v-if="errors.username">{{ errors.username }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">昵称</label>
          <input
            type="text"
            v-model="formData.nickname"
            class="form-input"
            maxlength="16"
          >
          <p class="input-hint">最多16个字符，将显示在个人主页</p>
        </div>
      </div>

      <!-- 邮箱（不可修改） -->
      <div class="form-group">
        <label class="form-label">邮箱地址 <span class="required">*</span></label>
        <input
          type="email"
          v-model="formData.email"
          class="form-input"
          disabled
        >
        <p class="input-hint">邮箱用于登录和密码找回，如需修改请联系客服</p>
      </div>

      <!-- 个人简介 -->
      <div class="form-group">
        <label class="form-label">个人简介</label>
        <textarea
          v-model="formData.bio"
          class="form-textarea"
          rows="4"
          maxlength="150"
        ></textarea>
        <p class="input-hint">{{ formData.bio.length }}/150 字符</p>
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <button 
          type="button"
          class="btn cancel-btn"
          @click="onCancel"
          :disabled="isSaving"
        >
          取消
        </button>
        <button 
          type="submit"
          class="btn save-btn"
          :disabled="isSaving"
        >
          <i class="fa fa-spinner fa-spin" v-if="isSaving"></i>
          <span v-if="isSaving">保存中...</span>
          <span v-else>保存修改</span>
        </button>
      </div>
    </form>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue';
import SettingsCard from './SettingsCard.vue';

// 接收初始数据和状态
const props = defineProps({
  initialData: {
    type: Object,
    required: true,
    // 结构: { username, nickname, email, avatar, bio }
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

// 表单数据
const formData = reactive({ ...props.initialData });
const originalAvatar = ref(props.initialData.avatar); // 保存原始头像用于重置

// 错误信息
const errors = reactive({
  username: ''
});

// 事件发射
const emit = defineEmits<{
  (e: 'save'): void;
  (e: 'cancel'): void;
  (e: 'update:formData', data: typeof formData): void;
}>();

// 预览头像
const previewAvatar = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (event) => {
      formData.avatar = event.target?.result as string;
      emit('update:formData', formData);
    };
    reader.readAsDataURL(input.files[0]);
  }
};

// 重置头像
const resetAvatar = () => {
  formData.avatar = originalAvatar.value;
  emit('update:formData', formData);
};

// 保存回调
const onSave = () => {
  // 简单验证示例
  if (!formData.username.trim()) {
    errors.username = '用户名不能为空';
    return;
  }
  errors.username = '';
  emit('save');
};

// 取消回调
const onCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
/* 从原页面迁移个人信息表单样式 */
.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #f3f4f6;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #f3f4f6;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-textarea {
  resize: vertical;
}

.input-hint {
  margin: 0.5rem 0 0 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.error-text {
  margin: 0.5rem 0 0 0;
  color: #ef4444;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.cancel-btn {
  background-color: rgba(55, 65, 81, 0.3);
  color: #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background-color: rgba(55, 65, 81, 0.5);
  color: #f3f4f6;
}

/* 头像上传样式 */
.avatar-group {
  margin-bottom: 2rem;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.reset-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(55, 65, 81, 0.3);
  color: #d1d5db;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.reset-btn:hover:not(:disabled) {
  background-color: rgba(55, 65, 81, 0.5);
  color: #f3f4f6;
}

.avatar-input {
  display: none;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-row .form-group {
    min-width: 100%;
  }

  .avatar-uploader {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>