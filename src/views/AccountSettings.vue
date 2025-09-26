<template>
  <div class="account-settings-page">
    <!-- 头部导航 -->
    <Header 
      :current-user="userInfo" 
      :user-avatar="userInfo.avatar"
      @logout="handleLogout"
    />

    <!-- 主内容区 -->
    <main class="page-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">账户设置</h1>
          <p class="page-desc">管理您的个人信息、安全与通知偏好</p>
        </div>

        <!-- 选项卡导航 -->
        <div class="settings-tabs">
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <i class="fa fa-user"></i>
            <span>个人信息</span>
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'security' }"
            @click="activeTab = 'security'"
          >
            <i class="fa fa-lock"></i>
            <span>安全设置</span>
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'notification' }"
            @click="activeTab = 'notification'"
          >
            <i class="fa fa-bell"></i>
            <span>通知设置</span>
          </button>
        </div>

        <!-- 选项卡内容区 -->
        <div class="tabs-content">
          <!-- 1. 个人信息设置 -->
          <div class="tab-panel" v-if="activeTab === 'profile'">
            <div class="settings-card">
              <h2 class="card-title">基本信息</h2>
              
              <form class="profile-form" @submit.prevent="saveProfile">
                <!-- 头像上传 -->
                <div class="form-group avatar-group">
                  <label class="form-label">头像</label>
                  <div class="avatar-uploader">
                    <div class="avatar-preview">
                      <img :src="profileForm.avatar" alt="用户头像" class="avatar-img">
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
                        :disabled="profileForm.avatar === userInfo.avatar"
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
                      v-model="profileForm.username"
                      class="form-input"
                      :class="{ error: profileErrors.username }"
                      maxlength="20"
                    >
                    <p class="input-hint">3-20个字符，支持字母、数字和下划线</p>
                    <p class="error-text" v-if="profileErrors.username">{{ profileErrors.username }}</p>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">昵称</label>
                    <input
                      type="text"
                      v-model="profileForm.nickname"
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
                    v-model="profileForm.email"
                    class="form-input"
                    disabled
                  >
                  <p class="input-hint">邮箱用于登录和密码找回，如需修改请联系客服</p>
                </div>

                <!-- 个人简介 -->
                <div class="form-group">
                  <label class="form-label">个人简介</label>
                  <textarea
                    v-model="profileForm.bio"
                    class="form-textarea"
                    rows="4"
                    maxlength="150"
                  ></textarea>
                  <p class="input-hint">{{ profileForm.bio.length }}/150 字符</p>
                </div>

                <!-- 表单操作 -->
                <div class="form-actions">
                  <button 
                    type="button"
                    class="btn cancel-btn"
                    @click="resetProfileForm"
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
            </div>
          </div>

          <!-- 2. 安全设置 -->
          <div class="tab-panel" v-if="activeTab === 'security'">
            <!-- 密码修改 -->
            <div class="settings-card">
              <h2 class="card-title">密码管理</h2>
              
              <form class="password-form" @submit.prevent="changePassword">
                <div class="form-group">
                  <label class="form-label">当前密码 <span class="required">*</span></label>
                  <input
                    type="password"
                    v-model="passwordForm.currentPwd"
                    class="form-input"
                    :class="{ error: passwordErrors.currentPwd }"
                  >
                  <p class="error-text" v-if="passwordErrors.currentPwd">{{ passwordErrors.currentPwd }}</p>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">新密码 <span class="required">*</span></label>
                    <input
                      type="password"
                      v-model="passwordForm.newPwd"
                      class="form-input"
                      :class="{ error: passwordErrors.newPwd }"
                    >
                    <p class="input-hint">8-20个字符，需包含字母和数字</p>
                    <p class="error-text" v-if="passwordErrors.newPwd">{{ passwordErrors.newPwd }}</p>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">确认新密码 <span class="required">*</span></label>
                    <input
                      type="password"
                      v-model="passwordForm.confirmPwd"
                      class="form-input"
                      :class="{ error: passwordErrors.confirmPwd }"
                    >
                    <p class="error-text" v-if="passwordErrors.confirmPwd">{{ passwordErrors.confirmPwd }}</p>
                  </div>
                </div>

                <div class="form-actions">
                  <button 
                    type="button"
                    class="btn cancel-btn"
                    @click="resetPasswordForm"
                    :disabled="isChangingPwd"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    class="btn save-btn"
                    :disabled="isChangingPwd"
                  >
                    <i class="fa fa-spinner fa-spin" v-if="isChangingPwd"></i>
                    <span v-if="isChangingPwd">修改中...</span>
                    <span v-else>确认修改</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- 手机绑定 -->
            <div class="settings-card">
              <h2 class="card-title">手机绑定</h2>
              
              <!-- 未绑定状态 -->
              <div class="phone-bind-form" v-if="!securityInfo.phone">
                <form @submit.prevent="bindPhone">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">手机号码 <span class="required">*</span></label>
                      <input
                        type="tel"
                        v-model="phoneForm.phone"
                        class="form-input"
                        :class="{ error: phoneErrors.phone }"
                        placeholder="请输入11位手机号"
                      >
                      <p class="error-text" v-if="phoneErrors.phone">{{ phoneErrors.phone }}</p>
                    </div>
                    
                    <div class="form-group code-group">
                      <label class="form-label">短信验证码 <span class="required">*</span></label>
                      <div class="code-input-wrap">
                        <input
                          type="text"
                          v-model="phoneForm.code"
                          class="form-input"
                          :class="{ error: phoneErrors.code }"
                          placeholder="请输入6位验证码"
                        >
                        <button 
                          type="button"
                          class="get-code-btn"
                          @click="sendCode"
                          :disabled="isSendingCode || countdown > 0"
                        >
                          <span v-if="countdown === 0">获取验证码</span>
                          <span v-if="countdown > 0">{{ countdown }}s后重发</span>
                        </button>
                      </div>
                      <p class="error-text" v-if="phoneErrors.code">{{ phoneErrors.code }}</p>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    class="btn bind-btn"
                    :disabled="isBindingPhone"
                  >
                    <i class="fa fa-spinner fa-spin" v-if="isBindingPhone"></i>
                    <span v-if="isBindingPhone">绑定中...</span>
                    <span v-else>确认绑定</span>
                  </button>
                </form>
              </div>

              <!-- 已绑定状态 -->
              <div class="phone-bound-info" v-if="securityInfo.phone">
                <div class="bound-detail">
                  <p>当前绑定手机号：<span class="phone-masked">{{ maskPhone(securityInfo.phone) }}</span></p>
                  <p class="info-hint">绑定手机可提升账号安全性，用于登录验证和密码找回</p>
                </div>
                <button 
                  class="btn change-btn"
                  @click="showChangePhone = true"
                  :disabled="isChangingPhone"
                >
                  <i class="fa fa-edit"></i>
                  <span>更换绑定</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 3. 通知设置 -->
          <div class="tab-panel" v-if="activeTab === 'notification'">
            <div class="settings-card">
              <h2 class="card-title">通知渠道</h2>
              <div class="notify-channels">
                <div class="channel-item">
                  <label class="channel-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.channels.app"
                      class="channel-checkbox"
                    >
                    <span class="channel-name">应用内通知</span>
                  </label>
                  <p class="channel-desc">在应用内接收所有通知（订单、消息、系统通知等）</p>
                </div>
                
                <div class="channel-item">
                  <label class="channel-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.channels.email"
                      class="channel-checkbox"
                      :disabled="!userInfo.email"
                    >
                    <span class="channel-name">邮件通知</span>
                  </label>
                  <p class="channel-desc">通过邮箱接收重要通知（如订单状态变更、账号安全提醒）</p>
                  <p class="channel-disabled" v-if="!userInfo.email">需先完善邮箱信息才能开启</p>
                </div>
                
                <div class="channel-item">
                  <label class="channel-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.channels.sms"
                      class="channel-checkbox"
                      :disabled="!securityInfo.phone"
                    >
                    <span class="channel-name">短信通知</span>
                  </label>
                  <p class="channel-desc">通过短信接收紧急通知（如账号登录提醒、订单确认）</p>
                  <p class="channel-disabled" v-if="!securityInfo.phone">需先绑定手机号才能开启</p>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h2 class="card-title">通知类型</h2>
              <div class="notify-types">
                <div class="type-item">
                  <label class="type-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.types.order"
                      class="type-checkbox"
                    >
                    <span class="type-name">订单通知</span>
                  </label>
                  <p class="type-desc">订单状态变更（接单、完成、取消）、支付提醒等</p>
                </div>
                
                <div class="type-item">
                  <label class="type-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.types.message"
                      class="type-checkbox"
                    >
                    <span class="type-name">消息通知</span>
                  </label>
                  <p class="type-desc">收到新消息、回复提醒、好友请求等</p>
                </div>
                
                <div class="type-item">
                  <label class="type-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.types.promotion"
                      class="type-checkbox"
                    >
                    <span class="type-name">活动通知</span>
                  </label>
                  <p class="type-desc">平台优惠活动、新功能上线、节日福利等</p>
                </div>
                
                <div class="type-item">
                  <label class="type-label">
                    <input 
                      type="checkbox" 
                      v-model="notifySettings.types.security"
                      class="type-checkbox"
                      disabled
                    >
                    <span class="type-name">安全通知</span>
                  </label>
                  <p class="type-desc">账号登录、密码修改、设备绑定等安全相关提醒（默认开启，不可关闭）</p>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  class="btn save-btn"
                  @click="saveNotifySettings"
                  :disabled="isSavingNotify"
                >
                  <i class="fa fa-spinner fa-spin" v-if="isSavingNotify"></i>
                  <span v-if="isSavingNotify">保存中...</span>
                  <span v-else>保存通知设置</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 注销账号弹窗 -->
    <div class="modal-backdrop" v-if="showDeleteModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">确认注销账号</h3>
          <button class="close-modal" @click="showDeleteModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <p class="warning-text">
            注销账号后，您的所有数据（个人信息、订单记录、消息历史）将在30天后永久删除，且无法恢复！
          </p>
          <div class="verify-delete">
            <label class="verify-label">
              请输入 "<span class="verify-text">确认注销</span>" 以继续
            </label>
            <input
              type="text"
              v-model="deleteVerifyText"
              class="verify-input"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn cancel-btn" @click="showDeleteModal = false">
            取消
          </button>
          <button 
            class="btn delete-btn"
            @click="confirmDeleteAccount"
            :disabled="deleteVerifyText !== '确认注销' || isDeleting"
          >
            <i class="fa fa-spinner fa-spin" v-if="isDeleting"></i>
            <span v-if="isDeleting">处理中...</span>
            <span v-else>确认注销</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="toast" :class="toast.type" v-if="toast.show">
      <i :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
    </div>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';

// 路由实例
const router = useRouter();

// 活跃选项卡
const activeTab = ref('profile'); // profile/security/notification

// 模拟基础用户信息
const userInfo = ref({
  username: 'delta_player_01',
  nickname: '三角洲精英',
  email: 'player01@example.com',
  avatar: 'https://picsum.photos/id/237/200/200',
  bio: '热爱射击游戏，擅长团队协作，追求高效护航服务'
});

// 模拟安全设置数据
const securityInfo = ref({
  phone: '13800138000', // 已绑定手机号（模拟）
  passwordUpdatedAt: '2023-09-15'
});

// 模拟通知设置数据
const notifySettings = ref({
  channels: {
    app: true,    // 应用内通知
    email: true,  // 邮件通知
    sms: false    // 短信通知
  },
  types: {
    order: true,      // 订单通知
    message: true,    // 消息通知
    promotion: false, // 活动通知
    security: true    // 安全通知（默认开启）
  }
});

// 加载/处理状态
const isSaving = ref(false);          // 个人信息保存中
const isChangingPwd = ref(false);     // 密码修改中
const isSendingCode = ref(false);     // 验证码发送中
const isBindingPhone = ref(false);    // 手机绑定中
const isChangingPhone = ref(false);   // 更换手机中
const isSavingNotify = ref(false);    // 通知设置保存中
const isDeleting = ref(false);        // 注销账号中

// 倒计时（验证码）
const countdown = ref(0);

// 弹窗状态
const showChangePhone = ref(false);   // 显示更换手机号表单
const showDeleteModal = ref(false);   // 显示注销账号弹窗

// 表单数据 - 个人信息
const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: '',
  bio: ''
});

// 表单数据 - 密码修改
const passwordForm = reactive({
  currentPwd: '',
  newPwd: '',
  confirmPwd: ''
});

// 表单数据 - 手机绑定
const phoneForm = reactive({
  phone: '',
  code: ''
});

// 注销账号验证文本
const deleteVerifyText = ref('');

// 错误信息
const profileErrors = reactive({
  username: ''
});

const passwordErrors = reactive({
  currentPwd: '',
  newPwd: '',
  confirmPwd: ''
});

const phoneErrors = reactive({
  phone: '',
  code: ''
});

// 提示消息
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
  icon: 'fa-check-circle'
});

// 初始化表单数据
const initFormData = () => {
  // 初始化个人信息表单
  profileForm.username = userInfo.value.username;
  profileForm.nickname = userInfo.value.nickname;
  profileForm.email = userInfo.value.email;
  profileForm.avatar = userInfo.value.avatar;
  profileForm.bio = userInfo.value.bio;

  // 检查用户登录状态（模拟）
  const hasLogin = !!localStorage.getItem('delta_user');
  if (!hasLogin) {
    router.push('/login');
  }
};

// 显示提示消息
const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = {
    show: true,
    message,
    type,
    icon: type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
  };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// 1. 个人信息相关方法
// 预览头像
const previewAvatar = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件（JPG/PNG）', 'error');
      return;
    }
    // 验证文件大小（5MB以内）
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过5MB', 'error');
      return;
    }
    // 预览图片
    const reader = new FileReader();
    reader.onload = (event) => {
      profileForm.avatar = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// 重置头像
const resetAvatar = () => {
  profileForm.avatar = userInfo.value.avatar;
};

// 验证个人信息表单
const validateProfileForm = (): boolean => {
  let isValid = true;
  const usernameReg = /^[a-zA-Z0-9_]{3,20}$/;

  // 重置错误
  profileErrors.username = '';

  // 验证用户名
  if (!profileForm.username.trim()) {
    profileErrors.username = '请输入用户名';
    isValid = false;
  } else if (!usernameReg.test(profileForm.username)) {
    profileErrors.username = '用户名需为3-20个字符，支持字母、数字和下划线';
    isValid = false;
  }

  return isValid;
};

// 保存个人信息
const saveProfile = async () => {
  if (!validateProfileForm()) return;

  try {
    isSaving.value = true;
    // 模拟接口请求延迟
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 更新用户信息（模拟保存成功）
    userInfo.value.username = profileForm.username;
    userInfo.value.nickname = profileForm.nickname;
    userInfo.value.avatar = profileForm.avatar;
    userInfo.value.bio = profileForm.bio;

    // 更新本地存储（模拟）
    localStorage.setItem('delta_user', JSON.stringify(userInfo.value));

    showToast('个人信息保存成功', 'success');
  } catch (error) {
    showToast('保存失败，请稍后重试', 'error');
  } finally {
    isSaving.value = false;
  }
};

// 重置个人信息表单
const resetProfileForm = () => {
  profileForm.username = userInfo.value.username;
  profileForm.nickname = userInfo.value.nickname;
  profileForm.bio = userInfo.value.bio;
  profileForm.avatar = userInfo.value.avatar;
  // 重置错误
  profileErrors.username = '';
};

// 2. 安全设置相关方法
// 验证密码表单
const validatePasswordForm = (): boolean => {
  let isValid = true;
  const pwdReg = /^(?=.*[A-Za-z])(?=.*\d).{8,20}$/;

  // 重置错误
  passwordErrors.currentPwd = '';
  passwordErrors.newPwd = '';
  passwordErrors.confirmPwd = '';

  // 验证当前密码（模拟：当前密码固定为123456Aa）
  if (!passwordForm.currentPwd) {
    passwordErrors.currentPwd = '请输入当前密码';
    isValid = false;
  } else if (passwordForm.currentPwd !== '123456Aa') {
    passwordErrors.currentPwd = '当前密码输入错误';
    isValid = false;
  }

  // 验证新密码
  if (!passwordForm.newPwd) {
    passwordErrors.newPwd = '请输入新密码';
    isValid = false;
  } else if (!pwdReg.test(passwordForm.newPwd)) {
    passwordErrors.newPwd = '新密码需为8-20个字符，且包含字母和数字';
    isValid = false;
  }

  // 验证确认密码
  if (!passwordForm.confirmPwd) {
    passwordErrors.confirmPwd = '请确认新密码';
    isValid = false;
  } else if (passwordForm.confirmPwd !== passwordForm.newPwd) {
    passwordErrors.confirmPwd = '两次输入的密码不一致';
    isValid = false;
  }

  return isValid;
};

// 修改密码
const changePassword = async () => {
  if (!validatePasswordForm()) return;

  try {
    isChangingPwd.value = true;
    // 模拟接口请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟修改成功（更新密码更新时间）
    securityInfo.value.passwordUpdatedAt = new Date().toISOString().split('T')[0];

    // 重置表单
    resetPasswordForm();

    showToast('密码修改成功，请重新登录', 'success');
    // 2秒后跳转登录页（模拟）
    setTimeout(() => {
      handleLogout();
    }, 2000);
  } catch (error) {
    showToast('修改失败，请稍后重试', 'error');
  } finally {
    isChangingPwd.value = false;
  }
};

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.currentPwd = '';
  passwordForm.newPwd = '';
  passwordForm.confirmPwd = '';
  // 重置错误
  passwordErrors.currentPwd = '';
  passwordErrors.newPwd = '';
  passwordErrors.confirmPwd = '';
};

// 发送验证码（模拟）
const sendCode = async () => {
  // 验证手机号
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneForm.phone) {
    phoneErrors.phone = '请输入手机号码';
    return;
  } else if (!phoneReg.test(phoneForm.phone)) {
    phoneErrors.phone = '请输入有效的11位手机号';
    return;
  }

  try {
    isSendingCode.value = true;
    phoneErrors.phone = '';
    // 模拟接口请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟发送成功，启动倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    showToast('验证码已发送至您的手机', 'success');
  } catch (error) {
    showToast('发送失败，请稍后重试', 'error');
  } finally {
    isSendingCode.value = false;
  }
};

// 验证手机绑定表单
const validatePhoneForm = (): boolean => {
  let isValid = true;
  const phoneReg = /^1[3-9]\d{9}$/;
  const codeReg = /^\d{6}$/;

  // 重置错误
  phoneErrors.phone = '';
  phoneErrors.code = '';

  // 验证手机号
  if (!phoneForm.phone) {
    phoneErrors.phone = '请输入手机号码';
    isValid = false;
  } else if (!phoneReg.test(phoneForm.phone)) {
    phoneErrors.phone = '请输入有效的11位手机号';
    isValid = false;
  }

  // 验证验证码（模拟：验证码固定为123456）
  if (!phoneForm.code) {
    phoneErrors.code = '请输入验证码';
    isValid = false;
  } else if (!codeReg.test(phoneForm.code)) {
    phoneErrors.code = '验证码需为6位数字';
    isValid = false;
  } else if (phoneForm.code !== '123456') {
    phoneErrors.code = '验证码输入错误';
    isValid = false;
  }

  return isValid;
};

// 绑定手机号
const bindPhone = async () => {
  if (!validatePhoneForm()) return;

  try {
    isBindingPhone.value = true;
    // 模拟接口请求延迟
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 模拟绑定成功
    securityInfo.value.phone = phoneForm.phone;
    showChangePhone.value = false;

    // 重置表单
    phoneForm.phone = '';
    phoneForm.code = '';
    countdown.value = 0;

    showToast('手机号绑定成功', 'success');
  } catch (error) {
    showToast('绑定失败，请稍后重试', 'error');
  } finally {
    isBindingPhone.value = false;
  }
};

// 手机号掩码（中间4位隐藏）
const maskPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1****$3');
};

// 3. 通知设置相关方法
// 保存通知设置
const saveNotifySettings = async () => {
  try {
    isSavingNotify.value = true;
    // 模拟接口请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟保存成功（无需修改数据，表单已双向绑定）
    showToast('通知设置保存成功', 'success');
  } catch (error) {
    showToast('保存失败，请稍后重试', 'error');
  } finally {
    isSavingNotify.value = false;
  }
};

// 4. 账号注销相关方法
// 确认注销账号
const confirmDeleteAccount = async () => {
  try {
    isDeleting.value = true;
    // 模拟接口请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟注销成功（清除本地存储）
    localStorage.removeItem('delta_token');
    localStorage.removeItem('delta_user');
    sessionStorage.removeItem('delta_token');
    sessionStorage.removeItem('delta_user');

    showToast('账号注销申请已提交，30天后将永久删除', 'success');
    // 2秒后跳转登录页
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    showToast('注销失败，请稍后重试', 'error');
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
    deleteVerifyText.value = '';
  }
};

// 处理登出
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  router.push('/login');
};

// 页面加载初始化
onMounted(() => {
  initFormData();
});
</script>

<style scoped>
/* 基础样式 */
.account-settings-page {
  min-height: 100vh;
  background-color: #111827;
  color: #f3f4f6;
}

.page-content {
  padding: 2rem 0 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面标题 */
.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.page-desc {
  margin: 0;
  color: #9ca3af;
  font-size: 0.9375rem;
}

/* 选项卡导航 */
.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
  padding-bottom: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.settings-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover:not(.active) {
  color: #f3f4f6;
  background-color: rgba(55, 65, 81, 0.2);
}

.tab-btn.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  border-bottom: 2px solid #3b82f6;
}

.tab-btn i {
  font-size: 1rem;
}

/* 选项卡内容区 */
.tabs-content {
  background-color: #1f2937;
  border-radius: 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  padding: 2rem;
}

/* 设置卡片 */
.settings-card {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.settings-card:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
}

.card-title::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-right: 0.75rem;
}

/* 表单基础样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #d1d5db;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(17, 24, 37, 0.5);
  border: 1px solid #374151;
  border-radius: 0.5rem;
  color: #f3f4f6;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
}

.form-input.error:focus,
.form-textarea.error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row .form-group {
  flex: 1;
  min-width: 250px;
  margin-bottom: 0;
}

.input-hint {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.75rem;
}

.error-text {
  margin: 0.25rem 0 0 0;
  color: #ef4444;
  font-size: 0.75rem;
}

/* 按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
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
}

.cancel-btn {
  background-color: rgba(55, 65, 81, 0.3);
  color: #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background-color: rgba(55, 65, 81, 0.5);
  color: #f3f4f6;
}

.bind-btn,
.change-btn {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.bind-btn:hover:not(:disabled),
.change-btn:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 1. 个人信息样式 */
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
}

.reset-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(55, 65, 81, 0.3);
  color: #d1d5db;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

.avatar-input {
  display: none;
}

/* 2. 安全设置样式 */
.code-group .code-input-wrap {
  display: flex;
  gap: 0.5rem;
}

.code-group .form-input {
  flex: 1;
}

.get-code-btn {
  padding: 0 1rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  white-space: nowrap;
}

.get-code-btn:disabled {
  background-color: rgba(55, 65, 81, 0.2);
  color: #6b7280;
  border-color: rgba(55, 65, 81, 0.5);
}

.phone-bound-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: rgba(17, 24, 37, 0.5);
  border-radius: 0.75rem;
}

.bound-detail {
  flex: 1;
}

.phone-masked {
  color: #3b82f6;
  font-weight: 500;
}

.info-hint {
  margin: 0.5rem 0 0 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 3. 通知设置样式 */
.notify-channels,
.notify-types {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.channel-item,
.type-item {
  padding: 1rem 0;
  border-bottom: 1px solid rgba(55, 65, 81, 0.2);
}

.channel-item:last-child,
.type-item:last-child {
  border-bottom: none;
}

.channel-label,
.type-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.channel-checkbox,
.type-checkbox {
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.channel-name,
.type-name {
  font-weight: 500;
  color: #f3f4f6;
}

.channel-desc,
.type-desc {
  margin: 0.5rem 0 0 1.75rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.channel-disabled {
  margin: 0.5rem 0 0 1.75rem;
  color: #f59e0b;
  font-size: 0.875rem;
}

.type-checkbox:disabled {
  accent-color: #6b7280;
  cursor: not-allowed;
}

/* 注销账号弹窗 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background-color: #1f2937;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(55, 65, 81, 0.5);
  animation: scaleIn 0.3s ease;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-modal {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background-color: rgba(55, 65, 81, 0.3);
  color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.warning-icon {
  text-align: center;
  margin-bottom: 1rem;
}

.warning-icon i {
  font-size: 2.5rem;
  color: #f59e0b;
}

.warning-text {
  margin: 0 0 1.5rem 0;
  color: #d1d5db;
  line-height: 1.5;
  text-align: center;
}

.verify-delete {
  margin-top: 1.5rem;
}

.verify-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #d1d5db;
  font-size: 0.875rem;
}

.verify-text {
  color: #ef4444;
  font-weight: 600;
}

.verify-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(17, 24, 37, 0.5);
  border: 1px solid #374151;
  border-radius: 0.5rem;
  color: #f3f4f6;
}

.verify-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 提示消息 */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  animation: fadeInUp 0.3s ease forwards;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.toast.success {
  background-color: #10b981;
}

.toast.error {
  background-color: #ef4444;
}

.toast i {
  font-size: 1.25rem;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .tabs-content {
    padding: 1.5rem 1rem;
  }

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

  .phone-bound-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
