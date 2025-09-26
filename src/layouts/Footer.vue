<template>
  <footer class="main-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="brand-logo">
            <i class="fa fa-shield"></i>
            <span class="logo-text">三角洲行动俱乐部</span>
          </div>
          <p class="brand-desc">专业的游戏护航服务平台，为玩家提供安全、高效的游戏体验提升服务</p>
          <!-- 新增品牌区域装饰线 -->
          <div class="brand-divider"></div>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h3 class="link-title">服务支持</h3>
            <ul class="link-list">
              <li><router-link to="/services">服务介绍</router-link></li>
              <li><router-link to="/prices">价格表</router-link></li>
              <li><router-link to="/faq">常见问题</router-link></li>
              <li><router-link to="/customer-service">联系客服</router-link></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h3 class="link-title">关于我们</h3>
            <ul class="link-list">
              <li><router-link to="/about">平台介绍</router-link></li>
              <li><router-link to="/recruit">打手招募</router-link></li>
              <li><router-link to="/terms">服务条款</router-link></li>
              <li><router-link to="/privacy">隐私政策</router-link></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h3 class="link-title">关注我们</h3>
            <ul class="link-list social-links">
              <li><a href="#" class="social-link"><i class="fa fa-weixin"></i> 微信公众号</a></li>
              <li><a href="#" class="social-link"><i class="fa fa-qq"></i> QQ群</a></li>
              <li><a href="#" class="social-link"><i class="fa fa-weibo"></i> 新浪微博</a></li>
              <li><a href="#" class="social-link"><i class="fa fa-youtube"></i> YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© 2023 三角洲行动俱乐部 版权所有 | 本服务仅供娱乐，请勿沉迷游戏</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 页脚组件逻辑
</script>

<style scoped>
/* 页脚基础样式 */
.main-footer {
  background: linear-gradient(180deg, #111827 0%, #0f172a 100%); /* 渐变背景增强质感 */
  border-top: 1px solid rgba(55, 65, 81, 0.5); /* 加深边框透明度 */
  padding: 4rem 0 2rem; /* 增加上下内边距，更舒展 */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1); /* 顶部阴影增加层次感 */
}

.container {
  max-width: 1200px; /* 限制最大宽度，避免大屏拉伸 */
  margin: 0 auto;
  padding: 0 1.5rem; /* 左右内边距，适配小屏 */
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 3rem; /* 增大间距 */
  margin-bottom: 3rem;
}

/* 响应式布局优化 */
@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
  }
  
  .footer-brand {
    flex: 1;
    padding-right: 2rem; /* 增加与链接区的距离 */
  }
  
  .footer-links {
    flex: 2;
    display: flex;
    gap: 4rem; /* 增大链接组间距 */
    justify-content: space-between; /* 均匀分布链接组 */
  }
}

/* 品牌区域样式 */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 图标与文字间距 */
  margin-bottom: 1.25rem;
}

.brand-logo i {
  color: #3b82f6; /* 图标蓝色突出 */
  font-size: 1.8rem; /* 增大图标 */
  transition: transform 0.3s ease;
}

.brand-logo:hover i {
  transform: scale(1.1); /* 图标hover缩放效果 */
}

.logo-text {
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 700; /* 加粗品牌名 */
}

.brand-desc {
  color: #9ca3af;
  margin-top: 0; /* 移除默认margin-top */
  max-width: 300px;
  line-height: 1.6; /* 增加行高，提升可读性 */
}

/* 新增品牌区域装饰线 */
.brand-divider {
  width: 60px;
  height: 2px;
  background-color: #3b82f6;
  margin-top: 1.5rem;
}

/* 链接组样式 */
.link-group {
  margin-bottom: 2.5rem; /* 增大底部间距 */
}

.link-title {
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  position: relative;
  padding-bottom: 0.5rem;
}

/* 标题下划线装饰 */
.link-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 2px;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.link-title:hover::after {
  width: 45px; /* 标题hover下划线变长 */
}

.link-list {
  list-style: none;
  padding: 0; /* 清除默认内边距 */
}

.link-list li {
  margin-bottom: 0.75rem; /* 增大列表项间距 */
}

.link-list a {
  color: #9ca3af;
  text-decoration: none;
  transition: all 0.3s ease; /* 统一过渡效果 */
  position: relative;
  padding-left: 0.25rem;
}

/* 链接hover效果优化 */
.link-list a:hover {
  color: #3b82f6;
  padding-left: 0.5rem; /* 轻微左移效果 */
}

/* 社交链接样式增强 */
.social-links a {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 增大图标与文字间距 */
}

.social-links i {
  width: 1.5rem; /* 增大图标容器 */
  height: 1.5rem;
  line-height: 1.5rem;
  text-align: center;
  border-radius: 50%; /* 圆形背景 */
  background-color: rgba(59, 130, 246, 0.1); /* 半透明蓝色背景 */
  color: #3b82f6;
  transition: all 0.3s ease;
}

.social-links a:hover i {
  background-color: #3b82f6;
  color: white; /* 图标背景色反转 */
  transform: translateY(-2px); /* 轻微上移 */
}

/* 底部版权区域 */
.footer-bottom {
  padding-top: 2rem; /* 增大顶部内边距 */
  border-top: 1px solid rgba(55, 65, 81, 0.5);
}

.copyright {
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
  line-height: 1.6;
  letter-spacing: 0.3px; /* 轻微字间距，提升可读性 */
}

/* 小屏幕适配优化 */
@media (max-width: 767px) {
  .footer-links {
    flex-direction: column;
    gap: 2rem;
  }
  
  .brand-logo {
    justify-content: center; /* 移动端品牌居中 */
  }
  
  .brand-desc {
    margin-left: auto;
    margin-right: auto; /* 描述文本居中 */
    text-align: center;
  }
  
  .brand-divider {
    margin-left: auto;
    margin-right: auto; /* 装饰线居中 */
  }
  
  .link-group {
    text-align: center; /* 链接组居中 */
  }
  
  .link-title::after {
    left: 50%;
    transform: translateX(-50%); /* 标题下划线居中 */
  }
}
</style>