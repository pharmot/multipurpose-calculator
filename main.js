/*!
  * VMFH Pharmacy Multipurpose Calculator v0.4.0
  * Copyright 2020-2021 Andy Briggs (https://github.com/pharmot)
  * Licensed under MIT (https://github.com/pharmot/multipurpose-calculator/LICENSE)
  */

$ = require('jquery');
import 'bootstrap';
import "./scss/main.scss";
import { displayDate, displayValue, checkValue, roundTo, getDateTime, getHoursBetweenDates, checkTimeInput } from './js/util.js'
import { default as ivig } from './js/ivig.js';
import { childIsObese } from './js/growthCharts.js';
import { getSecondDose } from './js/seconddose.js';
import { default as arial } from './js/arial.js';
let debug = false;
let debugDefaultTab = "auc";

let tape = {};

$(()=>{
  $('[data-toggle="popover"]').popover({html: true});
  $('[data-toggle="tooltip"]').tooltip()

  if ( /debug/.test(location.search) ) {
    debug = true;
  } else if ( /log/.test(location.search) ) {
    LOG.enable();
  }

  if ( debug ){
    $("#ptage").val(60);
    $("#sex").val('M');
    $("#height").val(170.2);
    $("#weight").val(83.1);
    $("#scr").val(0.9);
    $("#vancoAUCPeakTime").val(5);
    $("#vancoAUCTroughTime").val(11.5);

    $("#auc-curPeak").val(40);
    $("#auc-curTrough").val(11);
    $("#auc-curDose").val(1000);
    $("#auc-curFreq").val(12);

    $("#twolevelDate1").val("2021-01-16");
    $("#twolevelDate2").val("2021-01-16");
    $("#twolevelTime1").val("0000");
    $("#twolevelTime2").val("1500");
    $("#twolevelLevel1").val(20);
    $("#twolevelLevel2").val(12);

    $("#revision-curDose").val(1000);
    $("#revision-curFreq").val(12);
    $("#revision-curTrough").val(11);
    $("#revision-curTroughTime").val(0.5);
    LOG.enable();
    const triggerElement = document.querySelector(`#nav-${debugDefaultTab}-tab`);
    // const tab = new bootstrap.Tab(triggerElement)
    // tab.show();
    vanco.syncCurrentDFT("revision");
    calculate.patientData();
    calculate.vancoInitial();
    calculate.vancoRevision();
    calculate.vancoAUC();
  } else {
    resetDates();
  }

  for ( let item of formValidation ) {
    $(item.selector).on("focus", e => {
      $(e.target).removeClass("invalid");
    })
    if ( item.max ) {
      $( item.selector ).on("focusout", e => {
        if( $( e.target ).val() !== "" ) {
          validateRange(e.target, item);
        }
      });
    } else if ( item.match ) {
      $(item.selector).on("focusout", e => {
        if( $(e.target).val() !== "" ) {
          validateMatch(e.target, item);
        }
      });
    } else if (item.validator) {
      $(item.selector).on("focusout", e => {
        if( $(e.target).val() !== "" ) {
          item.validator(e.target, item);
        }
      })
    }
  }
  $('#ptage').get(0).focus();
});

$(".input-patient").on('keyup', () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});
$('#ptage').on('keyup', () => {
  setTimeout(()=> {
    $("#top-container").removeClass('age-adult age-child age-infant');
    $("#top-container").addClass(`age-${pt.ageContext}`);
  }, 1000);
});

$("#vancoIndication").on('change', () => {
  calculate.patientData();
  calculate.vancoInitial();
});
$("#hd").on("change", (e) => {
  const hd = e.target.selectedIndex;
  $("#top-container").removeClass('hd-0 hd-1 hd-2 hd-3 hd-4');
  $("#top-container").addClass(`hd-${hd}`);

  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
})

$(".input-initialPK").on('keyup', () => {
  calculate.vancoInitial();
});

$(".input-auc").on('keyup', () => {
  vanco.syncCurrentDFT("auc");
  calculate.vancoAUC();
  calculate.vancoRevision();
});

$(".input-auc-interval").on('keyup', () => {
  calculate.vancoAUC(false);
});

$("#auc-reset").on('click', () => {
  calculate.vancoAUC();
});

$('#btnShowInitialPk').on('click', () => {
  $('#row--initialPkAlert').hide(50, "linear");
  $('#row--initialPkCalc').addClass('show');
});

$(".input-revision").on('keyup', () => {
  vanco.syncCurrentDFT("revision");
  calculate.vancoRevision();
  calculate.vancoAUC();
});

$(".input-aucDates").on('keyup', () => {
  calculate.vancoAUCDates();
});

$(".input-twolevel").on('keyup', () => {
  calculate.vancoTwolevel();
});

$(".input-twolevel-interval").on('keyup', () => {
  calculate.vancoTwolevel(false);
});

$("#twolevel-reset").on('click', () => {
  calculate.vancoTwolevel();
});

$("#schwartz-k-infant").on('change', () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});

$(".input-steadystate").on('keyup', () => {
  calculate.vancoSteadyStateCheck();
});

$("#seconddose-time1").on("keyup", () => {
  calculate.secondDose();
});

$("[name='seconddose-freq']").on("change", () => {
  calculate.secondDose();
});

$("#revision-goalTrough").on("change", () => {
  calculate.vancoRevision();
});

$("#btnReset").on('click', () => {
  $("input").val("");
  vanco.syncCurrentDFT('revision');
  resetDates();
  ($("#hd")[0]).selectedIndex = 0;
  ($("#vancoIndication")[0]).selectedIndex = 0;
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
  calculate.vancoTwolevel();
  calculate.secondDose();
  calculate.ivig();
  $("#top-container").removeClass('age-adult age-child age-infant');
  $("#top-container").addClass('age-adult');
  // $('#aucLinear-desiredMin').val(400);
  // $('#aucLinear-desiredMin').val(600);
  $('#ptage').get(0).focus();

});

$("#ivig-product").on("change", () => {
  calculate.ivig();
});
$("#weight").on("keyup", () => {
  calculate.ivig();
});
$("#ivig-dose").on("keyup", ()=>{
  calculate.ivig();
});

$("#aucDates-sameInterval").on("change", (e) => {
  const tr = document.getElementById('aucDates-row--trough');
  const pk = document.getElementById('aucDates-row--peak');
  const spacer = document.getElementById('aucDates-row--spacer');
  const last = document.getElementById('aucDates-row--last');
  const par = tr.parentNode;
  if ( e.target.checked ){
    $("#aucDates-label--dose1").html("Dose prior to levels");
    par.insertBefore(pk, tr);
    par.insertBefore(tr, spacer);
    $("#aucDates-row--dose2").hide();
  } else {
    $("#aucDates-label--dose1").html("Dose before trough");
    $("#aucDates-row--dose2").show();
    par.insertBefore(tr, pk);
    par.insertBefore(pk, spacer);
  }
  calculate.vancoAUCDates();
});

$("#aucDates-apply").on('click', ()=> {
  $('#vancoAUCPeakTime').val($('#aucDates-peakResult').html());
  $('#vancoAUCTroughTime').val($('#aucDates-troughResult').html());
  $('#aucDatesModal').modal('hide');
});



/**
 * Resets date input fields to today's date.
 */
function resetDates(){
  const today = new Date();
  $(".dt-date").val(`${today.getFullYear()}-${('0' + (today.getMonth()+1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}`);
}

let pt = {
  config: {
    check: {
      wtMin: 1,
      wtMax: 300,
      htMin: 60,
      htMax: 250,
      ageMin: 0.25, // minimum 3 months old
      ageMax: 120,
      scrMin: 0.1,
      scrMax: 20
    }
  },
  set sex(x){
    this._sex = /^[MmFf]$/.test(x) ? x.toUpperCase() : 0;
  },
  get sex(){ return this._sex || 0; },
  set wt(x){ this._wt = checkValue(x, this.config.check.wtMin, this.config.check.wtMax); },
  get wt(){ return this._wt || 0; },
  set ht(x){ this._ht = checkValue(x, this.config.check.htMin, this.config.check.htMax); },
  get ht(){ return this._ht || 0; },
  set age(x){
    if ( /^\d+ *[Dd]$/.test(x) ) {
      const days = +x.replace(/ *d */gi, '');
      this._age = days/365.25;
    } else if ( /^\d+ *[Mm]$/.test(x) ) {
      const months = +x.replace(/ *m */gi, '');
      this._age = months/12;
    } else if ( /^\d+ *[Mm]\d+ *[Dd]$/.test(x) ) {
      let arrAge = x.split('m');
      arrAge[1] = arrAge[1].replace('d', '');
      this._age = arrAge[0]/12 + arrAge[1]/365.25;
    } else {
      this._age = checkValue(x, this.config.check.ageMin, this.config.check.ageMax);
    }
  },
  get age(){ return this._age || 0; },
  get ageContext(){
    if ( this.age < 1 && this.age > 0 ) return 'infant';
    if ( this.age < 18 && this.age !== 0 ) return 'child';
    return 'adult';
  },
  set scr(x){
    this._scr = checkValue(x, this.config.check.scrMin, this.config.check.scrMax);
  },
  get scr(){ return this._scr || 0; },
  get bmi() {
    if ( this.wt > 0 && this.ht > 0 ) {
      return this.wt / (( this.ht / 100 )**2);
    }
    return 0;
  },
  get ibw(){
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      return ( this.sex === "M" ? 50 : 45.5 ) + 2.3 * ( this.ht / 2.54 - 60 );
    }
    return 0;
  },
  get adjBW(){
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      if ( this.wt <= this.ibw ) return this.wt;
      return 0.4 * (this.wt - this.ibw) + this.ibw;
    }
    return 0;
  },
  get overUnder(){
    if ( this.ht > 0 && this.wt > 0 && this._sex && this.adjBW > 0 ) {
      return (this.wt / this.ibw - 1) * 100
    }
    return 0;
  },
  get lbw(){
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      if ( this.sex === "F" ) {
        return 9270 * this.wt / ( 8780 + 244 * this.bmi )
      }
      return 9270 * this.wt / ( 6680 + 216 * this.bmi )
    }
    return 0;
  },
  get cgActual(){
    if ( this.wt > 0 && this.age > 0 && this.scr > 0 && this._sex ) {
      return this.cg(this.wt);
    }
    return 0;
  },
  get cgAdjusted(){
    if ( this.adjBW > 0 && this.age > 0 && this.scr > 0 ) {
      return this.cg(this.adjBW);
    }
    return 0;
  },
  get cgIdeal(){
    if ( this.ibw > 0 && this.age > 0 && this.scr > 0 ) {
      return this.cg(this.ibw);
    }
    return 0;
  },
  get crcl(){
    if ( this.age < 18 ) return this.schwartz;
    if ( this.ibw === 0 || this.age === 0 || this.scr === 0 ) return 0;
    if ( this.wt < this.ibw ) return this.cgActual;
    if ( this.overUnder > 30 ) return this.cgAdjusted;
    return this.cgIdeal;
  },
  cg(weight){
    return (140 - this.age) * weight / (this.scr * 72) * (pt.sex === "F" ? 0.85 : 1);
  },
  set schwartzK(term){
    if ( this.age === 0 || this.age >= 18 || ( this.age >= 13 && this.sex === 0 ) ) {
      this._schwartzK = 0;
    } else if ( this.age <= 1 ) {
      this._schwartzK = term === 0 ? 0.45 : 0.33;
    } else if ( this.age >= 13 && this.sex === "M" ) {
      this._schwartzK = 0.7;
    } else {
      this._schwartzK = 0.55
    }
    return this._schwartzK;
  },
  get schwartzK(){
    return this._schwartzK || 0;
  },
  get schwartz(){
    const k = this.schwartzK;
    if ( k === 0 || this.ht === 0 || this.scr === 0 ) return 0;
    return ( k * this.ht ) / this.scr;
  }
};
const vanco = {
  config: {
    doses: [500, 750, 1000, 1250, 1500, 1750, 2000],
    load: {
      def: { low: 25, high: 25, max: 3000 },
      sepsis: { low: 25, high: 35, max: 3000 },
      hd: { low: 25, high: 25, max: 3000 },
      pd: { low: 25, high: 25, max: 2000 },
      crrt: { low: 20, high: 25, max: 3000 },
      sled: { low: 20, high: 25, max: 3000 }
    },
    maxHDDose: 2000,
    maxPDDose: 2000,
    maxDailyDose: 4500,
    aucLowNormal: 400,
    aucHighNormal: 600,
    check: {
      doseMin: 250,
      doseMax: 3000,
      freqMin: 6,
      freqMax: 48,
      levelMin: 3,
      levelMax: 100,
      timeMin: 0,
      timeMax: 36
    }
  },
  roundDose(dose, age = 18){
    if ( age >= 18 ) return roundTo(dose, 250);
    const rounded = roundTo(dose, 25);
    if ( rounded >= 250 ) return roundTo(dose, 250);
    return roundTo(dose, 25);
  },
  getInfusionTime(dose) {
    if ( dose > 2500 ) return 3;
    if ( dose > 2000 ) return 2.5;
    if ( dose > 1500 ) return 2;
    if ( dose > 1000 ) return 1.5;
    return 1;
  },
  /**
   * Calculate halflife from ke
   * @param   {Number} ke    elimination rate constant
   * @returns {Number}       halflife in hours
   */
  getHalflife(ke){
    return Math.log(2) / ke;
  },
  getKe(cl, vd) {
    return cl / vd;
  },
  getPeakAndTrough({dose, ke, inf, vd, interval} = {}){
    if ( dose === 0 || ke === 0 || inf === 0 || vd === 0 || interval === 0 ) return 0;
    const peak = dose * (1 - Math.exp(-ke * inf)) / (inf * vd * ke * (1 - Math.exp(-ke * interval)));
    const trough = peak * Math.exp(-ke * (interval - inf));
    return {p: peak, tr: trough};
  },
  getInitialVd(){
    if ( pt.bmi === 0 ) return 0;
    if ( pt.bmi >= 40 ) return pt.wt * 0.5;
    return pt.wt * 0.7;
  },
  getVd({bmi, wt} = {}){
    if ( bmi === 0 ) return 0;
    if ( bmi >= 40 ) return wt*0.5;
    return wt * 0.7;
  },
  /**
   * Get the per-protocol recommended initial maintenance dose range.
   *
   * @param   {number}   age                       patient age in years
   * @param   {number}   indication                selectedIndex of indication list
   * @param   {number}   crcl                      CrCl to use for dosing
   * @param   {number}   hd                        selectedIndex of HD status
   * @returns {object}   res
   * @returns {number}   res.low                   low end of dose range
   * @returns {number}   res.high                  high end of dose range
   * @returns {number}   res.lowDailyPeds          low end of dose range (per day - for peds)
   * @returns {number}   res.highDailyPeds         high end of dose range (per day - for peds)
   * @returns {number}   res.consider              consider dosing closer to this end of range
   * @returns {number[]} res.freqs                 two choices of frequency
   * @returns {number}   res.freq                  frequency  (this *or* the below property)
   * @returns {string}   res.freqText              string frequency if number frequency is not applicable
   * @returns {number}   res.maxDaily              max daily dose    (one or the other of this or below)
   * @returns {number}   res.maxDose               max single dose
   * @returns {string}   res.maxDoseExceededText   text to append if dose exceeds max single dose
   * @returns {string}   res.textBeforeDose        text to prepend
   */
  getMaintenanceDoseRange({age, indication, crcl, hd} = {}){
    if ( age < 12 && hd === 0 ) {
      return {
        lowDailyPeds: 60,
        highDailyPeds: 80,
        freqs: [6]
      }
    }
    if ( age < 18 && hd === 0 ) {
      return {
        lowDailyPeds: 60,
        highDailyPeds: 70,
        freqs: [6, 8]
      }
    }
    const { maxDailyDose, maxHDDose, maxPDDose } = this.config;
    if ( hd === 0 ) {
      let res = { low: 15, high: 20, maxDaily: maxDailyDose };
      if ( crcl >= 90 ) {
        if ( age < 25 ) {
          res.low = 20;
          res.freq = 8;
          return res;
        }
        res.freq = age > 40 ? 12 : 8;
      } else if ( crcl >= 50 ) {
        res.freq = 12;
      } else if ( crcl >= 20 ) {
        res.freq = 24;
      } else if ( crcl >= 10 ) {
        res.freq = 48;
      } else {
        res.freqText = 'x 1 and consider checking level in 24-48 hours.<br>Repeat dose when level &le;10-20 mcg/mL.'
      }
      if ( indication === 1 ) {
        res.consider = 15;
      }
      return res;
    }
    if ( pt.hd === 1 ) { // HD
      return {
        low: 10,
        high: 10,
        freqText: 'after each HD',
        maxDose: maxHDDose,
        maxDoseExceededText: `[max ${maxHDDose} mg initial dose for HD]`
      };
    }
    // PD
    if ( pt.hd === 2 ) return { // PD
      low: 10,
      high: 15,
      freqText: 'when random level &lt;&nbsp;15&nbsp;mcg/mL<br>Check first random level with AM labs ~48&nbsp;hrs after load.',
      maxDose: maxPDDose,
      maxDoseExceededText: `[max ${maxPDDose} mg initial dose for PD]`
    }
    if ( pt.hd === 4 ) return { // SLED
      low: 15,
      high: 20,
      freqText: 'after SLED session ends (or in last 60-90&nbsp;minutes)',
      maxDaily: maxDailyDose
    };
    return { // CVVH/CVVHD/CVVHDF
      low: 7.5,
      high: 10,
      freq: 12,
      textBeforeDose: 'Check random level q12h until &lt; 20 mcg/mL, then start ',
      maxDaily: maxDailyDose
    };
  },
  loadingDose(){
    if ( pt.ht === 0 || pt.wt === 0 || pt.age === 0 ) return '';
    // Pediatric loading dose
    if ( pt.age < 18 ) {
      if ( childIsObese({age: pt.age, sex: pt.sex, bmi: pt.bmi}) ) {
        const load = this.roundDose(20*pt.wt, pt.age);
        return `Consider loading dose of ${load} mg<br><i>(BMI &ge; 95th percentile for age)</i>`;
      }
      return 'Loading dose not recommended in non-obese pediatric patients';
    }
    // Adult loading dose
    if ( pt.hd === 0) {
      if ( pt.vancoIndication === 2 && pt.bmi < 30 ) {
        this._load = this.config.load.sepsis;
      } else {
        this._load = this.config.load.def;
      }
    } else if ( pt.hd === 1 ) {
      this._load = this.config.load.hd;
    } else if ( pt.hd === 2 ) {
      this._load = this.config.load.pd;
    } else if ( pt.hd === 3 ) {
      this._load = this.config.load.crrt;
    } else if ( pt.hd === 4 ) {
      this._load = this.config.load.sled;
    }

    let d1 = roundTo(this._load.low * pt.wt, 250);
    let d2 = roundTo(this._load.high * pt.wt, 250);
    const bmiText = ( pt.bmi >= 30 && pt.vancoIndication === 2 && pt.hd === 0 ) ? " for BMI &ge; 30" : "";
    let result = `<br><i>(${this._load.low}${this._load.low === this._load.high ? "" : (" - " + this._load.high)} mg/kg)${bmiText}`;
    if (d1 > this._load.max || d2 > this._load.max) {
      if ( pt.hd === 2 ) {
        result += ` [Max ${this._load.max} mg for PD]`;
      } else {
        result += ` [Max ${this._load.max} mg]`;
      }
      d1 = Math.min(d1, this._load.max);
      d2 = Math.min(d2, this._load.max);
    }
    return (d1 === d2 ? `${d1} mg` : `${d1} - ${d2} mg`) + result + "</i>";
  },
  getMaintenanceDose({age, wt, ibw, scr, hd, indication, crcl} = {}){
    if ( ibw === 0 || age === 0 ) return { maintText: '', freq: 0 };
    if ( scr === 0 && hd === 0 ) return { maintText: 'Must order SCr before maintenance dose can be calculated', freq: 0 };
    let {
      low = 0,
      high = 0,
      lowDailyPeds = 0,
      highDailyPeds = 0,
      lowMg = 0,
      highMg = 0,
      freq = 0,
      freqs = [],
      freqText = '',
      textBeforeDose = '',
      consider = 0,
      considerText = '',
      maxDaily = 0,
      maxDose = 0
    } = this.getMaintenanceDoseRange({
      age: age,
      indication: indication,
      crcl: crcl,
      hd: hd
    });

    if ( age < 18 ) {
      let pedsMaint = '';
      freqs.forEach( (f, i) => {
        if ( i > 0 ) {
          pedsMaint += `<b> <i>or</i></b> `
        }
        let lowDailyPedsMg = Math.min(lowDailyPeds * wt, 3000);
        let highDailyPedsMg = Math.min(highDailyPeds * wt, 3000);
        let lowSingleDose = this.roundDose( lowDailyPedsMg / ( 24 / f ), age );
        let highSingleDose = this.roundDose( highDailyPedsMg / ( 24 / f ), age );
        if ( lowSingleDose < highSingleDose ){
          pedsMaint += `${lowSingleDose}-`
        }
        pedsMaint += `${highSingleDose} mg q${f}h`
      });
      const pedsFreqText = freqs.length > 1 ? `${freqs[0]}-${freqs[1]}` : freqs[0];
      pedsMaint += `<br><i>(${lowDailyPeds}-${highDailyPeds} mg/kg/day divided q${pedsFreqText}h)</i>`;
      return {
        maintText: pedsMaint,
        freq: 0
      }
    };

    let lowDose = lowMg > 0 ? lowMg : this.roundDose(wt * low, age),
        highDose = highMg > 0 ? highMg : this.roundDose(wt * high, age),
        lowDaily = 0,
        highDaily = 0,
        txtExceeds = '',
        txtMaxDose = '',
        txtDose = '';

    if ( freq > 0 ) {
      lowDaily = lowDose * ( freq / 24 );
      highDaily = highDose * ( freq / 24 );
      freqText = `q${freq}h`
    }
    if ( maxDose > 0 ) {
      if ( lowDose > maxDose || highDose > maxDose ) {
        lowDose = Math.min(lowDose, maxDose);
        highDose = Math.min(highDose, maxDose);
        txtExceeds = `[Max ${maxDose} mg]`;
      }
    }
    if ( maxDaily > 0 ) {
      if ( lowDaily > maxDaily ) {
        txtExceeds = `<br>***Protocol exceeds ${maxDaily/1000} g/day***`;
      } else if ( highDaily > maxDaily ) {
        txtExceeds = `<br>***Upper range of protocol exceeds ${maxDaily/1000} g/day***`;
      }
    }
    if ( consider > 0 && lowDose !== highDose ) {
      considerText = `<br><i>Consider dosing closer to ${lowDose} mg.</i>`;
    }
    if ( lowDose !== highDose ) {
      txtDose = `${lowDose} - `;
    }
    return {
      maintText: `${textBeforeDose}${txtDose}${highDose} mg ${freqText} ${considerText}${txtExceeds}`,
      freq: freq
    };
  },
  getMonitoringRecommendation( {freq, hd, crcl, scr, bmi, indication, age } = {} ){

    const goals = {
      auc: {
        param: 'trough', // for initial PK dosing.  Currently only using trough-based.  Change to 'auc' for intial auc dosing instead.
        min: 10, // change to 400 for initial auc dosing.
        max: 20, // change to 600 for initial auc dosing.
        text: 'AUC:MIC 400-600&nbsp;mcg&middot;hr/mL',
        goalTroughIndex: 0,
        monitoring: 'Draw levels for AUC calculation when at steady state<br><span class="semibold">(if therapy anticipated to be &gt;&nbsp;72&nbsp;hours)</span>'
      },

      pedsAuc: {
        param: 'trough',
        min: 10,
        max: 15,
        text: 'AUC:MIC 400-600&nbsp;mcg&middot;hr/mL',
        goalTroughIndex: 1
      },
      hdTrough: {
        param: 'trough',
        min: 15,
        max: 20,
        text: 'Trough 15-20&nbsp;mcg/mL',
        goalTroughIndex: 2
      },
      pedsTrough: {
        param: 'trough',
        min: 10,
        max: 15,
        text: 'Trough 10-15&nbsp;mcg/mL (unless kinetic outlier)',
        goalTroughIndex: 1
      },
      adultTrough: {
        param: 'trough',
        min: 10,
        max: 20,
        text: 'Trough 10-20&nbsp;mcg/mL (unless kinetic outlier)',
        goalTroughIndex: 0,
        monitoring: 'Initial trough level when at steady state (before 4th dose, including load)<br><span class="semibold">(if therapy anticipated to be &gt;&nbsp;72&nbsp;hours)</span>'
      }
    }
    let res = {
      monitoring: '',
      targetLevelText: '',
      pkParam: '',
      targetMin: 0,
      targetMax: 0,
      goalTroughIndex: -1
    };
    if ( age > 0 && age < 18 ) {
      res.monitoring = 'Initial trough level when at steady state<br>(if therapy anticipated to be &gt;&nbsp;72&nbsp;hours)';
      if ( indication === 2 ) {
        res.monitoring += '<br>Consider first level within 24-48 hours if serious MRSA infection';
      }
      if ( indication === 1 ) {
        res.targetLevelText = goals.pedsTrough.text;
        res.targetMin = goals.pedsTrough.min;
        res.targetMax = goals.pedsTrough.max;
        res.pkParam = goals.pedsTrough.param;
        res.goalTroughIndex = goals.pedsTrough.goalTroughIndex;
      } else {
        res.targetLevelText = goals.pedsAuc.text;
        res.targetMin = goals.pedsAuc.min;
        res.targetMax = goals.pedsAuc.max;
        res.pkParam = goals.pedsAuc.param;
        res.goalTroughIndex = goals.pedsAuc.goalTroughIndex;
      }
      return res;
    }


    if ( hd === 0 && crcl === 0 ) return res;
    if ( hd === 1 ) {
      return {
        monitoring: 'Draw level before every HD, starting with 2nd HD after load,<br>until 2 consecutive levels therapeutic.',
        targetLevelText: goals.hdTrough.text,
        targetMin: goals.hdTrough.min,
        targetMax: goals.hdTrough.max,
        pkParam: goals.hdTrough.param,
        goalTroughIndex: goals.hdTrough.goalTroughIndex
      }
    }
    if ( hd === 2 ) { // PD
      return {
        monitoring: 'Recheck random levels q24-48h, or as clinically indicated, and re-dose when level &lt; 15 mcg/mL',
        targetLevelText: goals.hdTrough.text,
        targetMin: goals.hdTrough.min,
        targetMax: goals.hdTrough.max,
        pkParam: goals.hdTrough.param,
        goalTroughIndex: goals.hdTrough.goalTroughIndex
      }
    }
    if ( hd === 4 ) { // SLED
      return {
        monitoring: 'Check trough levels before each SLED run<br><i>Use caution in basing maintenance dosing on serum concentration values</i>',
        targetLevelText: goals.hdTrough.text,
        targetMin: goals.hdTrough.min,
        targetMax: goals.hdTrough.max,
        pkParam: goals.hdTrough.param,
        goalTroughIndex: goals.hdTrough.goalTroughIndex
      }
    }
    if ( hd !== 0 ) { // CRRT
      return {
        monitoring: 'Check trough levels q24h',
        targetLevelText: goals.hdTrough.text,
        targetMin: goals.hdTrough.min,
        targetMax: goals.hdTrough.max,
        pkParam: goals.hdTrough.param,
        goalTroughIndex: goals.hdTrough.goalTroughIndex
      }
    }
    const lowCrCl = crcl < 50;
    const highSCr = scr >= 1.2;
    const highBMI = bmi > 30;
    const lowSCr = scr < 0.5;
    const earlyTroughReason = `${lowCrCl ? 'CrCl &lt; 50' : ''}${lowCrCl && highSCr ? ' and ' : ''}${highSCr ? 'SCr &ge; 1.2' : ''}`;

    if ( lowCrCl || highSCr ) {
      res.monitoring = `Consider pre-steady state level<br><i>(to spot check for clearance, for ${earlyTroughReason})</i>`;
    }

    if ( indication === 1 && ( scr >= 0.5 && bmi <= 30 ) ) {
      res.targetLevelText = goals.adultTrough.text;
      res.targetMin = goals.adultTrough.min;
      res.targetMax = goals.adultTrough.max;
      res.pkParam = goals.adultTrough.param;
      if ( res.monitoring === '' ) {
        res.monitoring = goals.adultTrough.monitoring;
      }
      res.goalTroughIndex = goals.adultTrough.goalTroughIndex;
    } else {
      res.targetLevelText = goals.auc.text;
      res.targetMin = goals.auc.min;
      res.targetMax = goals.auc.max;
      res.pkParam = goals.auc.param;
      if ( res.monitoring === '' ) {
        res.monitoring = goals.auc.monitoring;
      }
      res.goalTroughIndex = goals.auc.goalTroughIndex;
      if ( scr < 0.5 || bmi > 30 && indication === 1 ) {
        res.targetLevelText += `&nbsp;&nbsp;<i>(kinetic outlier)</i>`;
      }
    }
    return res;
  },
  getSuggestedInterval(halflife) {
    const h = checkValue(halflife);
    if ( h === 0 ) return 0;
    if ( h < 7 ) return 6;
    if ( h < 10 ) return 8;
    if ( h < 15 ) return 12;
    if ( h < 21 ) return 18;
    if ( h < 36 ) return 24;
    return 48;
  },
  getVCLCrass({age, scr, sex, wt} = {}){
    if ( age === 0 || sex === 0 || scr === 0 || wt === 0 ) return 0;
    const _sex = (sex === "M") ? 1 : 0;
    const cl = (9.656 - 0.078 * age) - (2.009 * scr) + (1.09 * _sex) + (0.04 * (wt**0.75));
    return cl;
  },
  getInitialDosing({method, crcl, age, scr, sex, wt, bmi, infTime = 1, goalMin, goalMax, selDose, selFreq } = {}){
    let res = {
      vd: 0,
      ke: 0,
      arrDose: [],
      arrViable: [],
      arrLevel: [],
      pkRecLevel: 0,
      pkLevel: 0,
      pkRecDose: 0,
      pkFreq: 0,
      pkRecFreq: 0,
      pkHalflife: 0,
      pkLevelRowHeading: '',
      pkLevelUnits: '',
      pkLevelLabel: 'Est. Level'
    };
    if ( crcl === 0 ) return res;
    res.vd = this.getVd({bmi: bmi, wt: wt});

    if ( method === 'trough') {
      res.pkLevelRowHeading = 'Est. Trough (mcg/mL)';
      res.pkLevelUnits = ' mcg/mL';
      res.pkLevelLabel = 'Est. Trough';
      res.ke = ( (0.695 * crcl + 0.05) * 0.06 ) / res.vd;
      res.pkHalflife = this.getHalflife(res.ke);
      res.pkRecFreq = this.getSuggestedInterval(res.pkHalflife);
      res.pkFreq = selFreq > 0 ? selFreq : res.pkRecFreq;
      let useDose = 0;

      let rec = {
        arrDose: [],
        arrLevel: [],
        arrViable: [],
        useDose: 0
      }

      this.config.doses.forEach( (d, i) => {
        rec.arrDose.push(d);
        const infTime = this.getInfusionTime(d);
        const {p, tr} = this.getPeakAndTrough({dose: d, ke: res.ke, inf: infTime, vd: res.vd, interval: res.pkRecFreq});
        rec.arrLevel.push(tr);
        rec.arrViable.push(tr >= goalMin && tr <= goalMax);
      });
      for (let i = 0; i < rec.arrViable.length; i++) {
        if ( rec.arrViable[i] ) {
          rec.useDose = i;
          break;
        }
      }
      res.pkRecLevel = rec.arrLevel[rec.useDose];
      res.pkRecDose = rec.arrDose[rec.useDose];





      this.config.doses.forEach( (d, i) => {
        res.arrDose.push(d);
        const infTime = this.getInfusionTime(d);
        const {p, tr} = this.getPeakAndTrough({dose: d, ke: res.ke, inf: infTime, vd: res.vd, interval: res.pkFreq});
        res.arrLevel.push(tr);
        res.arrViable.push(tr >= goalMin && tr <= goalMax);
      });
      for (let i = 0; i < res.arrViable.length; i++) {
        if ( res.arrViable[i] ) {
          useDose = i;
          break;
        }
      }
      if ( selDose > 0 && selFreq > 0 ){
        const newInfTime = this.getInfusionTime(selDose);
        const {p, tr} = this.getPeakAndTrough({dose: selDose, ke: res.ke, inf: newInfTime, vd: res.vd, interval: selFreq})
        res.pkLevel = tr;
        res.pkDose = selDose;
      }
    } else if ( method === 'auc') {
      // As per initial AUC dosing section of Epic Kinetics calculator.  Not currently used in this app.
      res.pkLevelRowHeading = 'Est. AUC<sub>24</sub>';
      res.pkLevelUnits = '';
      res.pkLevelLabel = 'Est. AUC<sub>24</sub>';
      const ke = (0.00083 * crcl) + 0.0044; // Matzke method

      res.pkHalflife = this.getHalflife(ke);
      const cl = bmi > 30 ? vd * ke : this.getVCLCrass({age: age, scr: scr, sex: sex, wt: wt});
      res.pkRecFreq = res.pkHalflife + infTime;
      res.pkRecLevel =  ( goalMin + goalMax ) / 2;
      const recTdd = cl * res.pkRecLevel;
      res.pkRecDose = recTdd * res.pkRecFreq/24;

      if ( selFreq !== 0 ) {
        res.pkFreq = selFreq;
        this.config.doses.forEach( (d, i) => {
          res.arrDose.push(d);
          const auc = ( d * (24/selFreq) ) / cl;
          res.arrLevel.push(auc);
          res.arrViable.push(auc >= goalMin && auc <= goalMax);
        });

        if ( selDose !== 0 ){
          res.pkLevel = ( selDose * (24/selFreq) ) / cl;
        }
      }
    }
    return res;
  },
  aucTherapeutic(auc){
    if ( auc === 0 ) return '';
    if ( auc < this.config.aucLowNormal ) return 'subtherapeutic';
    if ( auc > this.config.aucHighNormal ) return 'supratherapeutic';
    return 'therapeutic';
  },
  calculateAUC({dose = 0, interval = 0, trough = 0, peak = 0, troughTime = 0, peakTime = 0} = {}) {

    if( dose === 0 || interval === 0 ||
       trough === 0 || peak === 0 ||
       troughTime === 0 || peakTime === 0 )  return undefined;

       const tInf = this.getInfusionTime(dose);
       const ke = -Math.log(trough/peak)/(troughTime-peakTime);
       const truePeak = peak/(Math.exp(-ke*(peakTime-tInf)));
       const trueTrough = trough*Math.exp(-ke*(interval-troughTime));
       const aucInf = (truePeak+trueTrough)*tInf/2;
       const aucElim = (truePeak-trueTrough)/ke;
       const auc24 = (aucInf+aucElim)*24/interval;
       const vd = (dose/tInf)*(1-Math.exp(-ke*tInf))/(ke*(truePeak-(trueTrough*Math.exp(-ke*tInf))));
       const goalTroughLow = this.config.aucLowNormal * trueTrough / auc24;
       const goalTroughHigh = this.config.aucHighNormal * trueTrough / auc24;
       return {
         vd: vd,
         ke: ke,
         auc24: auc24,
         aucInf: aucInf,
         aucElim: aucElim,
         truePeak: truePeak,
         trueTrough: trueTrough,
         tInf: tInf,
         therapeutic: this.aucTherapeutic(auc24),
         oldDose: dose,
         oldInterval: interval,
         goalTroughLow: goalTroughLow,
         goalTroughHigh: goalTroughHigh
       };
     },
     calculateAUCNew(aucCurrent, interval){
       let res = {
         dose: [],
         auc: [],
         infTime: [],
         trough: [],
         peak: [],
         therapeutic: []
       };

       if ( interval === 0 || aucCurrent === undefined ) return res;

       const {vd, ke, auc24, therapeutic, oldDose, oldInterval} = aucCurrent;

       for (let dose of this.config.doses) {
         let infTime = this.getInfusionTime(dose);
         let auc = auc24*(dose*24/interval)/(oldDose*24/oldInterval);
         let peak = (dose/infTime)*(1-Math.exp(-ke*infTime))/(vd*ke*(1-Math.exp(-ke*interval)));
         let trough = peak*Math.exp(-ke*(interval-infTime));
         let thx = ( auc >= this.config.aucLowNormal && auc <= this.config.aucHighNormal ) ? true : false;
         res.dose.push(dose);
         res.auc.push(auc);
         res.infTime.push(infTime);
         res.trough.push(trough);
         res.peak.push(peak);
         res.therapeutic.push(thx);
       }
       return res;
     },
    syncCurrentDFT(src){
      pt.curDose = checkValue(+$(`#${src}-curDose`).val(), this.config.check.doseMin, this.config.check.doseMax);
      pt.curFreq = checkValue(+$(`#${src}-curFreq`).val(), this.config.check.freqMin, this.config.check.freqMax);
      pt.curTrough = checkValue(+$(`#${src}-curTrough`).val(), this.config.check.levelMin, this.config.check.levelMax);
      $(".current-dose").filter($(`:not(.input-${src})`)).val(pt.curDose > 0 ? pt.curDose : "");
      $(".current-freq").filter($(`:not(.input-${src})`)).val(pt.curFreq > 0 ? pt.curFreq : "");
      $(".current-trough").filter($(`:not(.input-${src})`)).val(pt.curTrough > 0 ? pt.curTrough : "");
    },
    getRoundedFrequency(freq){
      if ( freq === 0 ) return 0;
      if ( freq < 7 ) return 6;
      if ( freq < 10 ) return 8;
      if ( freq < 16 ) return 12;
      if ( freq < 21 ) return 18;
      if ( freq < 36 ) return 24;
      return 48;
    },
    getLinearAdjustment({curDose, curFreq, curTrough, testDose, testFreq, goalTrough} = {}){

      let res = {
        linearDose: 0,
        linearFreq: 0,
        linearTrough: 0,
        testLinearDose: 0,
        testLinearFreq: 0,
        testLinearTrough: 0,
      };
      if ( curDose === 0 || curFreq === 0 ) return res;

      if ( curTrough > 0 ) {
        res.linearDose = Math.floor((curDose / curTrough * goalTrough + 125) / 250) * 250;
        res.linearFreq = curFreq;
        res.linearTrough = res.linearDose / curDose * curTrough;
      }
      if ( testDose === 0 || testFreq === 0 ) return res;
      res.testLinearDose = testDose;
      res.testLinearFreq = testFreq;
      if ( curTrough > 0 ) {
        const oldTdd = curDose * (24/curFreq);
        const newTdd = testDose * (24/testFreq);
        res.testLinearTrough = curTrough * newTdd / oldTdd;
      }
      return res;
    },
    getSingleLevelAdjustment({bmi, wt, curDose, curFreq, curTrough, troughTime, goalTrough, goalMin, goalMax, goalPeak, selFreq, selDose} = {}){
      let res = {
        newDose: [],
        newFreq: 0,
        newTrough: [],
        newViable: [],
        recDose: 0,
        recTrough: 0,
        recFreq: 0,
        selTrough: 0,
        selFreq: 0,
        selDose: 0
      };
      if ( bmi === 0 || curDose === 0 || curTrough === 0 || curFreq === 0 || troughTime === undefined ) return res;
      const vd = this.getVd({bmi: bmi, wt: wt});
      const infTime = this.getInfusionTime(curDose);
      const ke = Math.log( ( ( curDose / vd ) + curTrough ) / curTrough ) / ( curFreq - troughTime );
      const estTrough = curTrough * Math.exp(-ke * troughTime);
      const estPeak = estTrough / Math.exp(-ke * ( curFreq - infTime - troughTime));
      res.halflife = this.getHalflife(ke);
      res.recFreq = this.getRoundedFrequency(infTime + ( Math.log(goalTrough/goalPeak) / -ke ));
      const arrDose = [];
      const arrTrough = [];
      const arrViable = [];
      let useDose = 0;

      this.config.doses.forEach( (d, i) => {
        const {p, tr} = this.getPeakAndTrough({dose: d, ke: ke, inf: this.getInfusionTime(d), vd: vd, interval: res.recFreq});
        arrDose.push(d);
        arrTrough.push(tr);
        arrViable.push(tr >= goalMin && tr <= goalMax);
      });
      for (let i = 0; i < arrViable.length; i++) {
        if (arrViable[i]) {
          useDose = i;
          break;
        }
      }
      res.recTrough = arrTrough[useDose];
      res.recDose = arrDose[useDose];
      res.newFreq = selFreq > 0 ? selFreq : res.recFreq;

      this.config.doses.forEach( (d, i) => {
        const {p, tr} = this.getPeakAndTrough({dose: d, ke: ke, inf: this.getInfusionTime(d), vd: vd, interval: res.newFreq});
        res.newDose.push(d);
        res.newTrough.push(tr);
        res.newViable.push(tr >= goalMin && tr <= goalMax);
      });

      if ( selDose > 0 && selFreq > 0 ){
        const {p, tr} = this.getPeakAndTrough({dose: selDose, ke: ke, inf: this.getInfusionTime(selDose), vd: vd, interval: selFreq});
        res.selDose = selDose;
        res.selFreq = selFreq;
        res.selTrough = tr;
      }
      return res;

    },
    calculateRevision({ke= 0, selectedInterval= 0, selectedDose = 0} = {}){
      let useDose = 0;
      const goalMin = 10;
      const goalMax = 20;
      const goal = 15;
      let res = {
        newDose: [],
        newPeak: [],
        newTrough: [],
        infTime: [],
        newViable: [],
        linearDose: 0,
        linearTrough: 0,
        pkDose: 0,
        pkFreq: 0,
        pkTrough: 0,
        halflife: 0
      };
      if ( ke < 0 ) return res;
      const vd = this.getInitialVd();
      // being called from twolevel section, we already know ke
      // otherwise must have dose/freq/trough/general info

      let halflife;
      let twolevel = false;

      // reset this in case info is now missing
      pt.adjHalflife = 0;

      if ( ke !== 0 ) {
        twolevel = true;
        halflife = getHalflife(ke);
      }


      if ( twolevel || ( pt.cgAdjusted > 0 && pt.curDose > 0 && pt.curFreq > 0 && pt.curTrough > 0 ) ) {

        // Calculate ke from current trough/dose/freq
        if ( !twolevel ) {
          const peak = pt.curTrough + pt.curDose / vd;
          ke = Math.log( peak / pt.curTrough ) / ( pt.curFreq - this.getInfusionTime(pt.curDose) );
          halflife = getHalflife(ke);
          pt.adjHalflife = halflife;
        }


    $("#revision-linearDose").html( linearDose === 0 ? "" : `${roundTo(linearDose, 1)} mg q ${linearFreq} h`);
    displayChange("#revision-linearDoseChange", linearDose, linearFreq);
    displayValue("#revision-linearTrough", linearTrough, 0.1, " mcg/mL");

    displayChange("#revision-testLinearDoseChange", testLinearDose, testLinearFreq);
    displayValue("#revision-testLinearTrough", testLinearTrough, 0.1, " mcg/mL");

    const { halflife, newDose, newFreq, newTrough, newViable, recDose, recTrough, recFreq, selTrough, selDose, selFreq } = vanco.getSingleLevelAdjustment({
      bmi: pt.bmi,
      wt: pt.wt,
      curDose: pt.curDose,
      curFreq: pt.curFreq,
      curTrough: pt.curTrough,
      troughTime: troughTime,
      goalTrough: goaltrough,
      goalMin: goalmin,
      goalMax: goalmax,
      goalPeak: 35,
      selFreq: selectedInterval,
      selDose: selectedDose
    });
    pt.adjHalflife = halflife;

        res.pkFreq = selectedInterval > 0 ? selectedInterval : this.getSuggestedInterval(halflife);
        res.halflife = halflife;

        // Calculate linear revision unless calculating two-level PK
        if ( !twolevel ) {
          res.linearDose = Math.floor((pt.curDose / pt.curTrough * goal + 125) / 250) * 250;
          res.linearTrough = res.linearDose / pt.curDose * pt.curTrough;
        }

        this.config.doses.forEach( (d, i) => {
          res.newDose.push(d);
          const infTime = this.getInfusionTime(d);
          res.infTime.push(infTime);
          const {p, tr} = this.getPeakAndTrough({dose: d, ke: ke, inf: infTime, vd: vd, interval: res.pkFreq});
          res.newPeak.push(p);
          res.newTrough.push(tr);
          res.newViable.push(tr >= goalMin && tr <= goalMax);
        });
        for (let i = 0; i < res.newViable.length; i++) {
          if (res.newViable[i]) {
            useDose = i;
            break;
          }
        }

        res.pkTrough = res.newTrough[useDose];
        res.pkDose = res.newDose[useDose];

        if ( selectedDose > 0 && selectedInterval > 0 ){
          const newInfTime = this.getInfusionTime(selectedDose);
          const {p, tr} = this.getPeakAndTrough({dose: selectedDose, ke: ke, inf: newInfTime, vd: vd, interval: res.pkFreq})
          res.pkTrough = tr;
          res.pkDose = selectedDose;
        }
      }
      return res;
    },
    hdRevision({wt, trough} = {}){
      if ( trough === 0 ) return '';
      if ( trough < 10 ) {
        if ( wt === 0 ) return "Reload with 25 mg/kg <br>and increase maintenance dose by 250-500 mg";
        const ld = Math.min(roundTo(25*wt, 250), this.config.load.hd.max);
        return `Reload with ${ld} mg<br> and increase maintenance dose by 250-500 mg`;
      }
      if ( trough < 15 ) return "Increase dose by 250-500 mg";
      if ( trough > 25 ) return "Hold x 1, recheck level prior to next<br>dialysis session and dose accordingly."
      if ( trough > 20 ) return "Decrease dose by 250-500 mg";
      return "Therapeutic - continue current dose";
    }
  }

/**
 * Functions called by event listeners to calculate and display results
 */
const calculate = {
  patientData(){
    // Remove highlighting on CrCls
    $(".outCrCl").removeClass("use-this");

    // Set pt properties from inputs
    pt.age = +$("#ptage").val();
    pt.sex = $("#sex").val();
    pt.ht = +$("#height").val();
    pt.wt = +$("#weight").val();
    pt.scr = +$("#scr").val();
    pt.schwartzK = $("#schwartz-k-infant")[0].selectedIndex;

    displayValue("#schwartz-crcl", pt.schwartz, 0.1, " mL/min");
    // Display weights and CrCl
    displayValue("#ibw", pt.ibw, 0.1, " kg");
    displayValue("#overUnder", pt.overUnder, 0.1, "%", '', true);
    displayValue("#adjBW", pt.adjBW, 0.1, " kg");
    displayValue("#lbw", pt.lbw, 0.1, " kg");
    displayValue("#bmi", pt.bmi, 0.1, " kg/m²");
    if ( pt.bmi > 30 ) {
      $("#alert--bayesian").removeClass("alert-secondary").addClass("alert-warning");
      $("#bmi").addClass("text-danger font-weight-bold")
    } else {
      $("#alert--bayesian").removeClass("alert-warning").addClass("alert-secondary");
      $("#bmi").removeClass("text-danger font-weight-bold")
    }
    displayValue("#cgIdeal", pt.cgIdeal, 0.1, " mL/min");
    displayValue("#cgActual", pt.cgActual, 0.1, " mL/min");
    displayValue("#cgAdjusted", pt.cgAdjusted, 0.1, " mL/min");
    // Highlight CrCl to use per protocol
    if ( pt.cgAdjusted > 0 ) {
      if ( pt.wt < pt.ibw ) {
        $("#cgActual").addClass("use-this");
      } else if ( pt.overUnder > 30 ) {
        $("#cgAdjusted").addClass("use-this");
      } else {
        $("#cgIdeal").addClass("use-this");
      }
    }

    let cboHD = $("#hd")[0];
    let cboIndication = $("#vancoIndication")[0];
    pt.hd = cboHD.selectedIndex;
    pt.vancoIndication = cboIndication.selectedIndex;
    tape.pt = [[
      ["Age", displayValue('', pt.age, 0.01, " years")],
      ["Sex", pt.sex === 0 ? "" : pt.sex],
      ["Weight", displayValue('', pt.wt, 0.0001, " kg")],
      ["Height", displayValue('', pt.ht, 0.0001, " cm")],
      ["SCr", displayValue('', pt.scr, 0.0001, " mg/dL")],
      ["Dialysis", cboHD.options[pt.hd].innerHTML]
    ]];
    if ( pt.ageContext === "adult" ){
      tape.pt.push([
        ["Ideal body weight", displayValue('', pt.ibw, 0.1, ' kg')],
        ["Over/Under IBW", displayValue('', pt.overUnder, 0.1, "%", '', true)],
        ["Adjusted body weight", displayValue('', pt.adjBW, 0.1, " kg")],
        ["Lean body weight", displayValue('', pt.lbw, 0.1, " kg")],
        ["Body mass index", displayValue('', pt.bmi, 0.1, " kg/m²")]
      ]);
      tape.pt.push([
        ["CrCl (C-G Actual)", displayValue('', pt.cgActual, 0.1, " mL/min")],
        ["CrCl (C-G Ideal)", displayValue('', pt.cgIdeal, 0.1, " mL/min")],
        ["CrCl (C-G Adjusted)", displayValue('', pt.cgAdjusted, 0.1, " mL/min")],
        ["CrCl (Protocol)", displayValue('', pt.crcl, 0.1, " mL/min")]
      ]);
    } else {
      tape.pt.push([
        ["Body mass index", displayValue('', pt.bmi, 0.1, " kg/m²")],
        ["CrCl (Schwartz)", displayValue('', pt.schwartz, 0.1, " mL/min")]
      ]);
    }
    $("#tape--pt").html(LOG.outputTape(tape.pt, "Patient Info"));
  },
  vancoInitial(){
    $("#vancoInitialLoad").html(vanco.loadingDose());
    const { doseMin, doseMax, freqMin, freqMax } = vanco.config.check;
    const { maintText, freq } = vanco.getMaintenanceDose({
      age: pt.age,
      wt: pt.wt,
      ibw: pt.ibw,
      scr: pt.scr,
      hd: pt.hd,
      indication: pt.vancoIndication,
      crcl: pt.crcl
    });
    $("#vancoInitialMaintenance").html(maintText);
    const { monitoring, targetLevelText, pkParam, targetMin, targetMax, goalTroughIndex } = vanco.getMonitoringRecommendation({
      freq: freq,
      hd: pt.hd,
      crcl: pt.crcl,
      scr: pt.scr,
      bmi: pt.bmi,
      indication: pt.vancoIndication,
      age: pt.age
    });

    $("#vancoInitialMonitoring").html(monitoring);
    $("#vancoInitialTargetLevel").html(targetLevelText);

    // Set goal trough selection on the single level tab
    if( goalTroughIndex >= 0 ) {
      $("#revision-goalTrough")[0].selectedIndex = goalTroughIndex;
    }

    const selectedDose = checkValue(+$("#vancoInitialPK-dose").val(), doseMin, doseMax);
    const selectedFrequency = checkValue(+$("#vancoInitialPK-interval").val(), freqMin, freqMax);

    let {
      arrDose,
      arrViable,
      arrLevel,
      vd,
      ke,
      pkLevel,
      pkRecLevel,
      pkRecDose,
      pkFreq,
      pkRecFreq,
      pkHalflife,
      pkLevelRowHeading,
      pkLevelUnits,
      pkLevelLabel
    } = vanco.getInitialDosing({
      method: pkParam,
      crcl: pt.crcl,
      age: pt.age,
      scr: pt.scr,
      sex: pt.sex,
      wt: pt.wt,
      bmi: pt.bmi,
      goalMin: targetMin,
      goalMax: targetMax,
      selDose: selectedDose,
      selFreq: selectedFrequency
    });

    displayValue("#vancoInitialPK-halflife", pkHalflife, 0.1, " hrs");
    displayValue("#vancoInitialPK-recDose", pkRecDose, 1, " mg");
    displayValue("#vancoInitialPK-recFreq", pkRecFreq, 0.1, " hrs");
    $("#vancoInitialPK-recLevel-label").html(pkLevelLabel);
    $("#vancoInitialPK-level-label").html(pkLevelLabel);
    displayValue("#vancoInitialPK-recLevel", pkRecLevel, 0.1, pkLevelUnits);
    displayValue("#vancoInitialPK-level", pkLevel, 0.1, pkLevelUnits);
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Dose", data: arrDose, roundTo: 1, units: " mg"},
      { title: "Frequency", data: pkFreq, units: " hrs"},
      { title: pkLevelRowHeading, data: arrLevel, roundTo: 0.1 }],
      highlightColumns: arrViable
    });
    $("#vancoInitialPK-table").html(tableHtml);

    let tableText = [[pkLevelLabel, []]];
    for ( let i = 0; i < arrDose.length; i++ ){
      tableText[0][1].push(
        [
          `${arrDose[i]} mg q${pkFreq}h`,
          arial.padArray(["9999.99", displayValue('', arrLevel[i], 0.1, pkLevelUnits)], 0)[1]
        ]
      )
    }
  },
  createVancoTable({rows, highlightColumns} = {}){
    let rowHtml = "";
    if ( rows[0].data.length === 0 ) return "";
    for( let row of rows ) {
      rowHtml += `<tr><th scope="row">${row.title}</th>`;
      if ( row.units === undefined ) { row.units = ""; }
      if ( row.roundTo === undefined ) { row.roundTo = -1; }
      for ( let i=0; i<vanco.config.doses.length; i++ ){
        let value = "";
        if ( Array.isArray(row.data) ) {
          if ( row.data.length > 0 ) { value = row.data[i] };
        } else {
          value = row.data;
        }
        let rowClass = "";
        if ( Array.isArray(highlightColumns) && highlightColumns.length > 0 ) {
          if ( highlightColumns[i] ) {
            rowClass = "isTherapeutic";
          }
        }
        rowHtml += `<td class="${rowClass}">${displayValue("", value, row.roundTo, row.units)}</td>`

      }
      rowHtml += `</tr>`
    }
    return `<tbody>${rowHtml}</tbody>`;
  },
  vancoRevision(){

    const cboGoal = $("#revision-goalTrough")[0];
    const { goalmin, goalmax, goaltrough } = cboGoal.options[cboGoal.selectedIndex].dataset;

    const { doseMin, doseMax, freqMin, freqMax } = vanco.config.check;
    const selectedLinearDose = checkValue(+$("#revision-linearTestDose").val(), doseMin, doseMax);
    const selectedLinearInterval = checkValue(+$("#revision-linearTestFreq").val(), freqMin, freqMax);
    const selectedDose = checkValue(+$("#revision-pkTestDose").val(), doseMin, doseMax);
    const selectedInterval = checkValue(+$("#revision-pkTestFreq").val(), freqMin, freqMax);
    const troughTime = checkValue($("#revision-curTroughTime").val(), 0, freqMax, true);
    //const goalTrough = $("#revision-goalTrough")[0].selectedIndex
    const { linearDose, linearFreq, linearTrough, testLinearDose, testLinearFreq, testLinearTrough } = vanco.getLinearAdjustment({
      curDose: pt.curDose,
      curFreq: pt.curFreq,
      curTrough: pt.curTrough,
      testDose: selectedLinearDose,
      testFreq: selectedLinearInterval,
      goalTrough: goaltrough
    });

    $("#revision-linearDose").html( linearDose === 0 ? "" : `${roundTo(linearDose, 1)} mg q ${linearFreq} h`);
    displayChange("#revision-linearDoseChange", linearDose, linearFreq);
    displayValue("#revision-linearTrough", linearTrough, 0.1, " mcg/mL");

    displayChange("#revision-testLinearDoseChange", testLinearDose, testLinearFreq);
    displayValue("#revision-testLinearTrough", testLinearTrough, 0.1, " mcg/mL");

    const { halflife, newDose, newFreq, newTrough, newViable, recDose, recTrough, recFreq, selTrough, selDose, selFreq } = vanco.getSingleLevelAdjustment({
      bmi: pt.bmi,
      wt: pt.wt,
      curDose: pt.curDose,
      curFreq: pt.curFreq,
      curTrough: pt.curTrough,
      troughTime: troughTime,
      goalTrough: goaltrough,
      goalMin: goalmin,
      goalMax: goalmax,
      goalPeak: 35,
      selFreq: selectedInterval,
      selDose: selectedDose
    });
    pt.adjHalflife = halflife;
    displayValue("#revision-halflife", halflife, 0.1, " hours");

    $("#revision-pkDose").html( recDose === 0 ? "" : `${roundTo(recDose, 1)} mg q ${roundTo(recFreq, 0.1)} h`);
    displayChange("#revision-pkDoseChange", recDose, recFreq);
    displayValue("#revision-pkTrough", recTrough, 0.1, " mcg/mL");

    displayChange("#revision-pkTestDoseChange", selDose, selFreq)
    displayValue("#revision-pkTestTrough", selTrough, 0.1, " mcg/mL");

    this.vancoSteadyStateCheck();

    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, roundTo: 1, units: " mg"},
      { title: "Interval", data: newFreq, units: " hrs"},
      { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable
    });
    $("#revision-pkTable").html(tableHtml);

    $("#vancoHdAdj").html(vanco.hdRevision({wt: pt.wt, trough: pt.curTrough}));
  },
  vancoSteadyStateCheck(){
    const firstDT = getDateTime($("#steadystate-dateFirst").val(), $("#steadystate-timeFirst").val());
    const troughDT = getDateTime($("#steadystate-dateTrough").val(), $("#steadystate-timeTrough").val());
    if ( firstDT !== 0 && troughDT !== 0 && pt.adjHalflife > 0 ) {
      const timeDiff = getHoursBetweenDates(firstDT, troughDT);
      const halflives = roundTo(timeDiff / pt.adjHalflife, 0.1);
      $("#steadystate-timeDiff").html(`${roundTo(timeDiff, 0.1)} hrs&nbsp;&nbsp;&nbsp;(${halflives} ${halflives === 1 ? 'half-life' : 'half-lives'})`);
      $("#steadystate-atSS").html(`${halflives < 4 ? "Not at" : "At"} steady state.`);
    } else {
      $("#steadystate-atSS").html("");
      $("#steadystate-timeDiff").html("");
    }
  },
  vancoAUCDates(){
    const sameInterval = $('#aucDates-sameInterval').is(':checked');
    const dose1 = getDateTime($('#aucDates-doseDate-1').val(), $('#aucDates-doseTime-1').val());
    const dose2 = sameInterval ? dose1 : getDateTime($('#aucDates-doseDate-2').val(), $('#aucDates-doseTime-2').val());
    const trough = getDateTime($('#aucDates-troughDate').val(), $('#aucDates-troughTime').val());
    const peak = getDateTime($('#aucDates-peakDate').val(), $('#aucDates-peakTime').val());

    const troughHrs = roundTo(checkValue(getHoursBetweenDates(dose1, trough), 0, 48), 0.1);
    const peakHrs = roundTo(checkValue(getHoursBetweenDates(dose2, peak), 0, 48), 0.1);

    displayValue("#aucDates-troughResult", troughHrs, 0.1);
    displayValue("#aucDates-peakResult", peakHrs, 0.1);
  },
  vancoAUC(resetInterval = true){
    let params = {
      dose: pt.curDose,
      interval: pt.curFreq,
      peak: checkValue(+$("#auc-curPeak").val(), vanco.config.check.levelMin, vanco.config.check.levelMax),
      peakTime: checkValue(+$("#vancoAUCPeakTime").val(), vanco.config.check.timeMin, vanco.config.check.timeMax),
      troughTime: checkValue(+$("#vancoAUCTroughTime").val(), vanco.config.check.timeMin, vanco.config.check.timeMax),
      trough: pt.curTrough
    };
    const aucCurrent = vanco.calculateAUC(params);
    const auc24 = aucCurrent === undefined ? 0 : aucCurrent.auc24;
    const oldInterval = aucCurrent === undefined ? 0 : aucCurrent.oldInterval;
    const goalTroughLow = aucCurrent === undefined ? 0 : aucCurrent.goalTroughLow;
    const goalTroughHigh = aucCurrent === undefined ? 0 : aucCurrent.goalTroughHigh;
    displayValue("#vancoAUC24", auc24 || 0, 0.1);
    const goalTrough = aucCurrent === undefined ? "" : `${roundTo(goalTroughLow, 0.1)} &ndash; ${roundTo(goalTroughHigh, 0.1)} mcg/mL`;
    $("#vancoAUCTroughGoal").html(goalTrough);
    if( $("#vancoAUC24").html() !== "" ) {
      $("#vancoAUC24").append(` (${aucCurrent.therapeutic})`);
    }
    if( resetInterval && $("#vancoCurrentInterval") !== "" && aucCurrent !== undefined ) {
      $("#vancoAUCNewInterval").val(aucCurrent.oldInterval);
    }
    // done with first step here, have outputted new interval, auc24
    const newInterval = checkValue(+$("#vancoAUCNewInterval").val(), vanco.config.check.freqMin, vanco.config.check.freqMax);
    const aucNew = vanco.calculateAUCNew(aucCurrent, newInterval);

    // create AUC table
    const tableHtml = this.createVancoTable({
      rows: [
        { title: "Maint. dose", data: aucNew.dose, units: " mg" },
        { title: "Predicted AUC", data: aucNew.auc, roundTo: 0.1 },
        { title: "Est. Trough (mcg/mL)", data: aucNew.trough, roundTo: 0.1}
      ],
      highlightColumns: aucNew.therapeutic
    });
    $("#aucTable").html(tableHtml);
    let tableText = [["Predicted AUC (est. trough) for New Dose", []]];
    for ( let i = 0; i < aucNew.dose.length; i++ ){
      tableText[0][1].push(
        [
          `${aucNew.dose[i]} mg q${newInterval}h`,
          `${arial.padArray(["9999.99", roundTo(aucNew.auc[i], 0.1)], 0)[1]} (${roundTo(aucNew.trough[i],0.1)} mcg/mL)`
        ]
      )
    }
    if ( aucCurrent !== undefined ) {
      tape.auc = [
        [
          ["Current dose", `${params.dose} mg q${params.interval}h`],
          ["Peak level", displayValue('', params.peak, 0.1, " mcg/mL")],
          ["Trough level", displayValue('', params.trough, 0.1, " mcg/mL")],
          ["Peak time", displayValue('', params.peakTime, 0.01, " hrs")],
          ["Trough time", displayValue('', params.troughTime, 0.01, " hrs")],
        ],
        [
          ["Vd", displayValue('', aucCurrent.vd, 0.01, " L")],
          ["Infusion time", displayValue('', 60 * aucCurrent.tInf, 1, ' min')],
          ["ke", displayValue('', aucCurrent.ke, 0.0001, ` hr^-1`)],
          ["True peak", displayValue('', aucCurrent.truePeak, 0.1, ' mcg/mL')],
          ["True trough", displayValue('', aucCurrent.trueTrough, 0.1, ' mcg/mL')],
          ["AUC (inf)", displayValue('', aucCurrent.aucInf, 0.1)],
          ["AUC (elim)", displayValue('', aucCurrent.aucElim, 0.1)],
        ],
        [
          ["AUC24", `${displayValue('', aucCurrent.auc24, 0.1)} (${aucCurrent.therapeutic})`],
          [
            `Trough goal`,
            `${roundTo(aucCurrent.goalTroughLow, 0.1)} &ndash; ${roundTo(aucCurrent.goalTroughHigh, 0.1)} mcg/mL`],
          ],
        ]
        $("#tape--auc").html(LOG.outputTape(tape.auc, "AUC Dosing Calculation"));
        $("#tape--auc").append(LOG.outputTape(tableText));
      } else {
        tape.auc = [];
        $("#tape--auc").html('');
      }
    },
  vancoTwolevel(resetInterval = true){
    const { levelMin, levelMax, freqMin, freqMax, doseMin, doseMax } = vanco.config.check;
    const time1 = getDateTime($("#twolevelDate1").val(), $("#twolevelTime1").val());
    const time2 = getDateTime($("#twolevelDate2").val(), $("#twolevelTime2").val());
    const level1 = checkValue(+$("#twolevelLevel1").val(), levelMin, levelMax);
    const level2 = checkValue(+$("#twolevelLevel2").val(), levelMin, levelMax);
    let ke = -1;
    if ( time1 !== 0 && time2 !== 0 && level1 > 0 && level2 > 0 ) {
      const timeDiff = getHoursBetweenDates(time1, time2);
      ke = Math.log(level1 / level2) / timeDiff;
    }
    const selectedInterval = resetInterval ? 0 : checkValue(+$("#twolevelInterval").val(), freqMin, freqMax);
    const { pkDose, pkFreq, pkTrough, halflife, newPeak, newTrough, newViable, newDose } = vanco.calculateRevision({ke: ke, selectedInterval: selectedInterval});
    displayValue("#twolevelHalflife", halflife, 0.1, " hours");
    displayValue("#twolevelNewDose", pkDose, 1, " mg");
    if ( resetInterval ) {
      $("#twolevelInterval").val(pkFreq === 0 ? "" : pkFreq);
    }
    displayValue("#twolevelNewTrough", pkTrough, 0.1, " mcg/mL");
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, units: " mg"},
      { title: "Interval", data: pkFreq, units: " hrs"},
      { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable
    });
    $("#twolevelTable").html(tableHtml);
  },
  secondDose(){
    const fd = checkTimeInput($("#seconddose-time1").val());
    let freqId = $("[name='seconddose-freq']:checked")[0].id;
    freqId = freqId.replace("seconddose-","");
    const sd = getSecondDose({fd: fd, freqId: freqId});
    if ( sd === undefined ) {
      $(".output[id^='seconddose']").html("");
      $("#seconddose-row-1").show();
    } else {
      sd.forEach( (me, i) => {
        $(`#seconddose-text-${i}`).html(`${me.hours} hours (${me.diff} hours ${me.direction})`);
        me.times.forEach( (time, j) => {
          $(`#seconddose-${i}-${j}`).html(time);
        });
      });
      if ( sd.length === 1 ) {
        $("#seconddose-row-1").hide();
      } else {
        $("#seconddose-row-1").show();
      }
    }
  },
  ivig(){
    const dose = checkValue(+$("#ivig-dose").val());
    const selected = $("#ivig-product")[0].selectedIndex;
    $("#ivig-text").html(ivig.getText(selected, pt.wt, dose));
  }
}

/**
 * Evaluates the value of an input field against minimum and maximum
 * values and adds or removes 'is-invalid' class from the input
 * element if the value is acceptable.
 *
 * @param   {HTMLElement}  el                DOM element
 * @param   {Number}      [min=-Infinity]    Minimum of acceptable range
 * @param   {Number}      [max=Infinity]     Maximum of acceptable range
 * @returns {HTMLElement}                    The original DOM element, for chaining
 */
function validate(el, min = -Infinity, max = Infinity ) {
  const value = $(el).val();
  const checked = checkValue(value, min, max);
  if( checked === 0 && value.length > 0 ) {
    $(el).addClass("is-invalid");
  } else {
    $(el).removeClass("is-invalid");
  }
  return el;
}

/**
 * Provides a color to highlight the percent change of total daily vancomycin dose.
 * Color stops are: red at 35%, yellow at 30%, and green at 20%
 * Values in between color stops are scaled using R, G, and B values
 *
 * @param   {Number} x  percent change (from -100 to 100)
 * @returns {String}    color as rgb(__, __, __)
 */
function colorScale(x) {
  let arr = [];
  x = Math.abs(x);
  if (x >= 35) {
    arr = [248, 105, 107];
  } else if (x < 20) {
    arr = [100, 221, 67];
  } else if (x <= 30) {
    arr = [
      Math.floor(100 + 155 * ((x - 20) / 10)),
      Math.floor(221 + 14 * ((x - 20) / 10)),
      Math.floor(67 + 65 * ((x - 20) / 10))
    ];
  } else {
    arr = [
      Math.ceil(255 - 7 * ((x - 30) / 5)),
      Math.ceil(235 - 130 * ((x - 30) / 5)),
      Math.ceil(132 - 25 * ((x - 30) / 5))
    ];
  }
  return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}

/**
 * Calculate halflife from ke
 *
 * @param   {Number} ke    elimination rate constant
 * @returns {Number}       halflife in hours
 */
function getHalflife(ke){
  return Math.log(2) / ke;
}

/**
 * From a proposed dose and frequency, calculate and display
 * the percent change from the patient's current total daily dose.
 *
 * @param   {(String|HTMLElement)} el  jQuery selector for element that will display result
 * @param   {(Number|String)}      d   the dose in mg
 * @param   {(Number|String)}      f   the frequency (every __ hours)
 * @returns {HTMLElement}              The original DOM element, for chaining
 */
function displayChange(el, d = 0, f = 0) {
  let newDose = checkValue(d),
  newFreq = checkValue(f),
  oldTdd = 24 / pt.curFreq * pt.curDose,
  arrow = "";

  if ( newDose > 0 && newFreq > 0 && pt.curDose > 0 && pt.curFreq > 0 ) {
    let newTdd = 24 / newFreq * newDose;
    let change = (newTdd - oldTdd) / oldTdd;
    if (change === 0) {
      arrow = "&nbsp;&nbsp;&nbsp;";
    } else if (change < 0) {
      arrow = "&darr;&nbsp;&nbsp;";
    } else {
      arrow = "&uarr;&nbsp;&nbsp;";
    }
    $(el).html(arrow + roundTo(Math.abs(change * 100), 0.1) + "%");
    $(el).css("background-color", colorScale(Math.abs(change * 100)));
  } else {
    $(el).html("");
    $(el).css("background-color", "#f2f7fa");
  }
  return el;
}
const formValidation = [
  {
    selector: "#ptage",
    validator: validateAge
  },
  {
    selector: "#sex",
    match: /^[MmFf]$/
  },
  {
    selector: "#height",
    min: pt.config.check.htMin,
    max: pt.config.check.htMax,
  },
  {
    selector: "#weight",
    min: pt.config.check.wtMin,
    max: pt.config.check.wtMax
  },
  {
    selector: "#scr",
    min: pt.config.check.scrMin,
    max: pt.config.check.scrMax
  },
  {
    selector: ".validate-dose",
    min: vanco.config.check.doseMin,
    max: vanco.config.check.doseMax
  },
  {
    selector: ".validate-freq",
    min: vanco.config.check.freqMin,
    max: vanco.config.check.freqMax
  },
  {
    selector: ".validate-level",
    min: vanco.config.check.levelMin,
    max: vanco.config.check.levelMax
  },
  {
    selector: ".validate-time",
    validator: validateTime
  }
]
function validateAge(el, item){
  let x = $(el).val();
  let yearsOld = 0;
  if ( /^\d+ *[Dd]$/.test(x) ) {
    const days = +x.replace(/ *d */gi, '');
    yearsOld = days/365.25;
  } else if ( /^\d+ *[Mm]$/.test(x) ) {
    const months = +x.replace(/ *m */gi, '');
    yearsOld = months/12;
  } else if ( /^\d+ *[Mm]\d+ *[Dd]$/.test(x) ) {
    let arrAge = x.split('m');
    arrAge[1] = arrAge[1].replace('d', '');
    yearsOld = arrAge[0]/12 + arrAge[1]/365.25;
  } else {
    yearsOld = x
  }
  const validatedAge = checkValue(yearsOld, pt.config.check.ageMin, pt.config.check.ageMax);
  if ( validatedAge === 0 ) {
    $(el).addClass("invalid");
  } else {
    $(el).removeClass("invalid");
  }
}
function validateTime(el, item){
  let x = $(el).val();
  let corrected = checkTimeInput(x);
  if ( corrected === "" ) {
    $(el).addClass("invalid");
  } else {
    $(el).val(corrected);
  }
}

function validateRange(el, item){
  if ( checkValue(+$(el).val(), item.min, item.max) === 0 ) {
    $(el).addClass("invalid");
  }
}
function validateMatch(el, item){
  if ( ! item.match.test($(el).val())) {
    $(el).addClass("invalid");
  }
}
let LOG = {
  enabled: false,
  enable: function(){
    this.enabled = true;
  },
  log(msg = '', title = ''){
    if (!this.enabled) return;
    if( (typeof msg === 'object' || typeof msg === 'array') && title !== '' ) {
      console.log(`==========${title}==========`);
      console.log(msg);
    } else {
      console.log(title === '' ? msg : `==${title}== ${msg}`);
    }
  },
  error(msg = '', title = ''){
    if (!this.enabled) return;
    console.error(title === '' ? msg : `[${title}]   ${msg}`);
  },
  warn(msg = '', title = ''){
    if (!this.enabled) return;
    console.warn(title === '' ? msg : `[${title}]   ${msg}`);
  },
  group(msg=""){
    if (!this.enabled) return;
    console.group(msg);

  },
  groupEnd(){
    if (!this.enabled) return;
    console.groupEnd();
  },
  outputTape(parent, title=""){
    let titleHtml = "";
    title = title.toUpperCase();
    const divider = arial.underline(title, "=");
    if ( title !== "" ) {
      titleHtml = `${title}<br>${divider}`
    }
    let txt = "";
    let items = [];
    parent.forEach(child => {
      if ( !( child[1] instanceof Array ) ) {
        items.push(child);
      } else {
        if ( child[0] instanceof Array ) {
          txt += `<br>` ;
          txt += this.printArray(child);
        } else {
          txt += `<br><u>${child[0]}</u><br>`;
          txt += this.printArray(child[1]);
        }
      }
    });
    return `${titleHtml}${this.printArray(items)}${txt}`
  },
  printArray(arr){
    let labels = [];
    let values = [];
    let txt = "";
    arr.forEach(el => {
      if ( el[1] !== "" ){
        labels.push(el[0]+":");
        values.push(el[1]);
      }
    });

    labels = arial.padArray(labels);

    for ( let i = 0; i < labels.length; i++ ){
      txt += labels[i] + values[i] + "<br>";
    }
    return txt;
  }
}
