<template>
	<view style="display:none">
	</view>
</template>
<script>
	// 一个简单的定时器组件，属性interval表示间隔，触发tick事件
	// 可以用v-if来控制timer

	/**
	 * 一个简单的Vue定时器组件
	 * 推荐使用v-if作为是否开启的判断
	 * @model ElTimer
	 * @author ZYFDroid
	 * @prop {Number} interval 定时器时间间隔
	 */
	export default {
		name: "ElTimer",
		props: ["interval"],
		data() {
			return {
				theInterval: null,
			};
		},
		methods: {
			doTimer() {
				this.$emit("tick");
			}
		},
		mounted() {
			this.theInterval = setInterval(this.doTimer, this.interval);
		},
		beforeDestroy() {
			clearInterval(this.theInterval);
		},
		watch: {
			interval: function(newval) {
				clearInterval(this.theInterval);
				setInterval(this.doTimer(), newval);
			},
		},
	};
</script>
<style>

</style>