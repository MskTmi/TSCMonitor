import{o as t,c as e,i as o,g as r,a,s as n,b as s,h as i,d as l,e as c,w as d,n as u,f as h,j as f,t as S,k as T,r as m}from"./index-74890acc.js";import{_ as g}from"./plugin-vueexport-helper.1b428a4d.js";const v=g({data:()=>({TSCText:"00:00",TSCcolor:"#ffaa00",backgroundCcolor:""}),onLoad(){r().windowHeight<400&&this.adaptScreensaver();a((t=>{t.size.windowHeight<400?this.adaptScreensaver():this.unAdaptScreensaver()}))},methods:{getInterval(t){const e=new Date;e.setHours(0,0,0,0),e.setDate(e.getDate()-1),e.setSeconds(n.state.countdown.misregistration);const o=t-(Date.now()-e.getTime())/1e3%t;o<n.state.countdown.redLight?(s({title:"红灯"}),this.TSCText=this.SecondToTimeStr(o),this.TSCcolor="#e43d33"):(s({title:"绿灯"}),this.TSCText=this.SecondToTimeStr(o-n.state.countdown.redLight),this.TSCcolor="#18bc37")},SecondToTimeStr(t){const e=Math.floor(t/60),o=Math.floor(t%60);return`${e.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`},timeup(){this.getInterval(n.getters.interval)},adaptScreensaver(){i(),l({frontColor:"#000000",backgroundColor:"#000000"}),document.querySelector("body").setAttribute("style","background-color:black"),this.backgroundCcolor="black"},unAdaptScreensaver(){c(),l({frontColor:"#000000",backgroundColor:"#ffffff"}),document.querySelector("body").setAttribute("style","background-color:#f5f5f5"),this.backgroundCcolor="#f5f5f5"}},components:{ElTimer:g({name:"ElTimer",props:["interval"],data:()=>({theInterval:null}),methods:{doTimer(){this.$emit("tick")}},mounted(){this.theInterval=setInterval(this.doTimer,this.interval)},beforeDestroy(){clearInterval(this.theInterval)},watch:{interval:function(t){clearInterval(this.theInterval),setInterval(this.doTimer(),t)}}},[["render",function(r,a,n,s,i,l){const c=o;return t(),e(c,{style:{display:"none"}})}]])}},[["render",function(r,a,n,s,i,l){const c=T,g=m("el-timer"),v=o;return t(),e(v,{class:"container",style:u({color:i.TSCcolor,background:i.backgroundCcolor})},{default:d((()=>[h(c,null,{default:d((()=>[f(S(i.TSCText),1)])),_:1}),h(g,{interval:200,onTick:l.timeup},null,8,["onTick"])])),_:1},8,["style"])}],["__scopeId","data-v-4df5735c"]]);export{v as default};
