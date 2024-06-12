<style>
	@font-face {
		font-family: 'DigiBold';
		src: url('@/static/DigiBold.ttf') format('truetype');
	}

	html {
		overflow: hidden;
		height: 100%
	}

	/* 设置数字字体为等宽数字 */
	body {
		-webkit-font-variant-numeric: lining-nums;
		font-variant-numeric: lining-nums;
		/* font-family: PingFangSC-Medium, sans-serif; */
		overflow: hidden;
		height: 100%
	}

	.container {
		height: 72vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.container text {
		font-family: 'DigiBold', sans-serif;
		font-size: 80px;
		/* font-weight: bold; */
		letter-spacing: 1px;
	}
</style>

<template>
	<view class="container" :style="{ color: TSCcolor }">
		<text>{{TSCText}}</text>
		<el-timer :interval="1000" @tick="timeup"></el-timer>
	</view>
</template>

<script>
	import store from '@/store/index.js';
	import ElTimer from './ElTimer.vue';
	export default {
		data() {
			return {
				TSCText: "00:00",
				TSCcolor: "#ffaa00"
			}
		},
		onLoad() {
			//使用 Cloudflare Workers KV(https://developers.cloudflare.com/kv/) 同步 misregistration
			uni.request({
				url: 'https://tscmonitorkv.msktmi.com/get',
				data: {
					key: 'misregistration'
				},
				success: (res) => {
					store.state.countdown.misregistration = res.data
					store.commit("setCountdown", store.state.countdown);
				}
			});
		},
		methods: {
			getInterval(interval, misregistration) {
				const epoch = new Date();
				epoch.setHours(0, 0, 0, 0);
				epoch.setDate(epoch.getDate() - 1);
				epoch.setSeconds(misregistration);

				const offsetTime = Date.now() - epoch.getTime();
				const second = interval - (offsetTime / 1000) % interval;

				if (second < 180) {
					uni.setNavigationBarTitle({
						title: "红灯"
					});
					this.TSCText = this.SecondToTimeStr(second);
					this.TSCcolor = "#e43d33";
				} else {
					uni.setNavigationBarTitle({
						title: "绿灯"
					});
					this.TSCText = this.SecondToTimeStr(second - store.state.countdown.redLight);
					this.TSCcolor = "#18bc37";
				}
			},
			SecondToTimeStr(second) {
				const min = Math.floor(second / 60);
				const sec = Math.floor(second % 60);
				const str = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
				return str;
			},
			timeup() {
				this.getInterval(store.getters.interval, store.state.countdown.misregistration);
			}

		},
		components: {
			ElTimer
		}
	}
</script>