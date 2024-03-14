<style>
	html {
		overflow: hidden;
		height: 100%
	}

	/* 设置数字字体为等宽数字 */
	body {
		-webkit-font-variant-numeric: lining-nums;
		font-variant-numeric: lining-nums;
		font-family: "Microsoft Yahei";
		overflow: hidden;
		height: 100%
	}

	.container {
		height: 80vh;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 45px;
		font-weight: bold;
	}

	.container text {
		margin-right: 6px;
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
				TSCText: "加载中...",
				TSCcolor: "#ffaa00"
			}
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
					this.TSCText = "红灯 " + this.SecondToTimeStr(second);
					this.TSCcolor = "#e43d33";
				} else {
					this.TSCText = "绿灯 " + this.SecondToTimeStr(second - 180);
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
			},

		},
		components: {
			ElTimer
		}
	}
</script>