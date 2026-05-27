import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, faLock, faEye, faEyeSlash, faSpinner, 
  faEnvelope, faPhone, faCheck, 
  faTimes, faExclamationTriangle, faArrowRight, faBell, faTrash,
  faChevronLeft, faChevronRight, faFileText, faRefresh, faStar,
  faRocket,
  faShield,
  faGamepad,
  faHistory,
  faListAlt,
  faUsers,
  faComments,
  faComment,
  faInfoCircle,
  faClock,
  faMoneyBillWave,
  faCalendarAlt,
  faUndo,
  faTag,
  faTrophy,
  faSearch,
  faPlus,
  faPlusCircle,
  faSave,
  faBook,
  faCreditCard,
  faChartBar,
  faShoppingCart,
  faCheckCircle,
  faExclamationCircle,
  faTimesCircle,
  faUserPlus,
  faUserSecret,
  faUserTimes,
  faRandom,
  faGavel,
  faHeadphones,
  faCog,
  faEdit,
  faCamera,
  faUpload,
  faLink,
  faBan,
  faPencil,
  faPaperPlane,
  faQuestionCircle,
  faHome,
  faHeart,
  faCoins,
  faWallet,
  faMoneyCheck
} from '@fortawesome/free-solid-svg-icons'
import { faWeixin, faQq, faWeibo } from '@fortawesome/free-brands-svg-icons'

// 添加图标到库
library.add(faRocket, 
  faShield, 
  faGamepad, 
  faHistory, 
  faListAlt, 
  faUsers, 
  faComments, faComment, faUser, faLock, faEye, faEyeSlash, faSpinner, faEnvelope, faPhone, faCheck, faTimes, faExclamationTriangle, faArrowRight, faBell, faTrash, faChevronLeft, faChevronRight, faFileText, faRefresh, faStar, faWeixin, faQq, faWeibo,
  faInfoCircle, faClock, faMoneyBillWave, faCalendarAlt, faUndo,
  faTag, faTrophy, faSearch, faPlus, faPlusCircle, faSave, faBook,
  faCreditCard, faChartBar, faShoppingCart, faCheckCircle, faExclamationCircle, faTimesCircle,
  faUserPlus, faUserSecret, faUserTimes, faRandom, faGavel,
  faHeadphones, faCog, faEdit, faCamera, faUpload, faLink, faBan, faPencil,
  faPaperPlane, faQuestionCircle, faHome, faHeart, faCoins, faWallet, faMoneyCheck)

// 创建Vue应用实例
const app = createApp(App)

// 注册FontAwesome组件
app.component('FontAwesomeIcon', FontAwesomeIcon)

const pinia = createPinia()
app.use(pinia)
// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')