<style>
	.redDecoration {
		width: 4px;
		height: 18px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #e64340;
	}

	.greenDecoration {
		width: 4px;
		height: 18px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #18bc37;
	}

	.misregistration {
		width: 4px;
		height: 46px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #ffaa00;
	}

	.timeCalibration {
		width: 4px;
		height: 32px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #2979ff;
	}

	.timeCalibration_content {
		padding: 15px;
	}

	.timeCalibration_button_red {
		margin: 0px 8px 0px 6px;
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

	.demo-uni-row {
		padding-bottom: 12px;
	}
</style>
<template>
	<view>
		<uni-section title="红灯倒计时" titleFontSize="18px" padding>
			<template v-slot:decoration>
				<view class="redDecoration"></view>
			</template>
			<uni-easyinput type="number" trim="all" v-model="redLight" :clearable="false"
				@input="redLightInput"></uni-easyinput>
		</uni-section>

		<uni-section title="绿灯倒计时" titleFontSize="18px" padding>
			<template v-slot:decoration>
				<view class="greenDecoration"></view>
			</template>
			<uni-easyinput type="number" trim="all" v-model="greenLight" :clearable="false"
				@input="greenLightInput"></uni-easyinput>
		</uni-section>

		<uni-section title="周期偏移" subTitle="每小时绿灯初次亮起时间 \n 例: 120 -> 绿灯在一个小时中的第120秒首次亮起" titleFontSize="18px" padding>
			<template v-slot:decoration>
				<view class="misregistration"></view>
			</template>
			<uni-easyinput type="number" trim="all" v-model="misregistration" :clearable="false"
				@input="misregistrationInput"></uni-easyinput>
		</uni-section>

		<uni-collapse>
			<uni-collapse-item>
				<template v-slot:title>
					<uni-section title="校准时间" subTitle="半自动校准时间" titleFontSize="18px">
						<template v-slot:decoration>
							<view class="timeCalibration"></view>
						</template>
					</uni-section>
				</template>
				<view class="timeCalibration_content">
					<uni-row class="demo-uni-row">
						<uni-col :span="12">
							<button class="timeCalibration_button_red" type="warn"
								@click="quickCalibration(redLight)">按红灯校准</button>
						</uni-col>
						<uni-col :span="12">
							<button class="timeCalibration_button_green"
								hover-class="timeCalibration_button_green_hover"
								@click="quickCalibration(0)">按绿灯校准</button>
						</uni-col>
					</uni-row>
				</view>
			</uni-collapse-item>
		</uni-collapse>


		<view>
			<!-- 提示信息弹窗 -->
			<uni-popup ref="message" type="message">
				<uni-popup-message :type="msgType" :message="messageText" :duration="2000"></uni-popup-message>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import store from '@/store/index.js';
	export default {
		data() {
			return {
				type: "success",
				message: "修改成功",
				redLight: store.state.countdown.redLight,
				greenLight: store.state.countdown.greenLight,
				misregistration: store.state.countdown.misregistration
			}
		},
		methods: {
			redLightInput(countdown) {
				store.state.countdown.redLight = parseInt(countdown);
				store.commit("setCountdown", store.state.countdown);
			},
			greenLightInput(countdown) {
				store.state.countdown.greenLight = parseInt(countdown);
				store.commit("setCountdown", store.state.countdown);
			},
			misregistrationInput(countdown) {
				store.state.countdown.misregistration = parseInt(countdown);
			},
			messageToggle(type = "success", messageText = "修改成功") {
				this.msgType = type;
				this.messageText = messageText;
				this.$refs.message.open();
			},
			quickCalibration(offset) {
				const epoch = new Date();
				epoch.setHours(0, 0, 0, 0);
				epoch.setDate(epoch.getDate() - 1);
				epoch.setSeconds(0);
				var interval = store.getters.interval;
				const offsetTime = Date.now() - epoch.getTime();
				const second = (offsetTime / 1000) % interval;

				var misregistration = second + offset;
				while (misregistration < 0) {
					misregistration += interval;
				}
				while (misregistration > interval) {
					misregistration -= interval;
				}

				//保存偏移量
				this.misregistration = parseInt(misregistration);
				store.state.countdown.misregistration = parseInt(misregistration);
			},

		}
	}
</script>

<style></style>