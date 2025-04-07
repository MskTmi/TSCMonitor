
const workStore = createStore({
	state: {
		worktime: {
			enabled: false, // 是否启用打卡功能
			isFlexWorkTime: false, // 是否是弹性工作制
			// 非弹性工作制上下班
			offWorkTime:"", // 非弹性工作制下的下班时间  
			// 弹性工作制上下班
			lastRecordDate: "", // 弹性工作制下上次记录上班时间的值，用于数据隔天失效
			onWorkTime:"",// 弹性工作制下记录的上班打卡时间
			
			// 通用配置
			leaveOfficeDuration:90, // 下楼所需的时间
			checkInSystemTimeDiff:0,// 考勤系统的时钟校准，用在当考勤系统的时钟和实际时钟不一致时
			
		}
	},
	getters: {
		
	},
	mutations: {
		// 更新数据并存储到Storage
		setWorkTime(state, worktime) {
			state.worktime = worktime
			uni.setStorage({
				key: 'worktime',
				data: worktime
			});
		},
		// 从Storage中读取数据并更新状态
		loadWorkTime(state) {
			uni.getStorage({
				key: 'worktime',
				success: function(res) {
					state.worktime = res.data
				}
			});
		}
	}
});

workStore.commit('loadWorkTime');



export default workStore