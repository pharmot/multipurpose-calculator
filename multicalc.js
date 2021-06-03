/**
 * Copyright (c) 2021
 *
 * VMFH Pharmacy Multipurpose Calculator
 *
 * @author Andy Briggs <andrewbriggs@chifranciscan.org>
 *
 * Based on Excel Multipurpose Calculator created by Dennis Tran
 *
 * Created at     : 2021-01-15
 * Last modified  : 2021-06-02
 */

// TODO: change other inputs to number
// TODO: make monitoring box on initial tab expand instead of scrolling (or make bigger)
// TODO: add infusion time option but set default (for longer infusions)

let debug = true;
let debugDefaultTab = "initial";

$(()=>{
  $(".show-if-hd").hide();
  $(".show-if-hd-only").hide();
  
  if ( /debug/.test(location.search) ) {
    debug = true;
  } else if ( /log/.test(location.search) ) {
    LOG.enable();
  }
 
  if ( debug ){
    $("#age").val(90);
    $("#sex").val('M');
    $("#height").val(170.2);
    $("#weight").val(93.1);
    $("#scr").val(1.65);
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
    document.getElementById('goal').selectedIndex = 1;
    LOG.enable();
    const triggerElement = document.querySelector(`#nav-${debugDefaultTab}-tab`);
    const tab = new bootstrap.Tab(triggerElement)
    tab.show();    
    
    calculate.patientData();
    calculate.vancoInitial();
    calculate.vancoLinearChange();
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
});

$(".input-patient").on('keyup', () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});

$("#goal").on('change', () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});
$("#hd").on("change", (e) => {
  if( e.target.selectedIndex > 0 ) {
    $(".hide-if-hd").hide();
    if ( e.target.selectedIndex === 1 ) {
      $(".show-if-hd-only").show();
    } else {
      $(".show-if-hd-only").hide();
    }
    $(".show-if-hd").show();
  } else {
    $(".hide-if-hd").show();
    $(".show-if-hd").hide();
    $(".show-if-hd-only").hide();
  }
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
})

$(".input-initialPK").on('keyup', () => {
  calculate.vancoInitial();
});
$(".input-initialPK-new").on('keyup', () => {
  calculate.vancoInitial(true);
});

$("#vancoInitialPK-reset").on('click', () => {
  calculate.vancoInitial();
});

$(".input-auc").on('keyup', () => {
  vanco.syncCurrentDFT("auc");
  calculate.vancoAUC();
  calculate.vancoRevision();
  calculate.vancoLinearChange();
});
$(".input-auc-interval").on('keyup', () => {
  calculate.vancoAUC(false);  
});

$(".input-revision").on('keyup', () => {
  vanco.syncCurrentDFT("revision");
  calculate.vancoRevision();
  calculate.vancoAUC();
  calculate.vancoLinearChange();
});

$("#adjPKReset").on('click', () => {
  calculate.vancoRevision();
});
$(".input-revision-new").on('keyup', () => {
  calculate.vancoRevision(true);
});
$(".input-twolevel").on('keyup', () => {
  calculate.vancoTwolevel();
});
$(".input-twolevel-interval").on('keyup', () => {
  calculate.vancoTwolevel(false);
});


$(".input-steadystate").on('keyup', () => {
  calculate.vancoSteadyStateCheck();
});
$(".linear-dose, .linear-freq").on("keyup", (e) => {
  calculate.vancoLinearChange();
});
$("#seconddose-first").on("keyup", () => {
  calculate.secondDose();
});
$("[name='seconddose-freq']").on("change", () => {
  calculate.secondDose();
});

$("#btnReset").on('click', () => {
  $("input").val("");
  resetDates();
  ($("#hd")[0]).selectedIndex = 0;
  ($("#goal")[0]).selectedIndex = 0;
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
  calculate.vancoLinearChange();
  calculate.vancoTwolevel();
  calculate.secondDose();
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
      wtMin: 20,
      wtMax: 300,
      htMin: 90,
      htMax: 250,
      ageMin: 0.1,
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
  set age(x){ this._age = checkValue(x, this.config.check.ageMin, this.config.check.ageMax); },
  get age(){ return this._age || 0; },
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
  get cgProtocol(){
    if ( this.ibw === 0 || this.age === 0 || this.scr === 0 ) return 0;
    if ( this.wt < this.ibw ) return this.cgActual;
    if ( this.overUnder > 30 ) return this.cgAdjusted;
    return this.cgIdeal;
  },  
  cg(weight){
    return (140 - this.age) * weight / (this.scr * 72) * (pt.sex === "F" ? 0.85 : 1);
  }
};
const vanco = {
  config: {
    doses: [500, 750, 1000, 1250, 1500, 1750, 2000],
    maxHDLoad: 2000,
    maxLoad: 2500,
    maxHD: 1500,
    maxDailyDose: 4000,
    aucLowNormal: 400,
    aucHighNormal: 600,
    check: {
      doseMin: 250,
      doseMax: 2500,
      freqMin: 6,
      freqMax: 48,
      levelMin: 3,
      levelMax: 100,
      infMin: 0.5,
      infMax: 4
    }
  },  
  getInfusionTime(dose) {
    if ( dose > 2000 ) return 2.5;
    if ( dose > 1500 ) return 2;
    if ( dose > 1000 ) return 1.5;
    return 1;
  },
  getKe(cl, vd) {
    return cl / vd;
  },
  getCmax(dose, ke, inf, vd, interval) {
    if ( dose === 0 || ke === 0 || inf === 0 || vd === 0 || interval === 0 ) return 0;
    return dose * (1 - Math.exp(-ke * inf)) / (inf * vd * ke * (1 - Math.exp(-ke * interval)));
  },
  getCmin(peak, ke, inf, interval) {
    if ( peak === 0 || ke === 0 || inf === 0 || interval === 0 ) return 0;
    return peak * Math.exp(-ke * (interval - inf));
  },
  getDosingWt(){
    if ( pt.ibw === 0 ) return 0;
    if ( pt.bmi < 30 ) return pt.wt;
    return pt.ibw;
  },
  getInitialVd(){
    if ( pt.bmi === 0 ) return 0;
    return this.getDosingWt() * 0.7;    
  },
  loadingDoseRange(){
    const {maxLoad, maxHDLoad} = this.config;
    if( pt.hd > 2 ) return {low: 15, high: 25, max: maxLoad};
    if( pt.hd === 1 ) return {low: 15, high: 20, max: maxHDLoad};
    if( pt.cgProtocol < 30 ) {
      if ( pt.goal === 0 ) return {low: 15, high: 20, max: maxLoad};
      return {low: 20, high: 25, max: maxLoad};
    }
    if ( pt.goal === 0 ) return {low: 20, high: 25, max: maxLoad};
    return {low: 25, high: 30, max: maxLoad};
  },
  maintenanceDoseRange(){
    const { maxDailyDose } = this.config;
    if ( pt.hd === 0 ) {
      if ( pt.cgProtocol >= 90 ) {
        if ( pt.age < 25 ) return {low: 20, high: 20, freq: 8, maxDaily: maxDailyDose};
        if ( pt.age > 40 && pt.goal === 1 ) return {low: 20, high: 20, freq: 12, maxDaily: maxDailyDose};
        if ( pt.age > 40 ) return {low: 15, high: 20, freq: 12, consider: 15, maxDaily: maxDailyDose};
        if ( pt.goal === 0 ) return {low: 15, high: 20, freq: 8, consider: 15, maxDaily: maxDailyDose};
        return {low: 15, high: 20, freq: 8, maxDaily: maxDailyDose};
      }
      let res = {high: 20, maxDaily: maxDailyDose};
      res.low = pt.goal === 1 ? 20 : 15;
      if ( pt.goal === 0 ) {
        res.consider = 15;
      }
      if ( pt.cgProtocol < 10 ) {
        res.freqText = 'Consider checking level in 24-48 hours. Repeat dose when level &le; 15-20.'
      } else {
        res.freq = pt.cgProtocol < 20 ? 48 : pt.cgProtocol < 50 ? 24 : 12;  
      }

      return res;
    }
    if ( pt.hd === 1 ) {
      if ( pt.goal === 0 ) return {
        lowMg: 500,
        highMg: 1000,
        freqText: 'after each HD',
        considerText: `Consider high end of range ${pt.bmi >= 30 ? 'for BMI &ge; 30' : 'if residual renal function'}.`
      };
      return {
        low: 10,
        high: 10,
        freqText: 'after each HD',
        maxDose: 1500        
      };
    }
    if ( pt.hd === 2 ) return {
      low: 10,
      high: 15,
      freqText: 'when random level &lt; 15 (check first random level with AM labs ~48 hrs after load)',
      maxDaily: maxDailyDose
    }
    if ( pt.hd === 5 ) return {
      low: 7.5,
      high: 10,
      freq: 12,
      textBeforeDose: 'Check random level q12h until &lt; 20, then start ',
      maxDaily: maxDailyDose
    };
    return {
      low: 15,
      high: 15,
      freq: 24,
      textBeforeDose: 'Check random level q12h until &lt; 20, then start ',
      maxDaily: maxDailyDose
    };
  },
  loadingDose(){
    if ( pt.ibw === 0 || pt.age === 0 ) return '';
    const {low, high, max} = this.loadingDoseRange();
    let d1 = roundTo(low * pt.wt, 250);
    let d2 = roundTo(high * pt.wt, 250);
    let result = `<br><i>(${low} - ${high} mg/kg) `;
    if (d1 > max || d2 > max) {
      if( pt.hd === 1) {
        result += ` [Max ${max} mg for HD]`;
      } else {
        result += ` [Max ${max} mg]`;
      }
      d1 = Math.min(d1, max);
      d2 = Math.min(d2, max);
    }
    return (d1 === d2 ? `${d1} mg` : `${d1} - ${d2} mg`) + result + "</i>";
  },
  maintenanceDose(){
    if ( pt.ibw === 0 || pt.age === 0 ) return {maintText: '', freq: 0};
    if ( pt.scr === 0 && pt.hd === 0 ) return {maintText: 'Must order SCr before maintenance dose can be calculated', freq: 0};
    let {
      low = 0,
      high = 0,
      lowMg = 0,
      highMg = 0,
      freq = 0,
      freqText = '',
      textBeforeDose = '',
      consider = 0,
      considerText = '',
      maxDaily = 0,
      maxDose = 0
    } = this.maintenanceDoseRange();

    let lowDose = lowMg > 0 ? lowMg : roundTo(pt.wt * low, 250),
        highDose = highMg > 0 ? highMg : roundTo(pt.wt * high, 250),
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
    if ( maxDose > 0 ) { // i.e. is HD
      if ( lowDose > maxDose || highDose > maxDose ) {
        lowDose = Math.min(lowDose, maxDose);
        highDose = Math.min(highDose, maxDose);
        txtExceeds = `[Max ${maxDose} mg for HD]`;
      }  
    }
    if ( maxDaily > 0 ) { // i.e. non-HD
      if ( lowDaily > maxDaily ) {
        txtExceeds = `<br>***Protocol exceeds ${maxDaily/1000} g/day***`;
      } else if ( highDaily > maxDaily ) {
        txtExceeds = `<br>***Upper range of protocol exceeds ${maxDaily/1000} g/day***`;
      }
    }
    if ( consider > 0 ) {
      considerText = `Consider dosing closer to ${lowDose} mg.`;
    }
    if ( considerText !== '' ) {
      considerText = `<br><i>${considerText}</i>`;
    }
    if ( lowDose !== highDose ) {
      txtDose = `${lowDose} - `;
    }
    return {maintText: `${textBeforeDose}${txtDose}${highDose} mg ${freqText} ${considerText}${txtExceeds}`, freq: freq};
  },
  monitoring(freq){
    if ( pt.hd === 0 && pt.cgProtocol === 0 ) return '';
    if ( pt.hd === 1 ) {
      if ( pt.goal === 0 ) return "Draw level before every other HD, starting with 2nd HD after load, until 2 consecutive levels therapeutic";
      return "Draw level before every HD, starting with 2nd HD after load, until 2 consecutive levels therapeutic";
    }
    if ( pt.hd === 2 ) return "Recheck random levels q24-48h, or as clinically indicated, and re-dose 10-15 mg/kg when level &lt; 15 mcg/mL";
    if ( pt.hd === 5 ) return "Check trough levels q24h";
    if ( pt.hd !== 0 ) return "Check trough levels q48h";

    let txt = '',
        lowCrCl = pt.cgProtocol < 50,
        highSCr = pt.scr >= 1.2,
        highBMI = pt.bmi > 30,
        lowSCr = pt.scr < 0.5;

    if ( lowCrCl || highSCr ) {
      return `Obtain random level within 24 hrs after load<br> <i>(to spot check for clearance, for ${lowCrCl ? 'CrCl &lt; 50' : ''}${lowCrCl && highSCr ? ' and ' : ''}${highSCr ? 'SCr &ge; 1.2' : ''})</i>`;      
    }   

    if ( freq === 6 ) {
      txt = 'Initial trough level before the 6th, 7th, or 8th dose.';
    } else if ( freq === 8 ) {
      txt = 'Initial trough level before the 4th, 5th, or 6th dose.';
    } else if ( freq === 12 ) {
      txt = 'Initial trough level before the 3rd or 4th dose.';
    } else {
      txt = 'Initial trough level before the 3rd dose.';
    }

    if ( lowSCr || highBMI ) {
      txt += `<br>Consider ${freq < 24 ? 'level prior to 3rd dose to check for clearance, and' : ''} frequent levels to monitor for therapeutic levels <i>(${lowSCr ? 'SCr &lt; 0.5' : ''}${lowSCr && highBMI ? ' and ' : ''}${highBMI ? 'BMI &ge; 30' : ''})</i>`;
    }
    return txt;   
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
  initialPKLoad(cMax){    
    const roundedDose = Math.floor( ( ( cMax * this.getInitialVd() ) + 125 ) / 250) * 250;
    const cappedDose = Math.min( roundedDose, this.config.maxLoad );
    return cappedDose;   
  },
  initialPK({selectedDose = 0, selectedInterval = 0, selectedInfTime = 0} = {}){
    let useDose = -1;
    const goal = pt.goal > 0 ? 15 : 10;
    let res = {
      newDose: [],
      newPeak: [],
      newTrough: [],
      infTime: [],
      newViable: [],
      newLoad: [],
      pkDose: 0,
      pkFreq: 0,
      pkTrough: 0,
      pkLoad: 0,
      halflife: 0
    };
    if ( pt.cgProtocol === 0 ) return res;
    const vd = this.getInitialVd();
    const ke = this.getKe((0.695 * pt.cgProtocol + 0.05) * 60 / 1000, vd);

    res.halflife = getHalflife(ke);
    res.pkFreq = selectedInterval > 0 ? selectedInterval : this.getSuggestedInterval(res.halflife);
    this.config.doses.forEach((d, i) => {
      res.newDose.push(d);
      const infTime = this.getInfusionTime(d);
      res.infTime.push(infTime);
      const p = this.getCmax(d, ke, infTime, vd, res.pkFreq);
      const tr = this.getCmin(p, ke, infTime, res.pkFreq);
      res.newPeak.push(p);
      res.newTrough.push(tr);
      res.newLoad.push(this.initialPKLoad(p));
      if (i === 0) {
        res.newViable.push(tr > goal && tr < goal + 5);
      } else {
        res.newViable.push(tr > goal - 1 && tr < goal + 6);
      }
    });
    for (i = 0; i < res.newViable.length; i++) {
      if (res.newViable[i]) {
        useDose = i;
        break;
      }
    }
    if ( useDose === -1 ) {
      useDose = 0;
    }
    res.pkTrough = res.newTrough[useDose];
    res.pkDose = res.newDose[useDose];
    res.pkLoad = res.newLoad[useDose];

    if ( selectedDose > 0 && selectedInterval > 0 ){
      let newInfTime = selectedInfTime > 0 ? selectedInfTime : this.getInfusionTime(selectedDose);
      let pkNewPeak = this.getCmax(selectedDose, ke, newInfTime, vd, res.pkFreq);
      res.pkTrough = this.getCmin(pkNewPeak, ke, newInfTime, res.pkFreq);
      res.pkDose = selectedDose;
      let p = this.getCmax(res.pkDose, ke, newInfTime, vd, res.pkFreq);
      res.pkLoad = this.initialPKLoad(p);
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
  calculateRevision({ke= 0, selectedInterval= 0, selectedDose = 0, selectedInfTime = 0} = {}){
    let useDose = -1;
    const goal = pt.goal > 0 ? 15 : 10;
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
  
      
      res.pkFreq = selectedInterval > 0 ? selectedInterval : this.getSuggestedInterval(halflife);
      res.halflife = halflife;
            
      // Calculate linear revision unless calculating two-level PK
      if ( !twolevel ) {
        res.linearDose = Math.floor((pt.curDose / pt.curTrough * Math.floor(goal + 2.5) + 125) / 250) * 250;
        res.linearTrough = res.linearDose / pt.curDose * pt.curTrough;  
      }
    
      this.config.doses.forEach((d, i) => {
        res.newDose.push(d);
        const infTime = this.getInfusionTime(d);
        res.infTime.push(infTime);
        const p = this.getCmax(d, ke, infTime, vd, res.pkFreq);
        const tr = this.getCmin(p, ke, infTime, res.pkFreq);
        res.newPeak.push(p);
        res.newTrough.push(tr);
        if (i === 0) {
          res.newViable.push(tr > goal && tr < goal + 5);
        } else {
          res.newViable.push(tr > goal - 1 && tr < goal + 6);
        }
      });
      for (i = 0; i < res.newViable.length; i++) {
        if (res.newViable[i]) {
          useDose = i;
          break;
        }
      }
      if ( useDose === -1 ) {
        useDose = 0;
      }
      res.pkTrough = useDose < 0 ? 0 : res.newTrough[useDose];
      res.pkDose = useDose < 0 ? 0 : res.newDose[useDose];
      
      if ( selectedDose > 0 && selectedInterval > 0 ){
        let newInfTime = selectedInfTime > 0 ? selectedInfTime : this.getInfusionTime(selectedDose);
        let pkNewPeak = this.getCmax(selectedDose, ke, newInfTime, vd, res.pkFreq);
        res.pkTrough = this.getCmin(pkNewPeak, ke, newInfTime, res.pkFreq);
        res.pkDose = selectedDose;
      } 
    }
    return res;
  },
  hdRevision(){
    const goal = pt.goal;
    const wt = pt.wt;
    let trough = pt.curTrough;

    if ( trough === 0 ) return "";
    if ( goal === 1 ) {
      trough -= 5;
    }    
    if ( trough < 5 ) {
      if ( wt === 0 ) return "Reload with 15-20 mg/kg (max 1.5 g)<br>and increase maintenance dose by 250-500 mg";
      const lowRange = Math.min(roundTo(15*wt, 250), this.config.maxHD);
      const highRange = Math.min(roundTo(20*wt, 250), this.config.maxHD);
      return `Reload with ${lowRange}${lowRange === highRange ? "" : "-" + highRange} mg<br> and increase maintenance dose by 250-500 mg`;
    }
    if ( trough < 10 ) return "Increase dose by 250-500 mg";
    if ( trough > 20 ) return "Hold x 1, recheck level prior to next<br>dialysis session and dose accordingly."
    if ( trough > 15 ) return "Decrease dose by 250-500 mg";
    return "Therapeutic - continue current dose";
   }
}

/**
 * Functions called by event listeners to recalculate results
 */
const calculate = {
  patientData(){
    // Remove highlighting on CrCls
    $(".outCrCl").removeClass("use-this");

    // Set pt properties from inputs
    pt.age = +$("#age").val();
    pt.sex = $("#sex").val();  
    pt.ht = +$("#height").val();
    pt.wt = +$("#weight").val();
    pt.scr = +$("#scr").val();

    // Display weights and CrCl
    displayValue("#ibw", pt.ibw, 0.1, " kg");
    displayValue("#overUnder", pt.overUnder, 0.1, "%");
    displayValue("#adjBW", pt.adjBW, 0.1, " kg");
    displayValue("#lbw", pt.lbw, 0.1, " kg");
    displayValue("#bmi", pt.bmi, 0.1, " kg/m²");
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
    let cboGoal = $("#goal")[0];
    pt.hd = cboHD.selectedIndex;
    pt.goal = cboGoal.selectedIndex;
  },
  vancoInitial(newRegimen=false){
    $("#vancoInitialLoad").html(vanco.loadingDose());
    const { doseMin, doseMax, freqMin, freqMax, infMin, infMax } = vanco.config.check;
    const { maintText, freq } = vanco.maintenanceDose();    
    $("#vancoInitialMaintenance").html(maintText);
    $("#vancoInitialMonitoring").html(vanco.monitoring(freq));
    displayValue("#vancoInitialPK-wt", vanco.getDosingWt(), 0.1, " kg");    
    displayValue("#vancoInitialPK-crcl", pt.cgProtocol, 0.1, " mL/min");
    let selectedDose = newRegimen ? checkValue(+$("#vancoInitialPK-dose").val(), doseMin, doseMax) : 0;
    let selectedInterval = newRegimen ? checkValue(+$("#vancoInitialPK-interval").val(), freqMin, freqMax) : 0;
    let selectedInfTime = 0; // TODO: allow infusion time choice
        
    let {
      newDose, newPeak, newTrough, infTime, newViable, newLoad,
      pkDose, pkFreq, pkTrough, pkLoad, halflife
    } = vanco.initialPK({
      selectedDose: selectedDose,
      selectedInterval: selectedInterval,
      selectedInfTime: selectedInfTime});
    
    displayValue("#vancoInitialPK-halflife", halflife, 0.1, " hrs");
    
    if ( !newRegimen ) {
      $("#vancoInitialPK-dose").val(pkDose || "");
      $("#vancoInitialPK-interval").val(pkFreq || "");
    }
    
    
    
    if ( newRegimen && ( selectedDose === 0 || selectedInterval === 0 ) ) {
      pkTrough = 0;
      pkLoad = 0;
    }
    
    displayValue("#vancoInitialPK-trough", pkTrough, 0.1, " mcg/mL");
    displayValue("#vancoInitialPK-load", pkLoad, 250, " mg");

    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, roundTo: 1, units: " mg"},
             { title: "Interval", data: pkFreq, units: " hrs"},
             { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 },
             { title: "Sugg. LD", data: newLoad, roundTo: 250, units: " mg"}],
      highlightColumns: newViable
    });
    $("#vancoInitialPK-table").html(tableHtml);
    
  },
  createVancoTable({rows, highlightColumns} = {}){
    let rowHtml = "";
    if ( rows[0].data.length === 0 ) return "";
    for( let row of rows ) {
      rowHtml += `<tr><th scope="row">${row.title}</th>`;
      if ( row.units === undefined ) { row.units = ""; }
      if ( row.roundTo === undefined ) { row.roundTo = -1; }
      for ( i=0; i<vanco.config.doses.length; i++ ){
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
  vancoRevision(newRegimen=false){
    
    const { doseMin, doseMax, freqMin, freqMax, infMin, infMax } = vanco.config.check;
    const selectedDose = newRegimen ? checkValue(+$("#adjPKDose").val(), doseMin, doseMax) : 0;
    const selectedInterval = newRegimen ? checkValue(+$("#adjPKFreq").val(), freqMin, freqMax) : 0;
    //TODO: const selectedInfTime = checkValue(+$("#adjPKInfTime").val(), infMin, infMax);
    
    const { newDose, newPeak, newTrough,
           infTime, newViable, linearDose,
           linearTrough, pkDose, pkFreq,
           pkTrough, halflife } = vanco.calculateRevision({
             selectedDose: selectedDose,
             selectedInterval: selectedInterval
           });
    
    displayValue("#tdd",dailyDose(pt.curDose, pt.curFreq), 1, " mg");  
    displayValue("#adjHalflife", pt.adjHalflife, 0.1, " hours");
    $("#adjLinDose").html( linearDose === 0 ? "" : `${roundTo(linearDose, 1)} mg q${pt.curFreq}h`);
    displayChange("#adjLinDoseChange", linearDose, pt.curFreq);
    displayValue("#adjLinTrough", linearTrough, 0.1, " mcg/mL");
    
    if (!newRegimen) {
      $("#adjPKFreq").val(pkFreq > 0 ? pkFreq : "");
      $("#adjPKDose").val(pkDose > 0 ? pkDose : "");
    }
    
    displayChange("#adjPKDoseChange", pkDose, pkFreq);
    displayValue("#adjPKTrough", pkTrough, 0.1, " mcg/mL");
    this.vancoSteadyStateCheck();
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, roundTo: 1, units: " mg"},
             { title: "Interval", data: pkFreq, units: " hrs"},
             { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable
    });
    $("#adjTable").html(tableHtml);
    $("#vancoHdAdj").html(vanco.hdRevision());
  },
  vancoSteadyStateCheck(){
    const firstDT = getDateTime($("#dateFirst").val(), $("#timeFirst").val());
    const troughDT = getDateTime($("#dateTrough").val(), $("#timeTrough").val());
    if ( firstDT !== 0 && troughDT !== 0 && pt.adjHalflife > 0 ) {
      const timeDiff = getHoursBetweenDates(firstDT, troughDT);
      const halflives = roundTo(timeDiff / pt.adjHalflife, 0.1);
      $("#timeDiff").html(`${roundTo(timeDiff, 0.1)} hrs&nbsp;&nbsp;&nbsp;(${halflives} ${halflives === 1 ? 'half-life' : 'half-lives'})`);
      $("#atSS").html(`${halflives < 4 ? "Not at" : "At"} steady state.`);
    } else {
      $("#atSS").html("");
      $("#timeDiff").html("");
    }
  },
  vancoLinearChange(){
    const { doseMin, doseMax, freqMin, freqMax } = vanco.config.check;
    const { curDose, curFreq, curTrough } = pt;
    const allRows = $(".linear-row");
    for ( let linearRow of allRows ) {
      let cells = [];
      for ( let inputgroup of linearRow.children ){
        cells.push(inputgroup.children[0]);
      }
      let row = {
        dose: cells[0],
        freq: cells[1],
        tdd: cells[2],
        change: cells[3],
        trough: cells[4]
      };
      const newDose = checkValue(+$(row.dose).val(), doseMin, doseMax);
      const newFreq = checkValue(+$(row.freq).val(), freqMin, freqMax);
      displayChange(`#${row.change.id}`, newDose, newFreq);
      if ( newDose > 0 && newFreq > 0 ){
        $(row.tdd).html(roundTo(dailyDose(newDose, newFreq), 1) + " mg");
        if ( curDose > 0 && curFreq > 0 && curTrough > 0 ) {
          const linNewTrough = curTrough * dailyDose(newDose, newFreq) / dailyDose(curDose, curFreq);  
          $(row.trough).html(roundTo(linNewTrough, 0.1) + " mcg/mL");
        } else {
          $(row.trough).html("");
        }
      } else {
        $(row.tdd).html("");
        $(row.trough).html("");
      }
    }
  },
  vancoAUC(resetInterval = true){
    let params = {
          dose: pt.curDose,
          interval: pt.curFreq,
          peak: checkValue(+$("#auc-curPeak").val(), vanco.config.check.levelMin, vanco.config.check.levelMax),
          peakTime: checkValue(+$("#vancoAUCPeakTime").val(), 0, 36),
          troughTime: checkValue(+$("#vancoAUCTroughTime").val(), 0, 36),
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
    if( $("#vancoAUCNewInterval").val() === "" && resetInterval && $("#vancoCurrentInterval") !== "" && aucCurrent !== undefined ) {
      $("#vancoAUCNewInterval").val(aucCurrent.oldInterval);
    }
    // done with first step here, have outputted new interval, auc24
    const newInterval = checkValue(+$("#vancoAUCNewInterval").val(), vanco.config.check.freqMin, vanco.config.check.freqMax);
    const aucNew = vanco.calculateAUCNew(aucCurrent, newInterval);

    // create AUC table
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: aucNew.dose, units: " mg" },
             { title: "Predicted AUC", data: aucNew.auc, roundTo: 0.1 },
             { title: "Est. Trough (mcg/mL)", data: aucNew.trough, roundTo: 0.1}
            ],
      highlightColumns: aucNew.therapeutic
    });
    $("#aucTable").html(tableHtml);
  },
  vancoTwolevel(resetInterval = true){
    const time1 = getDateTime($("#twolevelDate1").val(), $("#twolevelTime1").val());
    const time2 = getDateTime($("#twolevelDate2").val(), $("#twolevelTime2").val());
    const level1 = checkValue(+$("#twolevelLevel1").val(), vanco.config.check.levelMin, vanco.config.check.levelMax);
    const level2 = checkValue(+$("#twolevelLevel2").val(), vanco.config.check.levelMin, vanco.config.check.levelMax);
    let ke = -1;
    if ( time1 !== 0 && time2 !== 0 && level1 > 0 && level2 > 0 ) {
      const timeDiff = getHoursBetweenDates(time1, time2);
      ke = Math.log(level1 / level2) / timeDiff;
    }
    const selectedInterval = resetInterval ? 0 : checkValue(+$("#twolevelInterval").val(), vanco.config.check.freqMin, vanco.config.check.freqMax);
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
    const fd = checkTimeInput($("#seconddose-first").val());
    let freqId = $("[name='seconddose-freq']:checked")[0].id;
    freqId = freqId.replace("seconddose-","");
    const sd = seconddose.getSecondDose({fd: fd, freqId: freqId});
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
  }
}



const seconddose = {
  /**
   * Interval and times of a given dosing frequency
   *
   * @typedef  {Object}         Frequency
   *
   * @property {String}         id         unique identifier of this frequency
   * @property {Number}         interval   dosing interval in hours
   * @property {(Number|Array)} startHour  first dosing time of the day, or array of times if multiple options
   */
  
  /**
   * @type {Frequency[]} 
   */
  freqs: [
    { id: "q6vanco", interval: 6, startHour: 5 },
    { id: "q8", interval: 8, startHour: 5 },
    { id: "q12vanco", interval: 12, startHour: [5, 9] },
    { id: "q24vanco", interval: 24, startHour: [5, 9, 13, 17, 21] }    
  ],
  /**
   * Generate an array of standard times for the selected frequency
   *
   * @param   {String}  id              identifier of the selected frequency
   * @returns {Object}  obj
   * @returns {Array}   obj.timeArray   An array of numbers representing standard times
   * @returns {Number}  obj.interval    The dosing interval in hours
   */
  createTimeArray(id){
    let {interval, startHour} = this.freqs.filter( freq => {
      return id === freq.id;
    })[0];
    if ( !Array.isArray(startHour) ){
      startHour = [startHour];
    }
    let timeArray = [];
    const innerLength = (24/interval)*2+2;
    startHour.forEach( start => {
      let j = start;
      for ( i=0;i<innerLength;i++){
        timeArray.push(j);
        j += interval;
      }
    });
    timeArray.sort((a,b)=>{
      if (a<b) return -1;
      return 1;
    });    
    return {timeArray: timeArray, interval: interval};    
  },
  getSecondDose({fd = "", freqId} = {} ){
    if ( fd === "" ) return undefined; // TODO: return something?

    fd = parseFloat(fd.slice(-2)) / 60 + parseFloat(fd.slice(0, -2));
    const {timeArray, interval} = this.createTimeArray(freqId);
    const arDose3 = timeArray.filter( x => x > fd );
    const arFreq2 = arDose3.map( x => (x - fd) / 2 );
    const arDose2 = arFreq2.map( x => fd + x );
    const arFreq2Diff = arFreq2.map( x => interval - x );

    let bestValue1 = Infinity,
        bestValue2 = Infinity,
        di1,
        di2,
        singleLine = false;
    
    arFreq2Diff.forEach( (x, i) => {
      
      if ( Math.abs(x) <= 0.25 && !singleLine ) {
        bestValue1 = x;
        bestValue2 = x;
        di1 = i;
        di2 = i;
        singleLine = true;
        //secondRow0, break
      } else if ( x > 0  && !singleLine) {
        if ( x < bestValue1 ) {
          bestValue1 = x;
          di1 = i;
          //secondRow1
        }
      } else if ( x < 0  && !singleLine) {
        if ( x > -bestValue2 ) {
          bestValue2 = x;
          di2 = i;
          //secondRow1
        }
      }
    });

    let res = [{
        hours: Math.abs(Math.round(arFreq2[di1]*4)/4),
        diff: Math.round(arFreq2Diff[di1]*4)/4,
        _times: [ fd, arDose2[di1], arDose3[di1] ]
      }];
    if (!singleLine) {
      res.push({
        hours: Math.abs(Math.round(arFreq2[di2]*4)/4),
        diff: Math.round(arFreq2Diff[di2]*4)/4,
        _times: [ fd, arDose2[di2], arDose3[di2] ]
      });
    }
    res.forEach( me => {
      me.units = me.hours === 1 ? "hour" : me.diff === 0 ? "" : "hours";
      me.direction = me.diff < 0 ? "late" : me.diff === 0 ? "" : "early";
      me.diff = Math.abs(me.diff);
      me.times = me._times.map( x => {
        let m = Math.round(x*4)/4 % 24;
        let h = Math.floor(m);
        m = Math.round((m - h) * 60);
        return `${("0" + h).slice(-2)}:${("0" + m).slice(-2)}`;
      });      
      delete me._times;
    });
    return res;
  }
}

/**
 * Displays a number, rounded, with units in the specified input element.
 * If number is zero, clears input element instead.
 *
 * @param   {String|HTMLElement} el           Valid jQuery selector for target element
 * @param   {Number}            [num = 0]     The number to go in the input field
 * @param   {Number}            [round = -1]  The desired rounding factor
 * @param   {String}            [unit = ""]   Units to append to rounded value
 * @param   {String}            [pre = ""]    Text to prepend to rounded value
 * @returns {HTMLElement}                     The original DOM element, for chaining
 */
function displayValue( el, num = 0, round = -1, unit = "", pre = ""){
  let txt = '';
  if( num > 0 ) {
    txt = pre + roundTo(num, round) + unit;
  }
  if ( el === '' ) return txt;
  $(el).html(txt);  
  return el;
};

/**
 * Evaluates a number, returns if is valid, between optional minimum
 * and maximum, otherwise returns zero.
 * 
 * @param   {(Number|String)}  x                Value to check
 * @param   {Number}          [min=-Infinity]   Minimum of acceptable range
 * @param   {Number}          [max=Infinity]    Maximum of acceptable range
 * @returns {Number}                            The input value if acceptable, or zero
 */
function checkValue(x, min = -Infinity, max = Infinity ) {
  x = parseFloat(x);
  if ( isNaN(x) || x < min || x > max ) return 0;
  return x;
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
 * Rounds a number to a specified factor.
 *
 * @param   {Number} x  The number to round
 * @param   {Number} n  The rounding factor
 * @returns {Number}    The rounded number
 */
function roundTo(x, n = 0) {
  if ( n <= 0 || isNaN(x) ) return x;
  let t = Math.round(x / n) * n;
  t = Math.floor(t * 1000);
  t = t / 1000;
  return t;
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
 * Convert date object to string formatted as 'MM/dd @ HHmm'
 *
 * @param   {Date}   d   date object to convert
 * @returns {String}
 */
function displayDate(d) {
  let mm = ("0" + d.getMinutes()).slice(-2),
      hh = ("0" + d.getHours()).slice(-2),
      mo = d.getMonth() + 1,
      dd = d.getDate();	
  return mo + "/" + dd + " @ " + hh + mm;
}

/**
 * Convert date and time raw input to a date object.
 *
 * @param   {String} d   date string from input field
 * @param   {String} t   time string from input field
 * @returns {Date}       date object (returns 0 if input is invalid)
 */
function getDateTime(d, t) {
  t = checkTimeInput(t);
  if ( d === "" || t === "" ) return 0;
  let dy = +d.slice(0, 4),
      dm = +d.slice(5, 7),
      dd = +d.slice(8, 10),
      th = +t.slice(0, 2),
      tm = +t.slice(2, 4);
  return new Date(dy, dm - 1, dd, th, tm, 0, 0);
}

/**
 * Calculate the number of hours between two dates
 *
 * @param   {Date}   first   first Date object
 * @param   {Date}   second  second Date object
 * @returns {Number}         hours between first and second date
 */
function getHoursBetweenDates(first, second){
  return (second - first)/ 1000 / 60 / 60;
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
 * Calculates a daily dose from a given frequency text
 * 
 * @param   {Number} d     dose in mg
 * @param   {String} freq  Frequency starting with q*h where * is the frequency
 * @returns {Number}       Total daily dose
 */
function dailyDose(d, freq){
  if ( d === 0 || freq === 0 ) return 0;
  let f = 0;
  if(typeof freq === "string") {
    f = +freq.substring(0, 5).replace("q", "").replace("h", "").trim();	
  } else {
    f = freq;
  }
  if ( isNaN(f) || isNaN(d) ) { return 0; } 
  return d * ( 24 / f );		
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
    selector: "#age",
    min: pt.config.check.ageMin,
    max:  pt.config.check.ageMax
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
function validateTime(el, item){
  let x = $(el).val();
  let corrected = checkTimeInput(x);
  if ( corrected === "" ) {
    $(el).addClass("invalid");
  } else {
    $(el).val(corrected);
  }
}
function checkTimeInput(x){
  x += "";
  if (/(^[0-1]{0,1}[0-9]{1}$)|(^2[0-3]{1}$)/.test(x)) {
    return ("0" + x + "00").slice(-4);
  } 
  if ( /^(([0-1]{0,1}[0-9]{1})|2{1}[0-4]{1})[0-5]{1}[0-9]{1}$/.test(x) ) {
    return ("0"+ x.slice(0, -2) ).slice(-2) + x.slice(-2);
  }
  return "";
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
  }
    
}
