(this["webpackJsonpxstate-react-typescript-template"]=this["webpackJsonpxstate-react-typescript-template"]||[]).push([[0],{29:function(e,t,n){},40:function(e,t,n){"use strict";n.r(t);var o=n(26),a=n(8),s=(n(29),n(7),n(23)),i=n(20),r=n(2),c=n(44),y=n(43);(0,n(11).a.cancel)("timeout");function p(e){return Object(r.q)((t=>({type:"SPEAK",value:e})))}function l(){return[{target:"#root.dm.help",cond:e=>g(e.recResult)},{target:".nomatch"}]}function d({promptMsg:e,question:t,prompt2:n}){return{initial:"prompt",states:{prompt:{entry:e,on:{ENDSPEECH:{cond:()=>!0===m(),target:"question"}}},question:{entry:p(t),on:{ENDSPEECH:"ask"}},ask:{entry:[Object(r.q)("LISTEN"),Object(r.q)("TIMEOUT",{delay:7500,id:"timeout"})]},promptAgain:{entry:[Object(r.q)("RECOGNISED"),p(n)],always:[{cond:()=>(u+=1,u<3),target:"question"},{target:"#root.dm.goodbye"}]},nomatch:{entry:[p("Sorry, I didnt get that")],on:{ENDSPEECH:"question"}}}}}let u=0;function m(){return u=0,!0}let g=function(e){return["help","I need help","help me"].includes(e)};const h={John:{person:"John Appleseed"},Goofy:{person:"Goofy Dog"},Mickey:{person:"Mickey Mouse"},Minnie:{person:"Minnie Mouse"},Donald:{person:"Donald Duck"},Daisy:{person:"Daisy Duck"},Lisa:{person:"Lisa Simpson"},Homer:{person:"Homer Simpson"},Monty:{person:"Montgomery Burns"},Apu:{person:"Apu Nahasapeemapetilon"},"on Monday":{weekday:"Monday"},"on Tuesday":{weekday:"Tuesday"},"on Wednesday":{weekday:"Wednesday"},"on Thursday":{weekday:"Thursday"},"on Friday":{weekday:"Friday"},"on Saturday":{weekday:"Saturday"},"on Sunday":{weekday:"Sunday"},Monday:{weekday:"Monday"},Tuesday:{weekday:"Tuesday"},Wednesday:{weekday:"Wednesday"},Thursday:{weekday:"Thursday"},Friday:{weekday:"Friday"},Saturday:{weekday:"Saturday"},Sunday:{weekday:"Sunday"},1:{time:"13:00"},2:{time:"14:00"},3:{time:"15:00"},4:{time:"16:00"},5:{time:"17:00"},6:{time:"18:00"},7:{time:"19:00"},8:{time:"20:00"},9:{time:"21:00"},10:{time:"22:00"},11:{time:"15:00"},12:{time:"00:00"},"at 1":{time:"13:00"},"at 2":{time:"14:00"},"at 3":{time:"15:00"},"at 4":{time:"16:00"},"at 5":{time:"17:00"},"at 6":{time:"18:00"},"at 7":{time:"19:00"},"at 8":{time:"20:00"},"at 9":{time:"21:00"},"at 10":{time:"22:00"},"at 11":{time:"23:00"},"at 12":{time:"00:00"}},O={yes:{yes_no:!0},"of course":{yes_no:!0},sure:{yes_no:!0},absolutely:{yes_no:!0},yeah:{yes_no:!0},yep:{yes_no:!0},okay:{yes_no:!0},no:{yes_no:!1},nope:{yes_no:!1},"no thanks":{yes_no:!1},nah:{yes_no:!1}},b={initial:"init",states:{help:{entry:p("I am here if you need help."),on:{ENDSPEECH:"#root.dm.appointment.history"}},goodbye:{entry:p("You were silent for too many times. Bye for now."),always:{cond:()=>!0===m(),target:"#root.dm.init"}},init:{on:{CLICK:"welcome"}},welcome:{entry:p("Hello, lets create a meeting."),on:{ENDSPEECH:"appointment"}},appointment:{initial:"who",states:{history:{type:"history",history:"shallow"},who:Object(a.a)({on:{RECOGNISED:[{cond:e=>"person"in(h[e.recResult]||{}),actions:Object(r.b)((e=>({person:h[e.recResult].person}))),target:"day"},...l()],TIMEOUT:".promptAgain"}},d({promptMsg:Object(r.q)((e=>({type:"SPEAK",value:""}))),question:"Who are you meeting with?",prompt2:"You can say Mickey or Minnie for example"})),day:Object(a.a)({on:{RECOGNISED:[{cond:e=>"weekday"in(h[e.recResult]||{}),actions:Object(r.b)((e=>({weekday:h[e.recResult].weekday}))),target:"how_long"},...l()],TIMEOUT:".promptAgain"}},d({promptMsg:Object(r.q)((e=>({type:"SPEAK",value:"OK. ".concat(e.person,".")}))),question:"On which day is your meeting?",prompt2:"Say a day of the week"})),how_long:Object(a.a)({on:{RECOGNISED:[{cond:e=>"yes_no"in(O[e.recResult]||{})&&!0===O[e.recResult].yes_no,target:"confirm_whole_day"},{cond:e=>"yes_no"in(O[e.recResult]||{})&&!1===O[e.recResult].yes_no,target:"what_time"},...l()],TIMEOUT:".promptAgain"}},d({promptMsg:Object(r.q)((e=>({type:"SPEAK",value:"OK. on ".concat(e.weekday,".")}))),question:"Will it take the whole day?",prompt2:"Say yes or no"})),confirm_whole_day:Object(a.a)({on:{RECOGNISED:[{cond:e=>"yes_no"in(O[e.recResult]||{})&&!0===O[e.recResult].yes_no,target:"done"},{cond:e=>"yes_no"in(O[e.recResult]||{})&&!1===O[e.recResult].yes_no,target:"who"},...l()],TIMEOUT:".promptAgain"}},d({promptMsg:Object(r.q)((e=>({type:"SPEAK",value:"Alright. Meeting ".concat(e.person," on ").concat(e.weekday," for the whole day.")}))),question:"Shall I create a whole-day appointment?",prompt2:"Say yes or no"})),what_time:Object(a.a)({on:{RECOGNISED:[{cond:e=>"time"in(h[e.recResult]||{}),actions:Object(r.b)((e=>({time:h[e.recResult].time}))),target:"confirm_with_time"},...l()],TIMEOUT:".promptAgain"}},d({promptMsg:Object(r.q)((e=>({type:"SPEAK",value:"At what time is your meeting?"}))),question:"Say an hour of the day.",prompt2:"You may say at 1, at 2, and so on"})),confirm_with_time:Object(a.a)({on:{RECOGNISED:[{cond:e=>"yes_no"in(O[e.recResult]||{})&&!0===O[e.recResult].yes_no,target:"done"},{cond:e=>"yes_no"in(O[e.recResult]||{})&&!1===O[e.recResult].yes_no,target:"who"},...l()],TIMEOUT:".promptAgain"}},d({promptMsg:Object(r.q)((e=>({type:"SPEAK",value:"Alright. Meeting ".concat(e.person," on ").concat(e.weekday," at ").concat(e.time,".")}))),question:"Shall I create the appointment?",prompt2:"Say yes or no"})),done:{entry:p("Great, your appointment has been made."),on:{ENDSPEECH:"#root.dm.init"}}}}}};var S=n(22),E=n(13);Object(y.a)({url:"https://statecharts.io/inspect",iframe:!1});const w=Object(i.a)({id:"root",type:"parallel",states:{dm:Object(a.a)({},b),asrtts:{initial:"idle",states:{idle:{on:{LISTEN:"recognising",SPEAK:{target:"speaking",actions:Object(r.b)(((e,t)=>({ttsAgenda:t.value})))}}},recognising:{initial:"progress",entry:"recStart",exit:"recStop",on:{ASRRESULT:{actions:["recLogResult",Object(r.b)(((e,t)=>({recResult:t.value})))],target:".match"},RECOGNISED:"idle"},states:{progress:{},match:{entry:Object(r.q)("RECOGNISED")}}},speaking:{entry:"ttsStart",on:{ENDSPEECH:"idle"}}}}}},{actions:{recLogResult:e=>{console.log("<< ASR: "+e.recResult)},test:()=>{console.log("test")},logIntent:e=>{console.log("<< NLU intent: "+e.nluData.intent.name)}}}),j=e=>{switch(!0){case e.state.matches({asrtts:"recognising"}):return Object(E.jsx)("button",Object(a.a)(Object(a.a)({type:"button",className:"glow-on-hover",style:{animation:"glowing 20s linear"}},e),{},{children:"Listening..."}));case e.state.matches({asrtts:"speaking"}):return Object(E.jsx)("button",Object(a.a)(Object(a.a)({type:"button",className:"glow-on-hover",style:{animation:"bordering 1s infinite"}},e),{},{children:"Speaking..."}));default:return Object(E.jsx)("button",Object(a.a)(Object(a.a)({type:"button",className:"glow-on-hover"},e),{},{children:"Click to start"}))}};function k(){const e=Object(S.useSpeechSynthesis)({onEnd:()=>{l("ENDSPEECH")}}),t=e.speak,n=e.cancel,a=(e.speaking,Object(S.useSpeechRecognition)({onResult:e=>{l({type:"ASRRESULT",value:e})}})),s=a.listen,i=(a.listening,a.stop),r=Object(c.b)(w,{devTools:!0,actions:{recStart:Object(c.a)((()=>{console.log("Ready to receive a voice input."),s({interimResults:!1,continuous:!0})})),recStop:Object(c.a)((()=>{console.log("Recognition stopped."),i()})),ttsStart:Object(c.a)(((e,n)=>{console.log("Speaking..."),t({text:e.ttsAgenda})})),ttsCancel:Object(c.a)(((e,t)=>{console.log("TTS STOP..."),n()})),speak:Object(c.a)((e=>{console.log("Speaking..."),t({text:e.ttsAgenda})}))}}),y=Object(o.a)(r,3),p=y[0],l=y[1];y[2];return Object(E.jsx)("div",{className:"App",children:Object(E.jsx)(j,{state:p,onClick:()=>l("CLICK")})})}const R=document.getElementById("root");s.render(Object(E.jsx)(k,{}),R)}},[[40,1,2]]]);
//# sourceMappingURL=main.68f57e88.chunk.js.map