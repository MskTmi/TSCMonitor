<style>
	.redDecoration {
		width: 4px;
		height: 18px;
		border-radius: 10px;
		margin-right: 6px;
		background-color: #e43d33;
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
	</view>
</template>

<script>
	import store from '@/store/index.js';
	export default {
		data() {
			return {
				redLight: store.state.countdown.redLight,
				greenLight: store.state.countdown.greenLight,
				misregistration: store.state.countdown.misregistration
			}
		},
		methods: {
			redLightInput(countdown) {
				console.log(store.state.countdown)
				store.state.countdown.redLight = parseInt(countdown);
				store.commit("setCountdown", store.state.countdown);
				this.updateKV();
			},
			greenLightInput(countdown) {
				store.state.countdown.greenLight = parseInt(countdown);
				store.commit("setCountdown", store.state.countdown);
				this.updateKV();
			},
			misregistrationInput(countdown) {
				store.state.countdown.misregistration = parseInt(countdown);
				store.commit("setCountdown", store.state.countdown);
				this.updateKV();
			},
			updateKV() {
				uni.request({
					url: 'https://tscmonitorkv.msktmi.com/put',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						key: 'countdown',
						value: JSON.stringify(store.state.countdown)
					},
					success: (res) => {
						//res.data == "True"
					}
				});
			},
		}
	}
</script>

<style>

</style>