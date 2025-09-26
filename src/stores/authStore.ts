<import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 从本地存储初始化登录状态
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  
  actions: {
    // 登录操作
    login(userData: any) {
      this.isLoggedIn = true;
      this.userInfo = userData;
      
      // 持久化存储
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userInfo', JSON.stringify(userData));
    },
    
    // 登出操作
    logout() {
      this.isLoggedIn = false;
      this.userInfo = null;
      
      // 清除存储
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userInfo');
    }
  }
});
