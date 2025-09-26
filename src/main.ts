import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, faLock, faEye, faEyeSlash, faSpinner, 
  faEnvelope, faPhone, faCheck, 
  faTimes, faExclamationTriangle, faArrowRight 
  ,faRocket,       // 对应 fa-rocket
  faShield,       // 对应 fa-shield
  faGamepad,      // 对应 fa-gamepad
  faHistory,      // 对应 fa-history
  faListAlt,      // 对应 fa-list-alt
  faUsers,        // 对应 fa-users
  faComments      // 对应 fa-comments
} from '@fortawesome/free-solid-svg-icons'
import { faWeixin, faQq,} from '@fortawesome/free-brands-svg-icons'

// 添加图标到库
library.add(faRocket, 
  faShield, 
  faGamepad, 
  faHistory, 
  faListAlt, 
  faUsers, 
  faComments, faUser, faLock, faEye, faEyeSlash, faSpinner, faEnvelope, faPhone, faCheck, faTimes, faExclamationTriangle, faArrowRight, faWeixin, faQq)

// 创建Vue应用实例
const app = createApp(App)

// 注册FontAwesome组件
app.component('FontAwesomeIcon', FontAwesomeIcon)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')