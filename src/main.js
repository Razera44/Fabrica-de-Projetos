import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './utils/reveal.js'
import { scramble } from './utils/scramble.js'
import './style.css'

const app = createApp(App)
app.directive('reveal', reveal)
app.directive('scramble', scramble)
app.mount('#app')
