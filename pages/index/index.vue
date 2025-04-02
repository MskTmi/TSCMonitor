<style>
	@font-face {
		font-family: 'DigiBold';
		src: url('@/static/DigiBold.ttf') format('truetype');
	}

	html {
		overflow: hidden;
		height: 100%;
	}

	/* 设置数字字体为等宽数字 */
	body {
		-webkit-font-variant-numeric: lining-nums;
		font-variant-numeric: lining-nums;
		/* font-family: PingFangSC-Medium, sans-serif; */
		overflow: hidden;
		height: 100%;
	}

	.container {
		height: calc(100vh - var(--window-bottom) - var(--window-top));
		width: 100vw;
		position: relative;
	}

	.container .tsctext {
		justify-content: center;
		align-items: center;
		display: flex;
		width: 240px;
		height: 240px;
		flex-direction: column;
		position: absolute;
		top: calc(50% - 120px - 20px);
		left: calc(50% - 120px);
	}

	.container text {
		font-family: 'DigiBold', sans-serif;
		font-size: calc(20vw);

		/* font-weight: bold; */
		letter-spacing: 1px;
	}


	.nextgreen-canvas {
		margin-top: 12px;
		margin-bottom: 24px;
		width: calc(80vw);
		height: calc(80vw / 8.5);
		mask-image: linear-gradient(to right,
				transparent 0%,
				black 5%,
				black 95%,
				transparent 100%);
				
		/* 为旧版WebKit浏览器添加前缀 */
		-webkit-mask-image: linear-gradient(to right,
				transparent 0%,
				black 5%,
				black 95%,
				transparent 100%);
	}
</style>

<template>
	<view class="container" :style="{ color: TSCcolor ,background: backgroundCcolor}">

		<view class="tsctext">
			<text>{{TSCText}}</text>
			<div>
				<canvas canvas-id="drawCanvas" ref="canvasDom" class="nextgreen-canvas"></canvas>
			</div>
		</view>

		<el-timer :interval="100" @tick="timeup"></el-timer>
	</view>
</template>

<script>
	import store from '@/store/index.js';
	import ElTimer from './ElTimer.vue';
	export default {
		data() {
			return {
				TSCText: "00:00",
				TSCcolor: "#ffaa00",
				backgroundCcolor: "",
				canvasContext2d: null,
				canvasRenderEpochTime: 0
			}
		},
		onLoad() {
			//使用 Cloudflare Workers KV(https://developers.cloudflare.com/kv/) 同步 misregistration
			uni.request({
				url: 'https://tscmonitorkv.msktmi.com/get',
				data: {
					key: 'countdown'
				},
				success: (res) => {
					store.state.countdown = res.data;
					store.commit("setCountdown", store.state.countdown);
				}
			});

			/*
			// 根据宽高适配的方案：
			
			var windowRatio = uni.getWindowInfo().windowHeight / uni.getWindowInfo().windowWidth;
			if (windowRatio < 1) {
				this.adaptScreensaver();
			}
			//监听屏幕变化
			const windowResizeCallback = (res) => {
				if (res.size.windowHeight / res.size.windowWidth < 1) {
					this.adaptScreensaver();
				} else {
					this.unAdaptScreensaver();
				}
			}
			*/
			var forceScreensaver = false;
			if(window.navigator && window.navigator.userAgent){
				console.log(window.navigator.userAgent);
				if(window.navigator.userAgent.indexOf("screensaver") > 0){
					forceScreensaver = true;
				}
			}
			if(!forceScreensaver){
				//屏保模式
				var windowHeight = uni.getWindowInfo().windowHeight
				if (windowHeight < 400) {
					this.adaptScreensaver();
				}
				//监听屏幕变化
				const windowResizeCallback = (res) => {
					if (res.size.windowHeight < 400) {
						this.adaptScreensaver();
					} else {
						this.unAdaptScreensaver();
					}
				}
				uni.onWindowResize(windowResizeCallback)
			}
			else{
				this.adaptScreensaver();
			}
			
			this.canvasRenderEpochTime = (() => {
				var nowDate = new Date();
				nowDate.setHours(0);
				nowDate.setMinutes(0);
				nowDate.setSeconds(0);
				nowDate.setMilliseconds(0);
				return nowDate.getTime();
			})();
			this.$nextTick(() => {
				this.canvasContext2d = uni.createCanvasContext('drawCanvas');
			});
		},
		methods: {
			getInterval(interval) {
				const epoch = new Date();
				epoch.setHours(0, 0, 0, 0);
				epoch.setDate(epoch.getDate() - 1);
				epoch.setSeconds(store.state.countdown.misregistration);

				const offsetTime = Date.now() - epoch.getTime();
				const second = interval - (offsetTime / 1000) % interval;

				if (second < store.state.countdown.redLight) {
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
				if (this.canvasContext2d != null) {
					this.drawNext();
				}
			},

			drawNext() {
				var ctx = this.canvasContext2d;
				var w = 1000;
				var h = 200;
				var actualW = this.$refs.canvasDom.$el.clientWidth;

				// Initialize transforms
				ctx.clearRect(0, 0, w, h);
				ctx.setTransform(actualW / w, 0, 0, actualW / w, 0, 0);

				// 每分钟的像素数量
				var pixelPerMinute = 36;

				// 当前的分钟数量
				var now = new Date().getTime() - this.canvasRenderEpochTime;

				var nowMinute = now / 60000;

				var centerMinute = nowMinute + (w / pixelPerMinute / 2) * 0.7;

				var min2pix = (m) => {
					return w / 2 + (m - centerMinute) * pixelPerMinute;
				}


				// 设置刻度线样式
				ctx.strokeStyle = 'darkgray';
				ctx.lineWidth = 5;

				// 计算中心线位置
				var centerLineY = h / 2 - 55;

				// 绘制当前指针
				// ctx.beginPath();
				// ctx.moveTo(min2pix(nowMinute), 0);
				// ctx.lineTo(w / 2, centerLineY - 50);
				// ctx.stroke();

				var fromMinute = Math.floor(nowMinute - w / pixelPerMinute * 0.4); 
				var toMinute = Math.floor(nowMinute + w / pixelPerMinute * 1.2); 

				var minToTime = (m) =>{
					var date = new Date(this.canvasRenderEpochTime + m * 60000);
					var hour = date.getHours().toString().padStart(2, '0');
					var min = date.getMinutes().toString().padStart(2, '0');
					if(m % 30 == 0){
						return hour + ':' + min
					}
					return min;
				};
				var minToFullTime = (m) =>{
					var date = new Date(this.canvasRenderEpochTime + m * 60000);
					var hour = date.getHours().toString().padStart(2, '0');
					var min = date.getMinutes().toString().padStart(2, '0');
					return hour + ':' + min;
				};

				// 设置时间标签样式
				ctx.font = '30px Arial';
				ctx.fillStyle = 'gray';
				ctx.setTextAlign('center')
				ctx.setTextBaseline('bottom')
				// 绘制刻度线和时间标签
				for (var i = fromMinute; i <= toMinute; i++) {
					var x = min2pix(i);

					// 绘制刻度线
					ctx.beginPath();
					var dotRadius = i % 5 == 0 ? 8 :5;
					ctx.arc(x,centerLineY,dotRadius,0,Math.PI * 2,false);
					ctx.fill();

					// 每5分钟绘制一次时间标签
					if (Math.floor(i) % 5 === 0) {
						var timeStr = minToTime(i);
						ctx.fillText(timeStr, (x), centerLineY - 10);
					}
				}
				
				var redMinute = store.state.countdown.redLight / 60;
				var greenMinute = store.state.countdown.greenLight / 60;
				var offset = store.state.countdown.misregistration / 60;
				var totalInterval = redMinute + greenMinute;
				
				var firstGreenMinute = Math.floor(fromMinute / totalInterval) * totalInterval + offset;
				
				ctx.font = '36px Arial';
				ctx.setTextBaseline('top')
				var beginTime = firstGreenMinute;
				while(beginTime < toMinute){
					var greenFromX = min2pix(beginTime);
					var greenToX = min2pix(beginTime + greenMinute);
					var redFromX = greenToX;
					var redToX = min2pix(beginTime + totalInterval);
					
					ctx.fillStyle = "#18bc37"; // 绿色
					ctx.fillRect(greenFromX,centerLineY + 20,greenToX - greenFromX,10);
					ctx.fillText(minToFullTime(beginTime),(greenFromX + (greenToX - greenFromX) / 2),centerLineY + 40)
					
					ctx.fillStyle = "#e43d33"; // 红色
					
					ctx.fillRect(redFromX + 5,centerLineY + 22,redToX - redFromX - 10,5);
					
					
					beginTime += totalInterval;
				}
				
				
				// console.log(this.SecondToTimeStr((firstGreenMinute % 60) * 60));


				ctx.draw();
			},

			SecondToTimeStr(second) {
				const min = Math.floor(second / 60);
				const sec = Math.floor(second % 60);
				const str = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
				return str;
			},
			timeup() {
				this.getInterval(store.getters.interval);
			},
			adaptScreensaver() {
				uni.hideTabBar();
				uni.setNavigationBarColor({
					frontColor: '#000000',
					backgroundColor: '#000000',
				});
				document.querySelector('body').setAttribute('style', 'background-color:black');
				this.backgroundCcolor = "black"
			},
			unAdaptScreensaver() {
				uni.showTabBar();
				uni.setNavigationBarColor({
					frontColor: '#000000',
					backgroundColor: '#ffffff',
				});
				document.querySelector('body').setAttribute('style', 'background-color:#f5f5f5');
				this.backgroundCcolor = "#f5f5f5"
			}
		},
		components: {
			ElTimer
		}
	}
</script>