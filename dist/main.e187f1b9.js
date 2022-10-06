/*! For license information please see main.e187f1b9.js.LICENSE.txt */
(self.webpackChunkmultipurpose_calculator=self.webpackChunkmultipurpose_calculator||[]).push([["main","nextdose","seconddose"],{"./js/heparin.js":function(e,t,a){"use strict";a.r(t);var s=a("./js/util.js");$(".input-heparin").on("keyup",(()=>{i.calc()})),$(".input-heparin").on("keyup",(()=>{setTimeout((()=>{i.check()}),500)}));const i={startingRate:0,finalRate:0,calc(){$("#heparin-icon-yes, #heparin-icon-no, #heparin-resultText").hide();const e=(0,s.wS)(+$("#heparin-wt").val(),20,300);this.startingRate=(0,s.wS)(+$("#heparin-startingRate").val(),0,4e3);const t=(0,s.wS)(+$("#heparin-roundedRate").val(),0,50);let a=0;e>0&&this.startingRate>0&&(a=(0,s.RW)(this.startingRate/e,.01)),(0,s.AI)($("#heparin-startingWtRate"),a,.01," units/kg/hr"),this.finalRate=t>0&&e>0?(0,s.RW)(e*t,50):0,(0,s.AI)($("#heparin-finalRate"),this.finalRate,50," units/hr")},check(){this.finalRate>0&&this.startingRate>0&&($("#heparin-resultText").show(),this.startingRate===this.finalRate?($("#heparin-resultText").html("Initial rate = desired starting rate").addClass("text-success").removeClass("text-danger"),$("#heparin-icon-yes").show()):($("#heparin-resultText").html("Initial rate will not equal desired starting rate.").addClass("text-danger").removeClass("text-success"),$("#heparin-icon-no").show()))}}},"./js/main.js":function(e,t,a){"use strict";a("./node_modules/bootstrap/dist/js/bootstrap.js");var s=a("./js/util.js");const i={"/":4.0731," ":4.0731," ":4.0731,"∙":4.0731,"⋅":4.1375,"-":4.882,"–":8.1533,"—":14.66,".":4.0731,"+":8.5613,":":4.0731,"'":2.7989,"|":3.8083,",":4.0731,";":4.0731,"[":4.0731,"]":4.0731,"`":4.882,"(":4.882,")":4.882,"{":4.8963,"}":4.8963,"*":5.7052,"^":6.8791,"?":8.1533,"#":8.1533,$:8.1533,_:8.1533,"~":8.5613,"<":8.5613,">":8.5613,"=":8.5613,"&":9.7781,"%":13.0352,"@":14.882,A:9.7781,B:9.7781,C:10.587,D:10.587,E:9.7781,F:8.955,G:11.4031,H:10.587,I:4.0731,J:7.33,K:9.7781,L:8.1478,M:12.212,N:10.587,O:11.4031,P:9.7781,Q:11.4031,R:10.587,S:9.7781,T:8.955,U:10.587,V:9.7781,W:13.8369,X:9.7781,Y:9.7781,Z:8.955,1:7.0761,2:8.1533,3:8.1533,4:8.1533,5:8.1533,6:8.1533,7:8.1533,8:8.1533,9:8.1533,0:8.1533,a:8.1533,e:8.1533,f:3.8109,g:8.1533,h:8.1533,i:3.257,k:7.33,m:12.212,n:8.1533,o:8.1533,r:4.882,s:7.33,t:4.0731,u:8.1533,b:8.1533,c:7.33,d:8.1533,j:3.257,l:3.257,p:8.1533,q:8.1533,v:7.33,w:10.587,x:7.33,y:7.33,z:7.33,"₀":4.3952,"₁":4.3952,"₂":4.3952,"₃":4.3952,"₄":4.3952,"₅":4.3952,"₆":4.3952,"₇":4.3952,"₈":4.3952,"₉":4.3952,"₊":4.9608,"₋":4.9608,"₌":4.9608,"₍":2.9278,"₎":2.9278,"ₐ":5.4547,"ₑ":5.4475,"ₒ":5.5333,"ₓ":4.8103,"ₔ":5.4475,"ₕ":4.3952,"ₖ":4.3952,"ₗ":2.4409,"ₘ":6.8433,"ₙ":4.3952,"ₚ":4.3952,"ₛ":3.4217,"ₜ":2.4409,"⁰":4.882,"¹":4.882,"²":4.882,"³":4.882,"⁴":4.882,"⁵":4.882,"⁶":4.882,"⁷":4.882,"⁸":4.882,"⁹":4.882,"⁺":4.9608,"⁻":4.9608,"⁼":4.9608,"⁽":2.9278,"⁾":2.9278,"ⁿ":5.3472,"ⁱ":2.4409};function n(e){const t=(e+="").split("");let a=0;for(let e=0;e<t.length;e++)void 0===i[t[e]]&&console.error(`No width defined for ${t[e]}`),a+=parseFloat(i[t[e]]);return a}function r(e,t=4){const a=i[" "],s=e.map((e=>n(e))),r=Math.max(...s),o=s.map((e=>{const s=Math.round((r-e)/a)+t;return"&nbsp;".repeat(s)}));let c=[];for(let t=0;t<e.length;t++)c.push(e[t]+o[t]);return c}const o=[{rates:[.6,1.2,2.4,4.8,7.2],durations:[30,30,30,30,9999],padding:[8,6,6,4,7],conc:.1},{rates:[.6,1.2,2.4,4.2],durations:[30,30,30,9999],padding:[6,4,4,8],conc:.05},{rates:[.6,1.2,2.4,4.8],durations:[30,30,30,9999],padding:[6,4,4,8],conc:.1},{rates:[1.2,2.4,4.8],durations:[30,30,9999],padding:[6,4,7],conc:.1}];var c={getText:function(e,t,a){let i={steps:["Time"],rates1:["Rate"],rates2:["Infusion Rate"]};const{rates:n,steps:c,padding:l,conc:h,durations:d}=o[e];let u=a/h,g=0,v=n.length;for(let e=0;e<v;e++){i.rates1.push(`${n[e]} mL/kg/hr`);let r=d[e],o=e+1<n.length?`${g}-${g+r} min`:`${g}+ min`;if(t>0){let c=(0,s.RW)(t*n[e],.1);if(i.rates2.push(`${c} mL/hr`),a>0){let t=c*(r/60);if(t>u&&(r=u/c*60,v=e),e===v){o=`${g}-${Math.ceil(g+r)} min`}u-=t}}else 0===e&&i.rates2.pop(0);i.steps.push(o),g+=r}let m="";i.steps=r(i.steps,4),i.rates1=r(i.rates1,4);for(let e=0;e<i.steps.length;e++)m+=i.steps[e],m+=i.rates1[e],i.rates2.length>0&&(m+=i.rates2[e]),e+1<i.steps.length&&(m+="\n");return m}},l=(a("./js/growthCharts.js"),a("./js/seconddose.js"));function h(e,t){let a=(0,s.hN)($(e).val());return 0===(0,s.wS)(a,t.min,t.max)?$(e).addClass("invalid"):$(e).removeClass("invalid"),e}function d(e,t){let a=$(e).val(),i=(0,s.aD)(a);return""===i?$(e).addClass("invalid"):($(e).val(i),$(e).removeClass("invalid"),$(e).removeClass("invalid")),e}function u(e,t){return 0===(0,s.wS)(+$(e).val(),t.min,t.max)?$(e).addClass("invalid"):$(e).removeClass("invalid"),e}function g(e,t){return t.match.test($(e).val())?$(e).removeClass("invalid"):$(e).addClass("invalid"),e}var v=a("./js/vanco.js");let m=!1;function p(){m=!0}function f(e,t=""){let a="";const s=function(e,t="-",a=0){const s=n(t),i=n(e),r=Math.round(i/s)+a;return t.repeat(r)}(t=t.toUpperCase(),"=");""!==t&&(a=`${t}<br>${s}`);let i="",r=[];return e.forEach((e=>{e[1]instanceof Array?e[0]instanceof Array?(i+="<br>",i+=w(e)):(i+=`<br><u>${e[0]}</u><br>`,i+=w(e[1])):r.push(e)})),`${a}${w(r)}${i}`}function w(e){let t=[],a=[],s="";e.forEach((e=>{""!==e[1]&&(t.push(e[0]+":"),a.push(e[1]))})),t=r(t);for(let e=0;e<t.length;e++)s+=t[e]+a[e]+"<br>";return s}$=a("./node_modules/jquery/src/jquery.js"),a("./js/heparin.js"),a("./js/pca.js"),a("./js/nextdose.js");let b,I=!1,k={};function x(){const e=new Date;$(".dt-date").val(`${e.getFullYear()}-${("0"+(e.getMonth()+1)).slice(-2)}-${("0"+e.getDate()).slice(-2)}`)}$((()=>{if($('[data-toggle="popover"]').popover({html:!0}),$('[data-toggle="tooltip"]').tooltip(),$(".hidden").hide(),/debug/.test(location.search)?I=!0:/log/.test(location.search)&&p(),I){$("#ptage").val(60),$("#sex").val("M"),$("#height").val(170.2),$("#weight").val(123.1),$("#scr").val(.9),$("#vancoAUCPeakTime").val(5),$("#vancoAUCTroughTime").val(11.5),$("#auc-curPeak").val(20),$("#auc-curTrough").val(11),$("#auc-curDose").val(1e3),$("#auc-curFreq").val(12),$("#twolevelDate1").val("2021-01-16"),$("#twolevelDate2").val("2021-01-16"),$("#twolevelTime1").val("0000"),$("#twolevelTime2").val("1500"),$("#twolevelLevel1").val(20),$("#twolevelLevel2").val(12),$("#revision-curDose").val(1e3),$("#revision-curFreq").val(12),$("#revision-curTrough").val(11),$("#revision-curTroughTime").val(.5),p();document.querySelector("#nav-auc-tab");C.syncCurrentDFT("revision"),C.patientData(),C.vancoInitial(),C.vancoRevision(),C.vancoAUC()}else x();b=function(e){let t="";for(let a of e)t+=`${a.selector}, `,$(a.selector).on("focus",(e=>{$(e.target).removeClass("invalid")})),a.inputType?"age"===a.inputType?$(a.selector).on("focusout",(e=>{""!==$(e.target).val()&&h(e.target,a)})):"time"===a.inputType&&$(a.selector).on("focusout",(e=>{""!==$(e.target).val()&&d(e.target)})):a.max?$(a.selector).on("focusout",(e=>{""!==$(e.target).val()&&u(e.target,a)})):a.match&&$(a.selector).on("focusout",(e=>{""!==$(e.target).val()&&g(e.target,a)}));return t.slice(0,-2)}([{selector:"#ptage",inputType:"age",min:T.config.check.ageMin,max:T.config.check.ageMax},{selector:"#sex",match:/^[MmFf]$/},{selector:"#height",min:T.config.check.htMin,max:T.config.check.htMax},{selector:"#weight",min:T.config.check.wtMin,max:T.config.check.wtMax},{selector:"#scr",min:T.config.check.scrMin,max:T.config.check.scrMax},{selector:".validate-dose",min:v.vc.check.doseMin,max:v.vc.check.doseMax},{selector:".validate-freq",min:v.vc.check.freqMin,max:v.vc.check.freqMax},{selector:".validate-level",min:v.vc.check.levelMin,max:v.vc.check.levelMax},{selector:".validate-time",inputType:"time"}]),$("#ptage").get(0).focus()})),$(".input-patient").on("keyup",(()=>{C.patientData(),C.vancoInitial(),C.vancoRevision(),C.vancoAUC()})),$("#ptage").on("keyup",(()=>{setTimeout((()=>{$("#top-container").removeClass("age-adult age-child age-infant"),$("#top-container").addClass(`age-${T.ageContext}`)}),1e3)})),$("#vancoIndication").on("change",(()=>{C.patientData(),C.vancoInitial()})),$("#hd").on("change",(e=>{const t=e.target.selectedIndex;$("#top-container").removeClass("hd-0 hd-1 hd-2 hd-3 hd-4"),$("#top-container").addClass(`hd-${t}`),C.patientData(),C.vancoInitial(),C.vancoRevision(),C.vancoAUC()})),$(".input-initialPK").on("keyup",(()=>{C.vancoInitial()})),$(".input-auc").on("keyup",(()=>{C.syncCurrentDFT("auc"),C.vancoAUC(),C.vancoRevision()})),$(".input-auc-interval").on("keyup",(()=>{C.vancoAUC(!1)})),$("#auc-reset").on("click",(()=>{C.vancoAUC()})),$("#btnShowInitialPk").on("click",(()=>{$("#row--initialPkAlert").hide(50,"linear"),$("#row--initialPkCalc").addClass("show")})),$(".input-revision").on("keyup",(()=>{C.syncCurrentDFT("revision"),C.vancoRevision(),C.vancoAUC()})),$(".input-aucDates").on("keyup",(()=>C.vancoAUCDates())),$(".input-twolevel").on("keyup",(()=>C.vancoTwolevel())),$(".input-twolevel-interval").on("keyup",(()=>C.vancoTwolevel(!1))),$("#twolevel-reset").on("click",(()=>C.vancoTwolevel())),$("#revision-goalTrough").on("change",(()=>C.vancoRevision())),$("#schwartz-k-infant").on("change",(()=>{C.patientData(),C.vancoInitial(),C.vancoRevision(),C.vancoAUC()})),$(".input-steadystate").on("keyup",(()=>C.vancoSteadyStateCheck())),$("#seconddose-time1").on("keyup",(()=>C.secondDose())),$("[name='seconddose-freq']").on("change",(()=>C.secondDose())),$("#btnReset").on("click",(()=>{$("input").val(""),C.syncCurrentDFT("revision"),x(),$("#aucDates-apply").removeClass("datesApplied"),$("#hd")[0].selectedIndex=0,$("#vancoIndication")[0].selectedIndex=0,C.patientData(),C.vancoInitial(),C.vancoRevision(),C.vancoAUC(),C.vancoTwolevel(),C.secondDose(),C.ivig(),$("#top-container").removeClass("age-adult age-child age-infant"),$("#top-container").addClass("age-adult"),$(b).removeClass("invalid"),$(".hidden").hide(),$(".output").html(""),$("#ptage").get(0).focus(),$("#pca-drug")[0].selectedIndex=0,$("#pca-orderset")[0].selectedIndex=0,$("#pca-continuous")[0].selectedIndex=0,$(".pca-bg-warning").removeClass("pca-bg-warning"),$(".pca-bg-danger").removeClass("pca-bg-danger"),$(".pca-bg-error").removeClass("pca-bg-error")})),$("#ivig-product").on("change",(()=>C.ivig())),$("#weight").on("keyup",(()=>C.ivig())),$("#ivig-dose").on("keyup",(()=>C.ivig())),$("#aucDates-sameInterval").on("change",(e=>{const t=document.getElementById("aucDates-row--trough"),a=document.getElementById("aucDates-row--peak"),s=document.getElementById("aucDates-row--spacer"),i=(document.getElementById("aucDates-row--last"),t.parentNode);e.target.checked?($("#aucDates-label--dose1").html("Dose prior to levels"),i.insertBefore(a,t),i.insertBefore(t,s),$("#aucDates-row--dose2").hide()):($("#aucDates-label--dose1").html("Dose before trough"),$("#aucDates-row--dose2").show(),i.insertBefore(t,a),i.insertBefore(a,s)),C.vancoAUCDates()})),$("#aucDates-apply").on("click",(e=>{$(e.target).addClass("datesApplied"),$("#vancoAUCPeakTime").val($("#aucDates-peakResult").html()),$("#vancoAUCTroughTime").val($("#aucDates-troughResult").html()),$("#aucDatesModal").modal("hide"),C.vancoAUC()}));let T={config:{check:{wtMin:1,wtMax:300,htMin:60,htMax:250,ageMin:.25,ageMax:120,scrMin:.1,scrMax:20}},set sex(e){this._sex=/^[MmFf]$/.test(e)?e.toUpperCase():0},get sex(){return this._sex||0},set wt(e){this._wt=(0,s.wS)(e,this.config.check.wtMin,this.config.check.wtMax)},get wt(){return this._wt||0},set ht(e){this._ht=(0,s.wS)(e,this.config.check.htMin,this.config.check.htMax)},get ht(){return this._ht||0},set age(e){const t=(0,s.hN)(e);this._age=t?(0,s.wS)(t,this.config.check.ageMin,this.config.check.ageMax):void 0},get age(){return this._age||0},get ageContext(){return this.age<1&&this.age>0?"infant":this.age<18&&0!==this.age?"child":"adult"},set scr(e){this._scr=(0,s.wS)(e,this.config.check.scrMin,this.config.check.scrMax)},get scr(){return this._scr||0},get bmi(){return this.wt>0&&this.ht>0?this.wt/(this.ht/100)**2:0},get ibw(){return this.age<18?0:this.ht>0&&this.wt>0&&this._sex?("M"===this.sex?50:45.5)+2.3*(this.ht/2.54-60):0},get adjBW(){return this.age<18?0:this.ht>0&&this.wt>0&&this._sex?this.wt<=this.ibw?this.wt:.4*(this.wt-this.ibw)+this.ibw:0},get overUnder(){return this.age<18?0:this.ht>0&&this.wt>0&&this._sex&&this.adjBW>0?100*(this.wt/this.ibw-1):0},get lbw(){return this.age<18?0:this.ht>0&&this.wt>0&&this._sex?"F"===this.sex?9270*this.wt/(8780+244*this.bmi):9270*this.wt/(6680+216*this.bmi):0},get cgActual(){return this.wt>0&&this.age>0&&this.scr>0&&this._sex?this.cg(this.wt):0},get cgAdjusted(){return this.adjBW>0&&this.age>0&&this.scr>0?this.cg(this.adjBW):0},get cgIdeal(){return this.ibw>0&&this.age>0&&this.scr>0?this.cg(this.ibw):0},get crcl(){return this.age<18?this.schwartz:0===this.ibw||0===this.age||0===this.scr?0:this.wt<this.ibw?this.cgActual:this.overUnder>30?this.cgAdjusted:this.cgIdeal},cg(e){return(140-this.age)*e/(72*this.scr)*("F"===T.sex?.85:1)},set schwartzK(e){return 0===this.age||this.age>=18||this.age>=13&&0===this.sex?this._schwartzK=0:this.age<=1?this._schwartzK=0===e?.45:.33:this.age>=13&&"M"===this.sex?this._schwartzK=.7:this._schwartzK=.55,this._schwartzK},get schwartzK(){return this._schwartzK||0},get schwartz(){const e=this.schwartzK;return 0===e||0===this.ht||0===this.scr?0:e*this.ht/this.scr}};const C={patientData(){$(".outCrCl").removeClass("use-this"),T.age=$("#ptage").val(),T.sex=$("#sex").val(),T.ht=+$("#height").val(),T.wt=+$("#weight").val(),T.scr=+$("#scr").val(),T.schwartzK=$("#schwartz-k-infant")[0].selectedIndex,(0,s.AI)("#schwartz-crcl",T.schwartz,.1," mL/min"),(0,s.AI)("#ibw",T.ibw,.1," kg"),(0,s.AI)("#overUnder",T.overUnder,.1,"%","",!0),(0,s.AI)("#adjBW",T.adjBW,.1," kg"),(0,s.AI)("#lbw",T.lbw,.1," kg"),(0,s.AI)("#bmi",T.bmi,.1," kg/m²"),T.bmi>30?($("#alert--bayesian").removeClass("alert-secondary").addClass("alert-warning"),$("#bmi").addClass("text-danger font-weight-bold")):($("#alert--bayesian").removeClass("alert-warning").addClass("alert-secondary"),$("#bmi").removeClass("text-danger font-weight-bold")),(0,s.AI)("#cgIdeal",T.cgIdeal,.1," mL/min"),(0,s.AI)("#cgActual",T.cgActual,.1," mL/min"),(0,s.AI)("#cgAdjusted",T.cgAdjusted,.1," mL/min"),T.cgAdjusted>0&&(T.wt<T.ibw?$("#cgActual").addClass("use-this"):T.overUnder>30?$("#cgAdjusted").addClass("use-this"):$("#cgIdeal").addClass("use-this"));let e=$("#hd")[0],t=$("#vancoIndication")[0];T.hd=e.selectedIndex,T.vancoIndication=t.selectedIndex,k.pt=[[["Age",(0,s.AI)("",T.age,.01," years")],["Sex",0===T.sex?"":T.sex],["Weight",(0,s.AI)("",T.wt,1e-4," kg")],["Height",(0,s.AI)("",T.ht,1e-4," cm")],["SCr",(0,s.AI)("",T.scr,1e-4," mg/dL")],["Dialysis",e.options[T.hd].innerHTML]]],"adult"===T.ageContext?(k.pt.push([["Ideal body weight",(0,s.AI)("",T.ibw,.1," kg")],["Over/Under IBW",(0,s.AI)("",T.overUnder,.1,"%","",!0)],["Adjusted body weight",(0,s.AI)("",T.adjBW,.1," kg")],["Lean body weight",(0,s.AI)("",T.lbw,.1," kg")],["Body mass index",(0,s.AI)("",T.bmi,.1," kg/m²")]]),k.pt.push([["CrCl (C-G Actual)",(0,s.AI)("",T.cgActual,.1," mL/min")],["CrCl (C-G Ideal)",(0,s.AI)("",T.cgIdeal,.1," mL/min")],["CrCl (C-G Adjusted)",(0,s.AI)("",T.cgAdjusted,.1," mL/min")],["CrCl (Protocol)",(0,s.AI)("",T.crcl,.1," mL/min")]])):k.pt.push([["Body mass index",(0,s.AI)("",T.bmi,.1," kg/m^2")],["CrCl (Schwartz)",(0,s.AI)("",T.schwartz,.1," mL/min")]]),$("#tape--pt").html(f(k.pt,"Patient Info"))},syncCurrentDFT(e){T.curDose=(0,s.wS)(+$(`#${e}-curDose`).val(),v.vc.check.doseMin,v.vc.check.doseMax),T.curFreq=(0,s.wS)(+$(`#${e}-curFreq`).val(),v.vc.check.freqMin,v.vc.check.freqMax),T.curTrough=(0,s.wS)(+$(`#${e}-curTrough`).val(),v.vc.check.levelMin,v.vc.check.levelMax),$(".current-dose").filter($(`:not(.input-${e})`)).val(T.curDose>0?T.curDose:""),$(".current-freq").filter($(`:not(.input-${e})`)).val(T.curFreq>0?T.curFreq:""),$(".current-trough").filter($(`:not(.input-${e})`)).val(T.curTrough>0?T.curTrough:"")},vancoInitial(){$("#vancoInitialLoad").html(v.AZ({ht:T.ht,wt:T.wt,age:T.age,sex:T.sex,bmi:T.bmi,hd:T.hd,vancoIndication:T.vancoIndication}));const{doseMin:e,doseMax:t,freqMin:a,freqMax:i}=v.vc.check,{maintText:n,freq:o}=v.ZZ({age:T.age,wt:T.wt,ibw:T.ibw,scr:T.scr,hd:T.hd,indication:T.vancoIndication,crcl:T.crcl});$("#vancoInitialMaintenance").html(n);let c="";n.length>0&&(c=/^Must order/.test(n)?n:`<b>Calculated weight-based dose is</b> <br>${n}<br><b>but Bayesian calculator should be used instead for obese patients.</b>`),$("#tooltip--vanco-md-bayesian").attr("data-original-title",c),n.length>0&&T.bmi>30&&0===T.hd?($("#row--vanco-md-default").css("display","none"),$("#row--vanco-md-bayesian").css("display","flex")):($("#row--vanco-md-default").css("display","flex"),$("#row--vanco-md-bayesian").css("display","none"));const{monitoring:l,targetLevelText:h,pkParam:d,targetMin:u,targetMax:g,goalTroughIndex:m}=v.n4({freq:o,hd:T.hd,crcl:T.crcl,scr:T.scr,bmi:T.bmi,indication:T.vancoIndication,age:T.age});$("#vancoInitialMonitoring").html(l),$("#vancoInitialTargetLevel").html(h),m>=0&&($("#revision-goalTrough")[0].selectedIndex=m);const p=(0,s.wS)(+$("#vancoInitialPK-dose").val(),e,t),f=(0,s.wS)(+$("#vancoInitialPK-interval").val(),a,i);let{arrDose:w,arrViable:b,arrLevel:I,vd:k,ke:x,pkLevel:C,pkRecLevel:A,pkRecDose:D,pkFreq:M,pkRecFreq:y,pkHalflife:L,pkLevelRowHeading:q,pkLevelUnits:F,pkLevelLabel:S}=v.f({method:d,crcl:T.crcl,age:T.age,scr:T.scr,sex:T.sex,wt:T.wt,bmi:T.bmi,goalMin:u,goalMax:g,selDose:p,selFreq:f});(0,s.AI)("#vancoInitialPK-halflife",L,.1," hrs"),(0,s.AI)("#vancoInitialPK-recDose",D,1," mg"),(0,s.AI)("#vancoInitialPK-recFreq",y,.1," hrs"),$("#vancoInitialPK-recLevel-label").html(S),$("#vancoInitialPK-level-label").html(S),(0,s.AI)("#vancoInitialPK-recLevel",A,.1,F),(0,s.AI)("#vancoInitialPK-level",C,.1,F);const U=this.createVancoTable({rows:[{title:"Dose",data:w,roundTo:1,units:" mg"},{title:"Frequency",data:M,units:" hrs"},{title:q,data:I,roundTo:.1}],highlightColumns:b});$("#vancoInitialPK-table").html(U);let j=[[S,[]]];for(let e=0;e<w.length;e++)j[0][1].push([`${w[e]} mg q${M}h`,r(["9999.99",(0,s.AI)("",I[e],.1,F)],0)[1]])},vancoRevision(){const e=$("#revision-goalTrough")[0],{goalmin:t,goalmax:a,goaltrough:i}=e.options[e.selectedIndex].dataset,{doseMin:n,doseMax:r,freqMin:o,freqMax:c}=v.vc.check,l=(0,s.wS)(+$("#revision-linearTestDose").val(),n,r),h=(0,s.wS)(+$("#revision-linearTestFreq").val(),o,c),d=(0,s.wS)(+$("#revision-pkTestDose").val(),n,r),u=(0,s.wS)(+$("#revision-pkTestFreq").val(),o,c),g=(0,s.wS)($("#revision-curTroughTime").val(),0,c,!0),{linearDose:m,linearFreq:p,linearTrough:f,testLinearDose:w,testLinearFreq:b,testLinearTrough:I}=v.QX({curDose:T.curDose,curFreq:T.curFreq,curTrough:T.curTrough,testDose:l,testFreq:h,goalTrough:i});$("#revision-linearDose").html(0===m?"":`${(0,s.RW)(m,1)} mg q ${p} h`),A("#revision-linearDoseChange",m,p),(0,s.AI)("#revision-linearTrough",f,.1," mcg/mL"),A("#revision-testLinearDoseChange",w,b),(0,s.AI)("#revision-testLinearTrough",I,.1," mcg/mL");const{halflife:k,newDose:x,newFreq:C,newTrough:D,newViable:M,recDose:y,recTrough:L,recFreq:q,selTrough:F,selDose:S,selFreq:U}=v.tr({bmi:T.bmi,wt:T.wt,curDose:T.curDose,curFreq:T.curFreq,curTrough:T.curTrough,troughTime:g,goalTrough:i,goalMin:t,goalMax:a,goalPeak:35,selFreq:u,selDose:d});T.adjHalflife=k,(0,s.AI)("#revision-halflife",k,.1," hours"),$("#revision-pkDose").html(0===y?"":`${(0,s.RW)(y,1)} mg q ${(0,s.RW)(q,.1)} h`),A("#revision-pkDoseChange",y,q),(0,s.AI)("#revision-pkTrough",L,.1," mcg/mL"),A("#revision-pkTestDoseChange",S,U),(0,s.AI)("#revision-pkTestTrough",F,.1," mcg/mL"),this.vancoSteadyStateCheck();const j=this.createVancoTable({rows:[{title:"Maint. dose",data:x,roundTo:1,units:" mg"},{title:"Interval",data:C,units:" hrs"},{title:"Est. Trough (mcg/mL)",data:D,roundTo:.1}],highlightColumns:M});$("#revision-pkTable").html(j),$("#vancoHdAdj").html(v.kQ({wt:T.wt,trough:T.curTrough}))},vancoSteadyStateCheck(){const e=(0,s.Fc)($("#steadystate-dateFirst").val(),$("#steadystate-timeFirst").val()),t=(0,s.Fc)($("#steadystate-dateTrough").val(),$("#steadystate-timeTrough").val());if(0!==e&&0!==t&&T.adjHalflife>0){const a=(0,s.Cs)(e,t),i=(0,s.RW)(a/T.adjHalflife,.1);$("#steadystate-timeDiff").html(`${(0,s.RW)(a,.1)} hrs&nbsp;&nbsp;&nbsp;(${i} ${1===i?"half-life":"half-lives"})`),$("#steadystate-atSS").html((i<4?"Not at":"At")+" steady state.")}else $("#steadystate-atSS").html(""),$("#steadystate-timeDiff").html("")},vancoAUCDates(){const e=$("#aucDates-sameInterval").is(":checked"),t=(0,s.Fc)($("#aucDates-doseDate-1").val(),$("#aucDates-doseTime-1").val()),a=e?t:(0,s.Fc)($("#aucDates-doseDate-2").val(),$("#aucDates-doseTime-2").val()),i=(0,s.Fc)($("#aucDates-troughDate").val(),$("#aucDates-troughTime").val()),n=(0,s.Fc)($("#aucDates-peakDate").val(),$("#aucDates-peakTime").val()),r=(0,s.RW)((0,s.wS)((0,s.Cs)(t,i),0,48),.1),o=(0,s.RW)((0,s.wS)((0,s.Cs)(a,n),0,48),.1);(0,s.AI)("#aucDates-troughResult",r,.1),(0,s.AI)("#aucDates-peakResult",o,.1)},vancoAUC(e=!0){let t={dose:T.curDose,interval:T.curFreq,peak:(0,s.wS)(+$("#auc-curPeak").val(),v.vc.check.levelMin,v.vc.check.levelMax),peakTime:(0,s.wS)(+$("#vancoAUCPeakTime").val(),v.vc.check.timeMin,v.vc.check.timeMax),troughTime:(0,s.wS)(+$("#vancoAUCTroughTime").val(),v.vc.check.timeMin,v.vc.check.timeMax),trough:T.curTrough};const a=v.XE(t),i=void 0===a?0:a.auc24,n=(void 0===a||a.oldInterval,void 0===a?0:a.goalTroughLow),o=void 0===a?0:a.goalTroughHigh;(0,s.AI)("#vancoAUC24",i||0,.1);const c=void 0===a?"":`${(0,s.RW)(n,.1)} &ndash; ${(0,s.RW)(o,.1)} mcg/mL`;$("#vancoAUCTroughGoal").html(c),""!==$("#vancoAUC24").html()&&$("#vancoAUC24").append(` (${a.therapeutic})`),e&&""!==$("#vancoCurrentInterval")&&void 0!==a&&$("#vancoAUCNewInterval").val(a.oldInterval);const l=(0,s.wS)(+$("#vancoAUCNewInterval").val(),v.vc.check.freqMin,v.vc.check.freqMax),h=v.uz(a,l),d=this.createVancoTable({rows:[{title:"Maint. dose",data:h.dose,units:" mg"},{title:"Predicted AUC",data:h.auc,roundTo:.1},{title:"Est. Trough (mcg/mL)",data:h.trough,roundTo:.1}],highlightColumns:h.therapeutic});$("#aucTable").html(d);let u=[["Predicted AUC (est. trough) for New Dose",[]]];for(let e=0;e<h.dose.length;e++)u[0][1].push([`${h.dose[e]} mg q${l}h`,`${r(["9999.99",(0,s.RW)(h.auc[e],.1)],0)[1]} (${(0,s.RW)(h.trough[e],.1)} mcg/mL)`]);if(void 0!==a){const e=$("#aucDates-apply").hasClass("datesApplied");if(k.auc=[[["Current dose",`${t.dose} mg q${t.interval}h`],["Peak level",(0,s.AI)("",t.peak,.1," mcg/mL")],["Trough level",(0,s.AI)("",t.trough,.1," mcg/mL")],["Time to peak",(0,s.AI)("",t.peakTime,.01," hrs")],["Time to trough",(0,s.AI)("",t.troughTime,.01," hrs")]],[["Vd",(0,s.AI)("",a.vd,.01," L")],["Infusion time",(0,s.AI)("",60*a.tInf,1," min")],["ke",(0,s.AI)("",a.ke,1e-4," hr^-1")],["Halflife",(0,s.AI)("",a.halflife,.1," hr")],["True peak",(0,s.AI)("",a.truePeak,.1," mcg/mL")],["True trough",(0,s.AI)("",a.trueTrough,.1," mcg/mL")],["AUC (inf)",(0,s.AI)("",a.aucInf,.1)],["AUC (elim)",(0,s.AI)("",a.aucElim,.1)]],[["AUC24",`${(0,s.AI)("",a.auc24,.1)} (${a.therapeutic})`],["Trough goal",`${(0,s.RW)(a.goalTroughLow,.1)} &ndash; ${(0,s.RW)(a.goalTroughHigh,.1)} mcg/mL`]]],e){const e=$("#aucDates-sameInterval").is(":checked"),t=[];t.push(["Drawn in same interval?",e?"Yes":"No"]),t.push([e?"Dose before levels":"Dose before trough",(0,s.Po)((0,s.Fc)($("#aucDates-doseDate-1").val(),$("#aucDates-doseTime-1").val()))]),t.push(["Trough time",(0,s.Po)((0,s.Fc)($("#aucDates-troughDate").val(),$("#aucDates-troughTime").val()))]),e||t.push(["Dose before peak",(0,s.Po)(e?dateTimeInputs.troughDose:(0,s.Fc)($("#aucDates-doseDate-2").val(),$("#aucDates-doseTime-2").val()))]),t.push(["Peak time",(0,s.Po)((0,s.Fc)($("#aucDates-peakDate").val(),$("#aucDates-peakTime").val()))]),k.auc.unshift(t)}$("#tape--auc").html(f(k.auc,"AUC Dosing Calculation")),$("#tape--auc").append(f(u))}else k.auc=[],$("#tape--auc").html("")},vancoTwolevel(e=!0){const{levelMin:t,levelMax:a,freqMin:i,freqMax:n,doseMin:r,doseMax:o}=v.vc.check,c=(0,s.Fc)($("#twolevelDate1").val(),$("#twolevelTime1").val()),l=(0,s.Fc)($("#twolevelDate2").val(),$("#twolevelTime2").val()),h=(0,s.wS)(+$("#twolevelLevel1").val(),t,a),d=(0,s.wS)(+$("#twolevelLevel2").val(),t,a);let u=-1;if(0!==c&&0!==l&&h>0&&d>0){const e=(0,s.Cs)(c,l);u=Math.log(h/d)/e}const g=e?0:(0,s.wS)(+$("#twolevelInterval").val(),i,n),{pkDose:m,pkFreq:p,pkTrough:f,halflife:w,newPeak:b,newTrough:I,newViable:k,newDose:x}=v.Ik({wt:T.wt,bmi:T.bmi,ke:u,selectedInterval:g});(0,s.AI)("#twolevelHalflife",w,.1," hours"),(0,s.AI)("#twolevelNewDose",m,1," mg"),e&&$("#twolevelInterval").val(0===p?"":p),(0,s.AI)("#twolevelNewTrough",f,.1," mcg/mL");const C=this.createVancoTable({rows:[{title:"Maint. dose",data:x,units:" mg"},{title:"Interval",data:p,units:" hrs"},{title:"Est. Trough (mcg/mL)",data:I,roundTo:.1}],highlightColumns:k});$("#twolevelTable").html(C)},createVancoTable({rows:e,highlightColumns:t}={}){let a="";if(0===e[0].data.length)return"";for(let i of e){a+=`<tr><th scope="row">${i.title}</th>`,void 0===i.units&&(i.units=""),void 0===i.roundTo&&(i.roundTo=-1);for(let e=0;e<v.vc.doses.length;e++){let n="";Array.isArray(i.data)?i.data.length>0&&(n=i.data[e]):n=i.data;let r="";Array.isArray(t)&&t.length>0&&t[e]&&(r="isTherapeutic"),a+=`<td class="${r}">${(0,s.AI)("",n,i.roundTo,i.units)}</td>`}a+="</tr>"}return`<tbody>${a}</tbody>`},secondDose(){const e=(0,s.aD)($("#seconddose-time1").val());let t=$("[name='seconddose-freq']:checked")[0].id;t=t.replace("seconddose-","");const a=(0,l.H)({fd:e,freqId:t});void 0===a?($(".output[id^='seconddose']").html(""),$("#seconddose-row-1").show()):(a.forEach(((e,t)=>{$(`#seconddose-text-${t}`).html(`${e.hours} hours (${e.diff} hours ${e.direction})`),e.times.forEach(((e,a)=>{$(`#seconddose-${t}-${a}`).html(e)}))})),1===a.length?$("#seconddose-row-1").hide():$("#seconddose-row-1").show())},ivig(){const e=(0,s.wS)(+$("#ivig-dose").val()),t=$("#ivig-product")[0].selectedIndex;$("#ivig-text").html(c.getText(t,T.wt,e))}};function A(e,t=0,a=0){let i=(0,s.wS)(t),n=(0,s.wS)(a),r=24/T.curFreq*T.curDose,o="";if(i>0&&n>0&&T.curDose>0&&T.curFreq>0){let t=(24/n*i-r)/r;o=0===t?"&nbsp;&nbsp;&nbsp;":t<0?"&darr;&nbsp;&nbsp;":"&uarr;&nbsp;&nbsp;",$(e).html(o+(0,s.RW)(Math.abs(100*t),.1)+"%"),$(e).css("background-color",function(e){let t=[];return t=(e=Math.abs(e))>=35?[248,105,107]:e<20?[100,221,67]:e<=30?[Math.floor(100+(e-20)/10*155),Math.floor(221+(e-20)/10*14),Math.floor(67+(e-20)/10*65)]:[Math.ceil(255-(e-30)/5*7),Math.ceil(235-(e-30)/5*130),Math.ceil(132-(e-30)/5*25)],`rgb(${t[0]}, ${t[1]}, ${t[2]})`}(Math.abs(100*t)))}else $(e).html(""),$(e).css("background-color","#f2f7fa");return e}},"./js/nextdose.js":function(){const e=[{name:"daily",resultMap:[0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],resultText:["Give first dose now and repeat at 2100 daily.","Give first dose now and repeat at 0900 daily."]},{name:"bid",resultMap:[0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],resultText:["Give first dose now and repeat at 0900.","Give first dose now and repeat at 2100."]},{name:"bidac",resultMap:[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2],resultText:["Give first dose at 0700.","Give first dose at 1600.","Give first dose at 0700 tomorrow."]},{name:"bidcc",resultMap:[0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2],resultText:["Give first dose at 0800.","Give first dose at 1700.","Give first dose at 0800."]},{name:"bidpc",resultMap:[0,0,0,0,0,0,0,0,0,1,2,2,2,2,3,3,3,3,3,4,4,4,4,4],resultText:["Hold until 0900 if able, or give first dose now with snack and repeat at 1800.","Give first dose at 0900","Give first dose after lunch, repeat at 1800.","Give first dose at 1800","Hold until 0900 if able, or give first dose now with snack and repeat at 0900."]},{name:"tidac",resultMap:[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3],resultText:["Give first dose at 0700.","Give first dose at 1100.","Give first dose at 1600.","Not specified"]},{name:"tidcc",resultMap:[0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3,3,3],resultText:["Give first dose with a snack now and repeat at 0800.","Give first dose now and repeat at 1200.","Give first dose now and repeat at 1700.","Give first dose with dinner or a snack now and repeat at 0800."]},{name:"tidpc",resultMap:[0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3,3],resultText:["Give first dose now and repeat at 0900.","Give first dose now and repeat at 1300.","Give first dose now and repeat at 1800.","Give first dose with dinner or a snack now and repeat at 0900."]},{name:"q8h",resultMap:[2,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2],resultText:["Give first dose now and repeat at 1300.","Give first dose now and repeat at 2100.","Give first dose now and repeat at 0500."]},{name:"q6h",resultMap:[0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,0,0,0],resultText:["Give first dose now and repeat at 0600.","Give first dose now and repeat at 1200.","Give first dose now and repeat at 1800.","Give first dose now and repeat at 0000."]}];$("input.radio--nextdose").on("change",(()=>{const t=$('input[name="nextdose-freq"]:checked').val(),a=+$('input[name="nextdose-time"]:checked').val();if($(".btn-group--nextdose-time > label").removeClass("highlighted"),void 0!==t&&$(`.st-${t}`).addClass("highlighted"),!isNaN(a)&&void 0!==t){$("#nextdose-result").show();const s=e.filter((e=>e.name===t))[0];$("#nextdose-result").html(s.resultText[s.resultMap[a]])}}))},"./js/pca.js":function(e,t,a){"use strict";a.r(t);var s=a("./js/util.js");$("#pca-drug, #pca-orderset").on("change",(function(){const e=$("#pca-drug")[0].value,t=$("#pca-orderset")[0].value;"morphine"===e?"standard"===t?d=n:"high"===t&&(d=r):"hydromorphone"===e?"standard"===t?d=o:"high"===t&&(d=c):"fentanyl"===e&&("standard"===t?d=l:"high"===t&&(d=h));const a=d.getLimitHtml();$("#pca-pumplimit-dose").html(a[0]),$("#pca-pumplimit-rate").html(a[1]),$("#pca-pumplimit-max").html(a[2]),$("#pca-syringe").html(`${d.name} ${d.syringe}`),$(".pca-units").html(d.unit),$(".pca-unitsPerOneHour").html(d.unitRate),$(".pca-unitsPerHours").html(d.unitMax),g()})),$("#pca-continuous").on("change",(function(){u=$("#pca-continuous")[0].value,"overnight"!==u?$(".pca-ci-night").hide():$(".pca-ci-night").show();"none"===u?$(".pca-ci-only").hide():$(".pca-ci-only").show();g()})),$(".input-pca").on("keyup",g);class i{constructor(e,t,a,s,i){this.name=e,this.range=t,this.unit=a,this.conc=s,this.limits=i}get syringe(){return`${30*this.conc} ${this.unit}/30 mL`}get unitRate(){return`${this.unit}/hr`}get unitMax(){return"standard"===this.range?`${this.unit}/4 hr`:"high"===this.range?`${this.unit}/hr`:void 0}get maxDoseTimespan(){return"standard"===this.range?4:"high"===this.range?1:void 0}get mgPerSyr(){return 30*this.conc}getLimit(e){switch(e){case"doseUSL":return this.limits[0];case"doseUHL":return this.limits[1];case"rateUSL":return this.limits[2];case"rateUHL":return this.limits[3];case"maxUSL":return this.limits[4];case"maxUHL":return this.limits[5];default:return 0}}getLimitHtml(){return[`${this.getLimit("doseUSL")}-<b>${this.getLimit("doseUHL")} ${this.unit}</b>`,`${this.getLimit("rateUSL")}-<b>${this.getLimit("rateUHL")} ${this.unitRate}</b>`,`${this.getLimit("maxUSL")}-<b>${this.getLimit("maxUHL")} ${this.unitMax}</b>`]}}const n=new i("morphine","standard","mg",1,[4,5,2,3,30,60]),r=new i("morphine","high","mg",5,[5,6,5,20,100,100]),o=new i("hydromorphone","standard","mg",1,[1,2,.5,1,8,20]),c=new i("hydromorphone","high","mg",2,[2,4,3,10,20,40]),l=new i("fentanyl","standard","mcg",20,[20,50,40,50,300,500]),h=new i("fentanyl","high","mcg",50,[50,100,50,400,300,750]);let d=n,u="none";function g(){$(".pca-bg-warning").removeClass("pca-bg-warning"),$(".pca-bg-danger").removeClass("pca-bg-danger"),$(".pca-bg-error").removeClass("pca-bg-error");const e=(0,s.wS)($("#pca-bolusDose").val(),.01,300),t=(0,s.wS)($("#pca-lockout").val(),1,240),a=(0,s.wS)($("#pca-orderedMax").val(),.1,2e3),i="none"===u?0:(0,s.wS)($("#pca-ciRate").val(),.01,1e3,!0),n=d.maxDoseTimespan,r=d.mgPerSyr,o=(d.unit,` ${d.unitMax}`),c=0===t?0:60/t*n*e;(0,s.AI)("#pca-maxFromBolus",c,.1,o),(0,s.AI)("#pca-maxFromBolus2",c,.1,o);const l="continuous"===u?i*n:0,h=("none"!==u?i*n:0)||0;(0,s.AI)("#pca-amtFromCI",h,.1,o),"night"===u&&h>0?$("#pca-amtFromCI-day").html("---"):$("#pca-amtFromCI-day").html("");const g=l+c;(0,s.AI)("#pca-totalAmtPossible-day",g,.1,o);const v=h+c;(0,s.AI)("#pca-totalAmtPossible-night",v,.1,o);const m=r/g*n;(0,s.AI)("#pca-maxDispenseFreq-day",m,.1," hr");const p=r/v*n;(0,s.AI)("#pca-maxDispenseFreq-night",p,.1," hr");let f=a-l,w=a-h;f<=0&&a>0?($("#pca-availableForBolus-day").html("max &le; CI").addClass("pca-bg-error"),f=0):(0,s.AI)("#pca-availableForBolus-day",f,.1,o),w<=0&&a>0?($("#pca-availableForBolus-night").html("max &le; CI").addClass("pca-bg-error"),w=0):(0,s.AI)("#pca-availableForBolus-night",w,.1,o);const b=a>0?60/(f/n/e):0,I=a>0?60/(w/n/e):0;f<e&&a>0?$("#pca-averageFreq-day").html("---").addClass("pca-bg-error"):((0,s.AI)("#pca-averageFreq-day",b,.1," min","q "),t>0&&b>t&&$("#pca-averageFreq-day").addClass("pca-bg-warning")),w<e&&a>0?$("#pca-averageFreq-night").html("---").addClass("pca-bg-error"):((0,s.AI)("#pca-averageFreq-night",I,.1," min","q "),t>0&&I>t&&$("#pca-averageFreq-night").addClass("pca-bg-warning"));const k=r/a*n;(0,s.AI)("#pca-maxDispenseFreq-final",k,.1," hr"),function(e,t,a,s){for(let i=0;i<=e.length;i++)e[i]>a[i]?$(s[i]).addClass("pca-bg-danger"):e[i]>t[i]&&$(s[i]).addClass("pca-bg-warning")}([e,i,a],[d.getLimit("doseUSL"),d.getLimit("rateUSL"),d.getLimit("maxUSL")],[d.getLimit("doseUHL"),d.getLimit("rateUHL"),d.getLimit("maxUHL")],["#pca-pumplimit-dose","#pca-pumplimit-rate","#pca-pumplimit-max"])}},"./js/seconddose.js":function(e,t,a){"use strict";a.d(t,{H:function(){return i}});const s=[{id:"q6vanco",interval:6,startHour:5},{id:"q8",interval:8,startHour:5},{id:"q12vanco",interval:12,startHour:[5,9]},{id:"q24vanco",interval:24,startHour:[5,9,13,17,21]}];function i({fd:e="",freqId:t}={}){if(""===e)return;e=parseFloat(e.slice(-2))/60+parseFloat(e.slice(0,-2));const{timeArray:a,interval:i}=function(e){let{interval:t,startHour:a}=s.filter((t=>e===t.id))[0];Array.isArray(a)||(a=[a]);let i=[];const n=24/t*2+2;return a.forEach((e=>{let a=e;for(let e=0;e<n;e++)i.push(a),a+=t})),i.sort(((e,t)=>e<t?-1:1)),{timeArray:i,interval:t}}(t),n=a.filter((t=>t>e)),r=n.map((t=>(t-e)/2)),o=r.map((t=>e+t)),c=r.map((e=>i-e));let l,h,d=1/0,u=1/0,g=!1;c.forEach(((e,t)=>{Math.abs(e)<=.25&&!g?(d=e,u=e,l=t,h=t,g=!0):e>0&&!g?e<d&&(d=e,l=t):e<0&&!g&&e>-u&&(u=e,h=t)}));let v=[{hours:Math.abs(Math.round(4*r[l])/4),diff:Math.round(4*c[l])/4,_times:[e,o[l],n[l]]}];return g||v.push({hours:Math.abs(Math.round(4*r[h])/4),diff:Math.round(4*c[h])/4,_times:[e,o[h],n[h]]}),v.forEach((e=>{e.units=1===e.hours?"hour":0===e.diff?"":"hours",e.direction=e.diff<0?"late":0===e.diff?"":"early",e.diff=Math.abs(e.diff),e.times=e._times.map((e=>{let t=Math.round(4*e)/4%24,a=Math.floor(t);return t=Math.round(60*(t-a)),`${("0"+a).slice(-2)}:${("0"+t).slice(-2)}`})),delete e._times})),v}}},function(e){e.O(0,["vendor","js_vanco_js"],(function(){return t="./js/main.js",e(e.s=t);var t}));e.O()}]);