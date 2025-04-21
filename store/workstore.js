import {
	createStore
} from 'vuex'

const workStoreGuidKey = "worktime_EEB2B770-9343-4404-8C8F-2B33D8B77328";

const workStore = createStore({
	state: {
		worktime: {
			enabled: false, // 是否启用打卡功能
			isFlexWorkTime: false, // 是否是弹性工作制
			// 非弹性工作制上下班
			offWorkTime:"17:00", // 非弹性工作制下的下班时间  
			// 弹性工作制上下班
			lastRecordDate: 0, // 弹性工作制下上次记录上班时间的值，用于数据隔天失效
			onWorkTime:"",// 弹性工作制下记录的上班打卡时间
			onWorkHours:9,// 弹性工作制下的上班时长
			
			// 通用配置
			leaveOfficeDuration:90, // 下楼所需的时间(秒)
			checkinMachinePosition:0,// 从出办公室到打卡机位置，为0则是在办公室门口
			
			checkinAppOpenUri:"", // 签到APP的打开SCHEMA
		}
	},
	getters: {
		datestamp(state) {
			const now = new Date();
			  const year = now.getFullYear();
			  const month = now.getMonth() + 1; // 月份是从0开始的
			  const day = now.getDate();
			
			  // 直接通过数学计算得到整数格式的日期
			  return year * 10000 + month * 100 + day;
		},
	},
	mutations: {
		// 更新数据并存储到Storage
		saveWorkTime(state, worktime) {
			state.worktime = worktime
			uni.setStorage({
				key: workStoreGuidKey,
				data: worktime
			});
		},
		// 从Storage中读取数据并更新状态
		loadWorkTime(state) {
			uni.getStorage({
				key: workStoreGuidKey,
				success: function(res) {
					state.worktime = res.data
				}
			});
		}
	}
});

workStore.commit('loadWorkTime');



export default workStore