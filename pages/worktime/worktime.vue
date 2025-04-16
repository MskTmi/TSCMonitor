<template>
	<view>

		<uni-section title="下班类型" titleFontSize="18px" padding>
			<template v-slot:decoration>
				<view class="primary-decoration"></view>
			</template>
			<uni-segmented-control :current="config.isFlexWorkTime ? 1 : 0" :values="workTimeTypeStr"
				@clickItem="(e)=>{config.isFlexWorkTime = e.currentIndex == 1;}"></uni-segmented-control>
		</uni-section>

		<template v-if="config.isFlexWorkTime == false">
			<uni-section title="下班时间" subTitle="打卡的下班时间(格式 HH:mm)" titleFontSize="18px" padding>
				<template v-slot:decoration>
					<view class="success-decoration"></view>
				</template>
				<uni-easyinput placeholder="格式 HH:mm,或者留空" type="text" trim="all" v-model="config.offWorkTime"
					:clearable="true"></uni-easyinput>
			</uni-section>
		</template>

		<template v-if="config.isFlexWorkTime == true">
			<uni-section title="上班时间" subTitle="打卡的上班时间(格式 HH:mm)" titleFontSize="18px" padding>
				<template v-slot:decoration>
					<view class="warning-decoration"></view>
				</template>
				<uni-easyinput placeholder="格式 HH:mm,或者留空" type="text" trim="all" v-model="config.onWorkTime"
					:clearable="true"></uni-easyinput>
			</uni-section>
			<uni-section title="工作时长" subTitle="工作多少小时后可以打卡下班" titleFontSize="18px" padding>
				<template v-slot:decoration>
					<view class="success-decoration"></view>
				</template>
				<uni-easyinput placeholder="请输入数字" type="number" trim="all" v-model="inputs.onWorkHours"
					:clearable="false"></uni-easyinput>
			</uni-section>
		</template>
		<uni-section title="下楼时长" subTitle="下楼到红绿灯需要多久(秒)" titleFontSize="18px" padding>
			<template v-slot:decoration>
				<view class="danger-decoration"></view>
			</template>
			<uni-easyinput placeholder="请输入数字" type="number" trim="all" v-model="inputs.leaveOfficeDuration"
				:clearable="false"></uni-easyinput>
		</uni-section>
		<uni-section title="打卡机位置" subTitle="从出办公室到打卡机位置的耗时(秒)，为0则是在办公室门口" titleFontSize="18px" padding>
			<template v-slot:decoration>
				<view class="primary-decoration"></view>
			</template>
			<uni-easyinput placeholder="请输入数字" type="number" trim="all" v-model="inputs.checkinMachinePosition"
				:clearable="false"></uni-easyinput>
		</uni-section>
		<uni-row class="save_row">
			<uni-col :span="24">
				<button class="timeCalibration_button_green" hover-class="timeCalibration_button_green_hover"
					@click="doSave">保存配置</button>
			</uni-col>
		</uni-row>
		<view>
			<!-- 提示信息弹窗 -->
			<uni-popup ref="message" type="message">
				<uni-popup-message :type="popup.msgType" :message="popup.messageText"
					:duration="2000"></uni-popup-message>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import workStore from '@/store/workstore.js';
	export default {
		data() {
			return {
				config: {
					isFlexWorkTime: workStore.state.worktime.isFlexWorkTime, // 是否是弹性工作制
					offWorkTime: workStore.state.worktime.offWorkTime, // 非弹性工作制下的下班时间
					lastRecordDate: workStore.state.worktime.lastRecordDate, // 弹性工作制下上次记录上班时间的值
					onWorkTime: workStore.state.worktime.onWorkTime, // 弹性工作制下记录的上班打卡时间
					leaveOfficeDuration: workStore.state.worktime.leaveOfficeDuration, // 下楼所需的时间
					onWorkHours: workStore.state.worktime.onWorkHours, // 上班时常（小时）
					checkinMachinePosition: workStore.state.worktime.checkinMachinePosition // 从出办公室到打卡机位置，为0则是在办公室门口
				},
				inputs: {
					leaveOfficeDuration: workStore.state.worktime.leaveOfficeDuration + "",
					onWorkHours: workStore.state.worktime.onWorkHours + "",
					checkinMachinePosition: workStore.state.worktime.checkinMachinePosition + "",

				},
				popup: {
					type: "success",
					message: "修改成功",
				},
				workTimeTypeStr: ["固定下班", "弹性下班"],
			}
		},

		onLoad() {
			if (this.config.lastRecordDate != workStore.getters.datestamp) {
				this.config.onWorkTime = "";
			}
		},
		onShow() {
			// 只有这个项目会在外部进行修改，因此需要更新
			this.config.onWorkTime = workStore.state.worktime.onWorkTime; // 弹性工作制下记录的上班打卡时间

		},

		methods: {
			saveData() {
				workStore.state.worktime.isFlexWorkTime = this.config.isFlexWorkTime;
				workStore.state.worktime.offWorkTime = this.config.offWorkTime;
				workStore.state.worktime.onWorkTime = this.config.onWorkTime;
				workStore.state.worktime.lastRecordDate = this.config.lastRecordDate;
				workStore.state.worktime.leaveOfficeDuration = this.config.leaveOfficeDuration;
				workStore.state.worktime.onWorkHours = this.config.onWorkHours;
				workStore.state.worktime.checkinMachinePosition = this.config.checkinMachinePosition;

				// 提交保存操作
				workStore.commit("saveWorkTime", workStore.state.worktime);
			},
			changeWorkTimeType(e) {
				var newType = e.currentIndex;
				this.workTimeTypeIndex = newType;
				this.config.isFlexWorkTime = newType == 1 ? true : false;
			},
			doSave() {
				if (this.validateData()) {
					this.saveData();
					this.showSuccess("保存成功");
				}


			},

			validateData() {

				var leaveOfficeDuration = parseInt(this.inputs.leaveOfficeDuration);
				var onWorkHours = parseFloat(this.inputs.onWorkHours);
				var checkinMachinePos = parseFloat(this.inputs.checkinMachinePosition);

				if (isNaN(leaveOfficeDuration) || leaveOfficeDuration < -300 || leaveOfficeDuration > 300) {
					this.showErr("输入有错误\n请检查下楼时长\n然后再保存");
					return false;
				}
				if (isNaN(checkinMachinePos) || checkinMachinePos < -600 || checkinMachinePos > 600) {
					this.showErr("输入有错误\n打卡机位置异常\n请重新输入");
					return false;
				}

				this.config.leaveOfficeDuration = leaveOfficeDuration;
				this.config.checkinMachinePosition = checkinMachinePos;

				if (this.config.isFlexWorkTime) {
					// 弹性工作制的时间验证
					if (!this.checkTimeValid(this.config.onWorkTime, true)) {
						this.showErr("格式有错误\n请检查上班时间\n然后再保存");
						return false;
					}

					if (this.config.onWorkTime != '') {
						this.config.lastRecordDate = workStore.getters.datestamp;
					}

					if (isNaN(onWorkHours)) {
						this.showErr("输入有错误\n请检查工作时长\n然后再保存");
						return false;
					}
					if (onWorkHours < 3) { // 工作时长不能少于3小时
						this.showErr("范围有错误\n工作时长少于三\n请重新输入");
						return false;
					}
					if (onWorkHours > 16) { // 工作时长不能超过16小时（？）
						this.showErr("范围有错误\n工作时长多于16\n请重新输入");
						return false;
					}
					this.config.onWorkHours = onWorkHours;
					return true;
				} else {
					// 非弹性工作制的时间验证
					if (!this.checkTimeValid(this.config.offWorkTime, false)) {
						this.showErr("格式有错误\n请检查下班时间\n然后再保存");
						return false;
					}
					this.config.onWorkTime = "";

					return true;
				}




				return false;
			},

			checkTimeValid(str, allowEmpty = false) {
				// 如果允许为空且输入为空，则返回true
				if (allowEmpty && str === '') {
					return true;
				}

				// 正则表达式匹配HH:mm格式
				const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

				// 检查输入字符串是否符合时间格式
				return timeRegex.test(str);
			},

			showErr(msg) {
				uni.showToast({
					icon: 'error',
					title: msg,
					duration: 2000
				})
			},
			showSuccess(msg = "保存成功") {
				this.popup.messageText = msg;
				this.$refs.message.open();
			},
		}
	}
</script>

<style>
	.danger-decoration {
		width: 4px;
		height: 18px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #e64340;
	}

	.success-decoration {
		width: 4px;
		height: 18px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #18bc37;
	}

	.warning-decoration {
		width: 4px;
		height: 46px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #ffaa00;
	}

	.primary-decoration {
		width: 4px;
		height: 32px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #2979ff;
	}

	.timeCalibration_button_green {
		margin: 0px 6px 0px 8px;
		color: #ffffff;
		background-color: #18bc37;
	}

	.timeCalibration_button_green_hover {
		color: rgb(255, 255, 255, 0.6);
		background-color: #00aa00;
	}

	.save_row {
		width: 100%;
		padding-top: 24rpx;
		padding-bottom: 36rpx;
		background-color: white;
	}
</style>