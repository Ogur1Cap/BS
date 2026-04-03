/** 帮助中心 FAQ（与后端 /help-center/faqs 一致） */
export interface FaqItem {
  id: string
  category: 'order' | 'service' | 'account' | string
  question: string
  answer: string
}
