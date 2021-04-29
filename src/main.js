import { createApp } from 'vue'
import Antd, { message } from 'ant-design-vue'
import App from '@/App.vue'
import 'ant-design-vue/dist/antd.css'
import router from '@/router'
import store from '@/store'
import axios from 'axios'
import { createFromIconfontCN } from '@ant-design/icons-vue'
import '@/permission'

const app = createApp(App)
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1621893_qhnt59v6jdh.js'
})

message.config({
  duration: 2,
  maxCount: 3
})

app.config.globalProperties.$axios = axios
app.config.globalProperties.$msg = message

app.use(store).use(router).use(Antd).component('IconFont', IconFont)
app.mount('#app')
