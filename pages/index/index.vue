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
		top: calc(50% - 120px);
		left: calc(50% - 120px);
	}

	.container .worktime {
		justify-content: center;
		align-items: center;
		display: flex;
		width: 240px;
		height: 120px;

		flex-direction: column;
		position: absolute;

		top: calc(50% + 120px - 20px);
		left: calc(50% - 120px);
	}

	.container .worktimebutton {
		justify-content: center;
		align-items: center;
		display: flex;
		width: 240px;
		height: 120px;

		flex-direction: column;
		position: absolute;

		top: calc(50% + 120px - 20px);
		left: calc(50% - 120px);
	}

	.container text {
		font-family: 'DigiBold', sans-serif;
		font-size: calc(20vw);

		/* font-weight: bold; */
		letter-spacing: 1px;
	}


	.nextgreen-canvas {
		/* background-color: antiquewhite; */
		margin-top: 12px;
		margin-bottom: 0px;
		width: calc(80vw);
		height: calc(80vw / 4);
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

	@keyframes striking {

		0%,
		9%,
		100% {
			transform: translate(4px, 6px);
		}

		10%,
		19% {
			transform: translate(-4px, 7px);
		}

		20%,
		29% {
			transform: translate(2px, -8px);
		}

		30%,
		39% {
			transform: translate(5px, -4px);
		}

		40%,
		49% {
			transform: translate(-10px, 3px);
		}

		50%,
		59% {
			transform: translate(6px, 6px);
		}

		60%,
		69% {
			transform: translate(-4px, 2px);
		}

		70%,
		79% {
			transform: translate(10px, 5px);
		}

		80%,
		89% {
			transform: translate(1px, -9px);
		}

		90%,
		99% {
			transform: translate(-10px, -10px);
		}
	}

	.striking {
		animation: striking 0.3s infinite;
	}
</style>

<template>
	<view class="container">

		<view class="tsctext" :style="{ color: TSCcolor ,background: backgroundCcolor}">
			<text>{{TSCText}}</text>
			<view>
				<canvas canvas-id="drawCanvas" ref="canvasDom" class="nextgreen-canvas"></canvas>
			</view>
		</view>
		<view class="worktimebutton" v-if="showSignInButton">
			<button @click="onSignInButtonClick">记录签到</button>
		</view>
		<view class="worktime" v-if="showSignOffAlternative">
			签退时间：{{signOffTimeText}}
		</view>
		<el-timer v-if="shouldUpdate" :interval="200" @tick="timeup"></el-timer>
	</view>
</template>

<script>
	import store from '@/store/index.js';

	import workStore from '@/store/workstore.js';
	import ElTimer from './ElTimer.vue';
	export default {
		data() {
			return {
				TSCText: "00:00",
				TSCcolor: "#ffaa00",
				backgroundCcolor: "",
				canvasContext2d: null,
				canvasRenderEpochTime: 0,
				shouldUpdate: false,

				signOffTimeText: "",
				signOffTime: -1,
				showSignOff: false,
				showSignOffAlternative: false,
				showSignInButton: false,
				leaveOfficeTime: -1,
				leaveOfficeRemainDisplay: "",
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

			uni.setTabBarItem({
				index: 1,
				visible: workStore.state.worktime.enabled
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
			if (window.navigator && window.navigator.userAgent) {
				if (window.navigator.userAgent.indexOf("screensaver") > 0) {
					forceScreensaver = true;
				}
			}
			if (!forceScreensaver) {
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
			} else {
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
				if (this.leaveOfficeTime > 0) {

					var remainMinutes = this.leaveOfficeTime - (Date.now() - this.canvasRenderEpochTime) / 60000.0;
					this.showSignOff = remainMinutes > 20;
					if (remainMinutes < 0) {
						this.leaveOfficeRemainDisplay = "该出发了";

					} else {
						var convertMinutesToTime = function(decimalMinutes) {
							// 将小数分钟数转换为总秒数
							const totalSeconds = Math.floor(decimalMinutes * 60);

							// 计算小时数
							const hours = Math.floor(totalSeconds / 3600);

							// 计算剩余的分钟数
							const minutes = Math.floor((totalSeconds % 3600) / 60);

							// 计算剩余的秒数
							const seconds = totalSeconds % 60;

							// 格式化时间为"时分秒"格式，确保每个部分都有两位数字
							const formattedMinutes = minutes.toString().padStart(2, '0');
							const formattedSeconds = seconds.toString().padStart(2, '0');
							// 根据小时数返回不同的格式
							if (hours > 0) {
								// 格式化小时，确保有两位数字
								const formattedHours = hours.toString().padStart(2, '0');
								// 返回格式化的"时分秒"时间字符串
								return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
							} else {
								// 返回格式化的"分秒"时间字符串
								return `${formattedMinutes}:${formattedSeconds}`;
							}
						}
						this.leaveOfficeRemainDisplay = convertMinutesToTime(remainMinutes);
					}
				}
			},

			computeSignOffTime() {
				this.showSignOffAlternative = false;
				if (workStore.state.worktime.enabled) {
					// Compute required data
					var workTimeConfig = workStore.state.worktime;

					var shouldSignOffTime = "17:00";
					// 根据情况计算出签退的时间
					if (workTimeConfig.isFlexWorkTime) {
						// 正则表达式匹配HH:mm格式
						const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
						if (workTimeConfig.lastRecordDate != workStore.getters.datestamp) {
							workTimeConfig.onWorkTime = "";
						}

						if (!timeRegex.test(workTimeConfig.onWorkTime)) {
							this.showSignInButton = true;
							this.showSignOff = false;
							
							this.signOffTime = -1;
							this.leaveOfficeTime = -1;
							// 未填写，则返回，并显示记录签到的按钮
							return;
						} else {
							// 已填写了签到时间，此时隐藏按钮并计算签退时间
							var min = this.fullTimeToMin(workTimeConfig.onWorkTime);
							min = min + workTimeConfig.onWorkHours * 60;
							min = min - (min % 1) + 1;
							shouldSignOffTime = this.minToFullTime(min);
							this.showSignOff = true;
							this.showSignInButton = false;
						}

					} else {
						shouldSignOffTime = workTimeConfig.offWorkTime;
					}

					this.signOffTimeText = shouldSignOffTime;

					// 此时已经完成了对签退时间的计算，开始计算合适的下楼时间

					var signOffMinute = this.fullTimeToMin(this.signOffTimeText);
					this.signOffTime = signOffMinute

					var offset = store.state.countdown.misregistration / 60.0;
					var interval = store.getters.interval / 60.0;

					var nextGreenLight = offset + Math.ceil((signOffMinute - offset) / interval) * interval;

					var prevGreenLight = nextGreenLight - interval;
					// 两个时间有了，看看哪个合适


					var checkIfCanCatchUpSignOff = (greenLightTime) => {
						var leaveOfficeTime = greenLightTime - workTimeConfig.leaveOfficeDuration / 60.0;
						var arriveCheckinMachineTime = leaveOfficeTime + workTimeConfig.checkinMachinePosition / 60.0;
						var toleranceTime = (store.state.countdown.greenLight / 60 - 0.4);
						if (toleranceTime < 0) {
							toleranceTime = 0;
						}
						// 到达打卡机时是否已经到达签退时间
						if (arriveCheckinMachineTime - toleranceTime > signOffMinute) {
							return true;
						}
						return false;

					};
					if (checkIfCanCatchUpSignOff(prevGreenLight)) {
						this.leaveOfficeTime = prevGreenLight - workTimeConfig.leaveOfficeDuration / 60.0;
					} else {
						if (checkIfCanCatchUpSignOff(nextGreenLight)) {
							this.leaveOfficeTime = nextGreenLight - workTimeConfig.leaveOfficeDuration / 60.0;
						} else {
							this.leaveOfficeTime = nextGreenLight - workTimeConfig.leaveOfficeDuration / 60.0 + interval;
						}
					}

					
					this.showSignInButton = false;
					this.showSignOff = true;
				} else {
					this.showSignOff = false;
							this.showSignInButton = false;
					this.signOffTime = -1;
					this.leaveOfficeTime = -1;
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

				var centerMinute = nowMinute + (w / pixelPerMinute / 2) * 0.6;

				var min2pix = (m) => {
					return w / 2 + (m - centerMinute) * pixelPerMinute;
				}

				var nowPix = min2pix(nowMinute);

				// 设置刻度线样式
				ctx.strokeStyle = 'darkgray';
				ctx.lineWidth = 5;

				// 计算中心线位置
				var centerLineY = Math.round(h / 2 - 55);

				var fromMinute = Math.floor(nowMinute - w / pixelPerMinute * 0.4);
				var toMinute = Math.floor(nowMinute + w / pixelPerMinute * 1.2);

				var minToTime = (m) => {
					var date = new Date(this.canvasRenderEpochTime + m * 60000);
					var hour = date.getHours().toString().padStart(2, '0');
					var min = date.getMinutes().toString().padStart(2, '0');
					if (m % 30 == 0) {
						return hour + ':' + min
					}
					return min;
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
					var dotRadius = i % 5 == 0 ? 8 : 5;
					ctx.arc(x, centerLineY, dotRadius, 0, Math.PI * 2, false);
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


				while (beginTime < toMinute) {
					var greenFromX = min2pix(beginTime);
					var greenToX = min2pix(beginTime + greenMinute);
					var redFromX = greenToX;
					var redToX = min2pix(beginTime + totalInterval);

					ctx.fillStyle = greenFromX < nowPix ? "#aaaaaa" : "#18bc37"; // 绿色
					ctx.fillRect(greenFromX, centerLineY + 20, greenToX - greenFromX, 10);
					if (greenFromX < nowPix && greenToX > nowPix) {
						ctx.fillStyle = "#18bc37";
						ctx.fillRect(nowPix, centerLineY + 20, greenToX - nowPix, 10);
					}
					ctx.fillStyle = greenToX < nowPix ? "#aaaaaa" : "#18bc37"; // 绿色
					ctx.fillText(this.minToFullTime(beginTime), (greenFromX + (greenToX - greenFromX) / 2), centerLineY +
						40)

					ctx.fillStyle = redFromX < nowPix ? "#aaaaaa" : "#e43d33"; // 红色

					ctx.fillRect(redFromX + 5, centerLineY + 22, redToX - redFromX - 10, 5);
					if (redFromX < nowPix && redToX - 10 > nowPix) {
						ctx.fillStyle = "#e43d33";
						ctx.fillRect(nowPix + 5, centerLineY + 22, redToX - nowPix - 10, 5);
					}

					beginTime += totalInterval;
				}

				if(this.signOffTime > 0){
					var signOffPixelStart = min2pix(this.signOffTime);
					// nowMinute 是当前的分钟
					var signOffBubbleText = this.signOffTimeText;
					
					ctx.font = '36px Arial';
					ctx.fillStyle =  "#00aaff";
					if(this.signOffTime <= nowMinute){
						signOffBubbleText = "该打卡了";
						ctx.fillStyle =  "#878787";
					}
					this.CRC2D_drawBubbles(ctx, this.signOffTime < this.leaveOfficeTime, signOffPixelStart, centerLineY + 90, 170, 110, 24, "签退", signOffBubbleText);
					
					signOffPixelStart = min2pix(this.leaveOfficeTime);
					if(Math.abs(this.leaveOfficeTime - this.signOffTime) < 10){
						if(this.signOffTime <= this.leaveOfficeTime){
							signOffPixelStart -= 5;
						}
						else{
							signOffPixelStart += 5;
						}
					}
					ctx.font = '36px Arial';
					ctx.fillStyle =  "#00d38d";
					if(this.leaveOfficeTime <= nowMinute){
						
						ctx.fillStyle =  "#cf0000";
						
					}
					this.CRC2D_drawBubbles(ctx, this.signOffTime >= this.leaveOfficeTime, signOffPixelStart, centerLineY + 90, 170, 110, 24, "下楼", this.leaveOfficeRemainDisplay);
					
					// console.log(this.SecondToTimeStr((firstGreenMinute % 60) * 60));
					
				}

				

				ctx.draw();
			},
			CRC2D_drawBubbles(ctx, isRight, x, y, width, height, radius, text, text2) {
				if (isRight) {

					this.CRC2D_drawBubblesRight(ctx, x, y, width, height, radius, text, text2);
				} else {
					this.CRC2D_drawBubblesLeft(ctx, x, y, width, height, radius, text, text2);
				}
			},
			CRC2D_drawBubblesLeft(ctx, x, y, width, height, radius, text, text2) {
				ctx.beginPath();
				// 移动到左上角的尖尖的顶点
				ctx.moveTo(x, y + radius);
				// 绘制左上角的尖尖
				ctx.lineTo(x, y - radius);
				ctx.lineTo(x + radius, y);
				// 绘制上边线
				ctx.lineTo(x + width - radius, y);
				// 绘制右上角的圆角
				ctx.arcTo(x + width, y, x + width, y + radius, radius);
				// 绘制右边线
				ctx.lineTo(x + width, y + height - radius);
				// 绘制右下角的圆角
				ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
				// 绘制下边线
				ctx.lineTo(x + radius, y + height);
				// 绘制左下角的圆角
				ctx.arcTo(x, y + height, x, y + height - radius, radius);
				// 绘制左边线，回到起点
				ctx.lineTo(x, y + radius);
				// 完成路径
				ctx.closePath();
				ctx.fill();
				ctx.setTextAlign("center");
				ctx.setTextBaseline("middle");
				ctx.fillStyle = "#fff";
				ctx.fillText(text, x + width / 2, y + height / 4 + 5);
				ctx.fillText(text2, x + width / 2, y + height / 4 * 3 - 2);
			},

			CRC2D_drawBubblesRight(ctx, x, y, width, height, radius, text, text2) {
				x = x - width;
				ctx.beginPath();
				// 移动到左上角的圆角
				ctx.moveTo(x, y + radius);
				// 左上角的圆角
				ctx.arcTo(x, y, x + radius, y, radius);
				// 绘制上边线
				ctx.lineTo(x + width - radius, y);
				// 绘制尖尖头
				ctx.lineTo(x + width, y - radius)
				// 绘制右边线
				ctx.lineTo(x + width, y + height - radius);
				// 绘制右下角的圆角
				ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
				// 绘制下边线
				ctx.lineTo(x + radius, y + height);
				// 绘制左下角的圆角
				ctx.arcTo(x, y + height, x, y + height - radius, radius);
				// 绘制左边线，回到起点
				ctx.lineTo(x, y + radius);
				// 完成路径
				ctx.closePath();
				ctx.fill();
				ctx.setTextAlign("center");
				ctx.setTextBaseline("middle");
				ctx.fillStyle = "#fff";
				ctx.fillText(text, x + width / 2, y + height / 4 + 5);
				ctx.fillText(text2, x + width / 2, y + height / 4 * 3 - 2);
			},

			minToFullTime(m) {
				var date = new Date(this.canvasRenderEpochTime + m * 60000);
				var hour = date.getHours().toString().padStart(2, '0');
				var min = date.getMinutes().toString().padStart(2, '0');
				return hour + ':' + min;
			},
			fullTimeToMin(str) {
				// 分割字符串以获取小时和分钟
				const [hours, minutes] = str.split(':').map(Number);

				// 计算总分钟数
				return hours * 60 + minutes;
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
			},
			onSignInButtonClick(){
				var nowMinute = (Date.now() - this.canvasRenderEpochTime) / 60000;
				var items = [
					this.minToFullTime(nowMinute+1),
					"　　　　" + this.minToFullTime(nowMinute) +"（现在）",
					this.minToFullTime(nowMinute - 1),
					this.minToFullTime(nowMinute - 2),
					"手动输入"
				];
				var itemValues = [
					this.minToFullTime(nowMinute+1),
					this.minToFullTime(nowMinute),
					this.minToFullTime(nowMinute - 1),
					this.minToFullTime(nowMinute - 2),
					""
				];
				uni.showActionSheet({
					itemList: items,
					title:"请选择签到时间",
					success:  (res) => {
						console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
						var chosenTime = itemValues[res.tapIndex];
						if(chosenTime == ""){
							uni.switchTab({
								url: '/pages/worktime/worktime'
							});
						}
						else{
							this.setSignOnTime(chosenTime);
						}
					},
					fail: function (res) {
						console.log(res.errMsg);
					}
				});
			},
			setSignOnTime(timestr){
				workStore.state.worktime.onWorkTime = timestr;
				workStore.state.worktime.lastRecordDate = workStore.getters.datestamp;
				// 提交保存操作
				workStore.commit("saveWorkTime", workStore.state.worktime);
				this.computeSignOffTime();
				uni.showToast({
					icon: 'success',
					title: "打卡时间\n记录成功",
					duration: 2000
				})
				this.showSignOffAlternative = true;
			}
		},
		// 修复切换页面后标题被覆盖的问题
		onHide() {
			console.log("Main Hide");
			this.shouldUpdate = false;
		},
		onShow() {
			console.log("Main show");
			this.shouldUpdate = true;
			this.computeSignOffTime();
		},
		components: {
			ElTimer
		}
	}
</script>