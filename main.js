// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
// #endif


import store from '@/store';

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
export function createApp() {
	const app = createSSRApp(App)
	// 引入Vuex
	app.use(store)
	return {
		app
		// Vuex // 如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
	}
}
// #endif