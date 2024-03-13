import {
	createStore
} from 'vuex'

const store = createStore({
	state: {
		countdown: {
			redLight: 180,
			greenLight: 60,
			misregistration: 120
		}
	},
	getters: {
		totalTime(state) {
			return state.countdown.redLight + state.countdown.greenLight
		}
	},
	mutations: {
		// 更新数据并存储到Storage
		setCountdown(state, countdown) {
			state.countdown = countdown
			uni.setStorage({
				key: 'countdown',
				data: countdown
			});
		},
		// 从Storage中读取数据并更新状态
		loadCountdown(state) {
			uni.getStorage({
				key: 'countdown',
				success: function(res) {
					state.countdown = res.data
				}
			});
		}
	}
})

// 初始化时加载数据
store.commit('loadCountdown')

export default store