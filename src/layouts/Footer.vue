<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="brand-row">
            <span class="footer-logo">△</span>
            <span class="footer-brand-name">DELTA</span>
          </div>
          <p class="footer-tagline">专业的游戏护航服务平台 · 安全可靠，品质保障</p>
          <div class="footer-social">
            <a href="#" class="social-link" aria-label="微信"><i class="fab fa-weixin"></i></a>
            <a href="#" class="social-link" aria-label="QQ"><i class="fab fa-qq"></i></a>
            <a href="#" class="social-link" aria-label="微博"><i class="fab fa-weibo"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <div class="footer-group">
            <span class="footer-group-title">服务</span>
            <router-link to="/escort" class="footer-link">护航服务</router-link>
            <router-link to="/play-hall" class="footer-link">打手大厅</router-link>
            <router-link to="/orders" class="footer-link">我的订单</router-link>
            <router-link to="/wallet" class="footer-link">我的钱包</router-link>
          </div>
          <div class="footer-group">
            <span class="footer-group-title">支持</span>
            <router-link to="/help-center" class="footer-link">帮助中心</router-link>
            <router-link to="/support-center" class="footer-link">客服中心</router-link>
            <router-link to="/join-us" class="footer-link">加入我们</router-link>
            <router-link to="/game-map" class="footer-link">游戏地图</router-link>
          </div>
          <div class="footer-group">
            <span class="footer-group-title">法律</span>
            <router-link to="/terms" class="footer-link">服务条款</router-link>
            <a href="#" class="footer-link">隐私政策</a>
            <a href="#" class="footer-link">用户协议</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-inner">
        <span class="footer-copyright">© 2024 DELTA Game Service. All rights reserved.</span>
        <span class="footer-divider">|</span>
        <span class="footer-icp">栗帽游戏服务平台</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  margin-top: auto;
  background: var(--m-bg-secondary);
  border-top: 1px solid var(--m-border);
}

.footer-top {
  padding: 3rem 0 2rem;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  gap: 4rem;
}

.footer-brand {
  flex: 0 0 280px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.footer-logo {
  font-family: var(--m-font-display);
  font-size: 1.35rem;
  color: var(--m-accent);
}

.footer-brand-name {
  font-family: var(--m-font-body);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--m-text);
}

.footer-tagline {
  font-size: 0.85rem;
  color: var(--m-text-muted);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.footer-social {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--m-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--m-text-muted);
  font-size: 1rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.social-link:hover {
  border-color: var(--m-accent);
  color: var(--m-accent);
  background: var(--m-accent-light);
}

.footer-links {
  display: flex;
  gap: 3rem;
  flex: 1;
}

.footer-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.footer-group-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--m-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
}

.footer-link {
  font-size: 0.85rem;
  color: var(--m-text-secondary);
  transition: color 0.18s ease;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--m-accent);
}

.footer-bottom {
  padding: 1.25rem 0;
  border-top: 1px solid var(--m-border-light);
}

.footer-bottom .footer-inner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.footer-copyright {
  font-size: 0.8rem;
  color: var(--m-text-muted);
}

.footer-divider {
  color: var(--m-border);
  font-size: 0.8rem;
}

.footer-icp {
  font-size: 0.8rem;
  color: var(--m-text-muted);
}

@media (max-width: 768px) {
  .footer-top .footer-inner {
    flex-direction: column;
    gap: 2rem;
  }

  .footer-brand {
    flex: 0 0 auto;
  }

  .footer-links {
    flex-wrap: wrap;
    gap: 1.5rem;
  }
}
</style>
