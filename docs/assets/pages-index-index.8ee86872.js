import{o as t,c as e,i as o,r as n,s as a,a as s,w as r,n as i,b as l,d as c,t as d,e as m,f as h}from"./index-5f7f1ae9.js";import{_ as u}from"./plugin-vueexport-helper.1b428a4d.js";const T=u({data:()=>({TSCText:"00:00",TSCcolor:"#ffaa00"}),onLoad(){n({url:"https://tscmonitorkv.msktmi.com/get",data:{key:"countdown"},success:t=>{a.state.countdown=t.data,a.commit("setCountdown",a.state.countdown)}})},methods:{getInterval(t){const e=new Date;e.setHours(0,0,0,0),e.setDate(e.getDate()-1),e.setSeconds(a.state.countdown.misregistration);const o=t-(Date.now()-e.getTime())/1e3%t;o<a.state.countdown.redLight?(s({title:"红灯"}),this.TSCText=this.SecondToTimeStr(o),this.TSCcolor="#e43d33"):(s({title:"绿灯"}),this.TSCText=this.SecondToTimeStr(o-a.state.countdown.redLight),this.TSCcolor="#18bc37")},SecondToTimeStr(t){const e=Math.floor(t/60),o=Math.floor(t%60);return`${e.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`},timeup(){this.getInterval(a.getters.interval)}},components:{ElTimer:u({name:"ElTimer",props:["interval"],data:()=>({theInterval:null}),methods:{doTimer(){this.$emit("tick")}},mounted(){this.theInterval=setInterval(this.doTimer,this.interval)},beforeDestroy(){clearInterval(this.theInterval)},watch:{interval:function(t){clearInterval(this.theInterval),setInterval(this.doTimer(),t)}}},[["render",function(n,a,s,r,i,l){const c=o;return t(),e(c,{style:{display:"none"}})}]])}},[["render",function(n,a,s,u,T,S){const v=m,p=h("el-timer"),f=o;return t(),e(f,{class:"container",style:i({color:T.TSCcolor})},{default:r((()=>[l(v,null,{default:r((()=>[c(d(T.TSCText),1)])),_:1}),l(p,{interval:200,onTick:S.timeup},null,8,["onTick"])])),_:1},8,["style"])}],["__scopeId","data-v-9355a46a"]]);export{T as default};
