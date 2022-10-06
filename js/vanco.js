/**
 * Vancomycin dosing calculations
 * @module vanco
 * @requires module:util
 * @requires module:growthCharts
 */

import { checkValue, roundTo } from './util.js'
import { childIsObese } from './growthCharts.js';

/**
 * Loading dose configuration
 *
 * @typedef  {Object} LoadConfig
 * @property {Number} low         low end of loading dose range in mg/kg
 * @property {Number} high        high end of loading dose range in mg/kg
 * @property {Number} max         max loading dose in mg
 */
/**
 * Configuration for vancomycin calculations and related input validation.
 * @constant
 * @type     {Object}
 * @default
 * @property {Number[]}   doses           Standard maintenance doses to use for dose tables
 * @property {Object}     load            Loading dose parameters
 * @property {LoadConfig} load.def        LD parameters for most patients
 * @property {LoadConfig} load.sepsis     LD parameters for severe sepsis
 * @property {LoadConfig} load.hd         LD parameters for hemodialysis
 * @property {LoadConfig} load.pd         LD parameters for peritoneal dialysis
 * @property {LoadConfig} load.crrt       LD parameters for CRRT (CVVH, CVVHD, CVVHDF)
 * @property {LoadConfig} load.sled       LD parameters for SLED
 * @property {Number}     maxHDDose       Maximum initial maintenance dose for HD patients
 * @property {Number}     maxPDDose       Maximum initial maintenance dose for PD patients
 * @property {Number}     maxDaily        Maximum initial total daily dose
 * @property {Number}     aucLowNormal    Low normal AUC value
 * @property {Number}     aucHighNormal   High normal AUC value
 * @property {Object}     check           acceptable input values for input validation
 * @property {Number}     check.doseMin   minimum acceptable dose input
 * @property {Number}     check.doseMax   maximum acceptable dose input
 * @property {Number}     check.freqMin   minimum acceptable frequency input
 * @property {Number}     check.freqMax   maximum acceptable frequency input
 * @property {Number}     check.levelMin  minimum acceptable level input
 * @property {Number}     check.levelMax  maximum acceptable level input
 * @property {Number}     check.timeMin   minimum acceptable dose-to-level time input for AUC calculation
 * @property {Number}     check.timeMax   maximum acceptable dose-to-level time input for AUC calculation
 */
export const config = {
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
    timeMax: 60
  }
};
/**
 * Round dose per protocol - to nearest 250 mg if adult or if dose is
 * greater than or equal to 250 mg, otherwise to nearest 25 mg.
 *
 * @param   {Number} dose    Dose in mg
 * @param   {Number} age     Age in years (default 18)
 * @returns {Number}         Rounded dose in mg
 */
function roundDose(dose, age = 18){
  if ( age >= 18 ) return roundTo(dose, 250);
  const rounded = roundTo(dose, 25);
  if ( rounded >= 250 ) return roundTo(dose, 250);
  return roundTo(dose, 25);
};
/**
 * Get standard infusion time from dose
 *
 * @param   {Number} dose   Dose in mg
 * @returns {Number}        Infusion time in hours
 */
function getInfusionTime(dose) {
  if ( dose > 2500 ) return 3;
  if ( dose > 2000 ) return 2.5;
  if ( dose > 1500 ) return 2;
  if ( dose > 1000 ) return 1.5;
  return 1;
};
/**
 * Calculate halflife from ke
 *
 * @param   {Number} ke    elimination rate constant
 * @returns {Number}       halflife in hours
 */
function getHalflife(ke){
  return Math.log(2) / ke;
};
/**
 * Get elimination rate constant from clearance and volume of distribution
 *
 * @param   {Number} cl   Clearance
 * @param   {Number} vd   Volume of distribution
 * @returns {Number}      Elimination rate constant (ke)
 */
function getKe(cl, vd) {
  return cl / vd;
};
/**
 * Evaluate AUC to determine if therapeutic
 * @param   {Number} auc  AUC to check
 * @returns {String}     [subtherapeutic|supratherapeutic|therapeutic]
 */
function aucTherapeutic(auc){
  if ( auc === 0 ) return '';
  if ( auc < config.aucLowNormal ) return 'subtherapeutic';
  if ( auc > config.aucHighNormal ) return 'supratherapeutic';
  return 'therapeutic';
};
/**
 * Get peak and trough from kinetic parameters *
 * @param   {Object} obj           Input parameters
 * @param   {Number} obj.dose      Dose in mg
 * @param   {Number} obj.ke        Elimination rate constant
 * @param   {Number} obj.inf       Infusion time in hours
 * @param   {Number} obj.vd        Volume of distribution in L
 * @param   {Number} obj.interval  Interval in hours
 * @returns {Object} res
 * @returns {Number} res.p         Calculated peak level
 * @returns {Number} res.tr        Calculated trough level
 */
function getPeakAndTrough({dose, ke, inf, vd, interval} = {}){
  if ( dose === 0 || ke === 0 || inf === 0 || vd === 0 || interval === 0 ) return 0;
  const peak = dose * (1 - Math.exp(-ke * inf)) / (inf * vd * ke * (1 - Math.exp(-ke * interval)));
  const trough = peak * Math.exp(-ke * (interval - inf));
  return {p: peak, tr: trough};
};
/**
 * Calculate volume of distribution based on patient's weight, using 0.5 L/kg
 * for BMI >= 40 otherwise using 0.7 L/kg
 *
 * @param   {Object} obj    Input parameters
 * @param   {Number} bmi    Body mass index in kg/m^2
 * @param   {Number} wt     Weight in kg
 * @returns {Number}        Volume of distribution in L
 */
function getVd({bmi, wt} = {}){
  if ( bmi === 0 ) return 0;
  if ( bmi >= 40 ) return wt*0.5;
  return wt * 0.7;
};
/**
 * Get the per-protocol recommended initial maintenance dose range.
 *
 * @param   {object}   obj                       Input parameters
 * @param   {number}   obj.age                   patient age in years
 * @param   {number}   obj.indication            selectedIndex of indication list
 * @param   {number}   obj.crcl                  CrCl to use for dosing
 * @param   {number}   obj.hd                    selectedIndex of HD status
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
function getMaintenanceDoseRange({age, indication, crcl, hd} = {}){
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
  const { maxDailyDose, maxHDDose, maxPDDose } = config;
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
  if ( hd === 1 ) { // HD
    return {
      low: 10,
      high: 10,
      freqText: 'after each HD',
      maxDose: maxHDDose,
      maxDoseExceededText: `[max ${maxHDDose} mg initial dose for HD]`
    };
  }
  // PD
  if ( hd === 2 ) return { // PD
    low: 10,
    high: 15,
    freqText: 'when random level &lt;&nbsp;15&nbsp;mcg/mL<br>Check first random level with AM labs ~48&nbsp;hrs after load.',
    maxDose: maxPDDose,
    maxDoseExceededText: `[max ${maxPDDose} mg initial dose for PD]`
  }
  if ( hd === 4 ) return { // SLED
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
};
/**
 * Round a dosing interval to the nearest common frequency.
 * Possible return values are 0, 6, 8, 12, 18, 24, and 48
 *
 * @param   {Number} freq  Interval in hours
 * @returns {Number}       Rounded frequency
 */
function getRoundedFrequency(freq){
  if ( freq === 0 ) return 0;
  if ( freq < 7 ) return 6;
  if ( freq < 10 ) return 8;
  if ( freq < 16 ) return 12;
  if ( freq < 21 ) return 18;
  if ( freq < 36 ) return 24;
  return 48;
};
/**
 * Get suggested interval based on halflife
 *
 * @param   {Number} halflife   halflife in hours
 * @returns {Number}            frequency in hours
 */
function getSuggestedInterval(halflife) {
  const h = checkValue(halflife);
  if ( h === 0 ) return 0;
  if ( h < 7 ) return 6;
  if ( h < 10 ) return 8;
  if ( h < 15 ) return 12;
  if ( h < 21 ) return 18;
  if ( h < 36 ) return 24;
  return 48;
};
/**
 * Calculate vancomycin clearance using Crass method
 *
 * @param   {Object}         obj
 * @param   {Number}         obj.age   Age in years
 * @param   {Number}         obj.scr   Serum creatinine in mg/dL
 * @param   {String|Number}  obj.sex   Sex (expects "M", "F", or 0)
 * @param   {Number}         obj.wt    Weight in kg
 * @returns {Number}                   Vancomycin clearance in L/hr
 */
function getVCLCrass({age, scr, sex, wt} = {}){
  if ( age === 0 || sex === 0 || scr === 0 || wt === 0 ) return 0;
  const _sex = (sex === "M") ? 1 : 0;
  const cl = (9.656 - 0.078 * age) - (2.009 * scr) + (1.09 * _sex) + (0.04 * (wt**0.75));
  return cl;
};
// TODO: document loadingDose
export function loadingDose({ht = 0, wt = 0, age = 0, sex = 0, bmi = 0, hd, vancoIndication} = {}){
  if ( ht === 0 || wt === 0 || age === 0 ) return '';
  // Pediatric loading dose
  if ( age < 18 ) {
    if ( childIsObese({age: age, sex: sex, bmi: bmi}) ) {
      return `Consider loading dose of ${roundDose(20*wt, age)} mg<br><i>(BMI &ge; 95th percentile for age)</i>`;
    }
    return 'Loading dose not recommended in non-obese pediatric patients';
  }
  let _load = 0;
  // Adult loading dose
  if ( hd === 0) {
    if ( vancoIndication === 2 && bmi < 30 ) {
      _load = config.load.sepsis;
    } else {
      _load = config.load.def;
    }
  } else if ( hd === 1 ) {
    _load = config.load.hd;
  } else if ( hd === 2 ) {
    _load = config.load.pd;
  } else if ( hd === 3 ) {
    _load = config.load.crrt;
  } else if ( hd === 4 ) {
    _load = config.load.sled;
  }

  let d1 = roundTo(_load.low * wt, 250);
  let d2 = roundTo(_load.high * wt, 250);
  const bmiText = ( bmi >= 30 && vancoIndication === 2 && hd === 0 ) ? " for BMI &ge; 30" : "";
  let result = `<br><i>(${_load.low}${_load.low === _load.high ? "" : (" - " + _load.high)} mg/kg)${bmiText}`;
  if (d1 > _load.max || d2 > _load.max) {
    if ( hd === 2 ) {
      result += ` [Max ${_load.max} mg for PD]`;
    } else {
      result += ` [Max ${_load.max} mg]`;
    }
    d1 = Math.min(d1, _load.max);
    d2 = Math.min(d2, _load.max);
  }
  return (d1 === d2 ? `${d1} mg` : `${d1} - ${d2} mg`) + result + "</i>";
};
// TODO: document getmaintenanceDose
export function getMaintenanceDose({age, wt, ibw, scr, hd, indication, crcl} = {}){
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
  } = getMaintenanceDoseRange({
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
      let lowSingleDose = roundDose( lowDailyPedsMg / ( 24 / f ), age );
      let highSingleDose = roundDose( highDailyPedsMg / ( 24 / f ), age );
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

  let lowDose = lowMg > 0 ? lowMg : roundDose(wt * low, age),
      highDose = highMg > 0 ? highMg : roundDose(wt * high, age),
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
};
/**
 * Get monitoring recommendations for initial per-protocol dosing
 *
 * @param   {Object} obj
 * @param   {Number} obj.freq             Frequency in hours
 * @param   {Number} obj.hd               Dialysis status as selectedIndex
 * @param   {Number} obj.crcl             Creatinine clearance in mL/min
 * @param   {Number} obj.scr              Serum creatinine in mg/dL
 * @param   {Number} obj.bmi              Body mass index in kg/m^2
 * @param   {Number} obj.indication       Indication as selectedIndex
 * @param   {Number} obj.age              Age in years
 * @returns {Object} res
 * @returns {String} res.monitoring       Monitoring recommendation as HTML string
 * @returns {String} res.targetLevelText  Target level as HTML string
 * @returns {String} res.pkParam          Parameter used for dosing (trough|auc)
 * @returns {Number} res.targetMin        Bottom of target range
 * @returns {Number} res.targetMax        Top of target range
 * @returns {Number} res.goalTroughIndex  Goal trough as selectedIndex
 */
export function getMonitoringRecommendation( {freq, hd, crcl, scr, bmi, indication, age } = {} ){
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
};
/**
 * Get initial pharmacokinetic dosing
 *
 * @param   {Object}        obj
 * @param   {Number}        obj.method
 * @param   {Number}        obj.crcl        Creatinine clearance in mL/min
 * @param   {Number}        obj.age         Age in years
 * @param   {Number}        obj.scr         Serum creatinine in mg/dL
 * @param   {String|Number} obj.sex         Sex (expects "M", "F", or 0)
 * @param   {Number}        obj.wt          Weight in kg
 * @param   {Number}        obj.bmi         Body mass index in kg/m^2
 * @param   {Number}        obj.infTime = 1 Infusion time  in hours
 * @param   {Number}        obj.goalMin     Bottom of goal range
 * @param   {Number}        obj.goalMax     Top of goal range
 * @param   {Number}        obj.selDose     Selected dose in mg
 * @param   {Number}        obj.selFreq     Selected frequency in hours
 * @returns {Object}        res
 * @returns {Number}        res.vd                Volume of distribution in L
 * @returns {Number}        res.pkHalflife        Halflife in hours
 * @returns {Number}        res.ke                Elimination rate constant
 * @returns {Number[]}      res.arrDose           Possible doses
 * @returns {Boolean[]}     res.arrViable         Whether dose is viable
 * @returns {Number[]}      res.arrLevel          Expected level for dose
 * @returns {Number}        res.pkFreq            Selected frequency or recommended frequency if none selected
 * @returns {Number}        res.pkLevel           Expected level from selected frequency
 * @returns {Number}        res.pkRecDose         Recommended dose in mg
 * @returns {Number}        res.pkRecFreq         Recommended frequency in hours
 * @returns {Number}        res.pkRecLevel        Expected level from recommended dose and frequency
 * @returns {String}        res.pkLevelLabel      Label for target level
 * @returns {String}        res.pkLevelUnits      Units of target level
 * @returns {String}        res.pkLevelRowHeading Row heading for level row of dosing table
 */
export function getInitialDosing({method, crcl, age, scr, sex, wt, bmi, infTime = 1, goalMin, goalMax, selDose, selFreq} = {}){
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
  res.vd = getVd({bmi: bmi, wt: wt});

  if ( method === 'trough') {
    res.pkLevelRowHeading = 'Est. Trough (mcg/mL)';
    res.pkLevelUnits = ' mcg/mL';
    res.pkLevelLabel = 'Est. Trough';
    res.ke = ( (0.695 * crcl + 0.05) * 0.06 ) / res.vd;
    res.pkHalflife = getHalflife(res.ke);
    res.pkRecFreq = getSuggestedInterval(res.pkHalflife);
    res.pkFreq = selFreq > 0 ? selFreq : res.pkRecFreq;
    let useDose = 0;

    let rec = {
      arrDose: [],
      arrLevel: [],
      arrViable: [],
      useDose: 0
    }

    config.doses.forEach( (d, i) => {
      rec.arrDose.push(d);
      const infTime = getInfusionTime(d);
      const {p, tr} = getPeakAndTrough({dose: d, ke: res.ke, inf: infTime, vd: res.vd, interval: res.pkRecFreq});
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

    config.doses.forEach( (d, i) => {
      res.arrDose.push(d);
      const infTime = getInfusionTime(d);
      const {p, tr} = getPeakAndTrough({dose: d, ke: res.ke, inf: infTime, vd: res.vd, interval: res.pkFreq});
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
      const newInfTime = getInfusionTime(selDose);
      const {p, tr} = getPeakAndTrough({dose: selDose, ke: res.ke, inf: newInfTime, vd: res.vd, interval: selFreq})
      res.pkLevel = tr;
      res.pkDose = selDose;
    }
  } else if ( method === 'auc') {
    // As per initial AUC dosing section of Epic Kinetics calculator.  Not currently used in this app.
    res.pkLevelRowHeading = 'Est. AUC<sub>24</sub>';
    res.pkLevelUnits = '';
    res.pkLevelLabel = 'Est. AUC<sub>24</sub>';
    const ke = (0.00083 * crcl) + 0.0044; // Matzke method

    res.pkHalflife = getHalflife(ke);
    const cl = bmi > 30 ? vd * ke : getVCLCrass({age: age, scr: scr, sex: sex, wt: wt});
    res.pkRecFreq = res.pkHalflife + infTime;
    res.pkRecLevel =  ( goalMin + goalMax ) / 2;
    const recTdd = cl * res.pkRecLevel;
    res.pkRecDose = recTdd * res.pkRecFreq/24;

    if ( selFreq !== 0 ) {
      res.pkFreq = selFreq;
      config.doses.forEach( (d, i) => {
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
};
/**
 * Calculated AUC results
 *
 * @typedef {Object}  AucCurrent
 *
 * @property {Number} vd              Volume of distribution
 * @property {Number} ke              Elimination rate constant
 * @property {Number} halflife        Halflife
 * @property {Number} auc24           AUC 24
 * @property {Number} aucInf          AUC_infusion
 * @property {Number} aucElim         AUC_elimination
 * @property {Number} truePeak        True peak level
 * @property {Number} trueTrough      True trough level
 * @property {Number} tInf            Infusion time
 * @property {String} therapeutic     [subtherapeutic|supratherapeutic|therapeutic]
 * @property {Number} oldDose         Current dose in mg
 * @property {Number} oldInterval     Current interval in hours
 * @property {Number} goalTroughLow   Bottom of personalized goal trough range
 * @property {Number} goalTroughHigh  Top of personalized goal trough range
 */
/**
 * Calculate AUC and personalized goal trough
 *
 * @param   {Object}     obj             Input parameters
 * @param   {Number}     obj.dose        Current dose in mg
 * @param   {Number}     obj.interval    Current interval in hours
 * @param   {Number}     obj.trough      Current measured trough
 * @param   {Number}     obj.peak        Current measured peak
 * @param   {Number}     obj.troughTime  Time from dose to trough in hours
 * @param   {Number}     obj.peakTime    Time from dose to peak in hours
 * @returns {AucCurrent}                 Calculation results (or undefined if inadequate inputs)

 */
export function calculateAUC({dose = 0, interval = 0, trough = 0, peak = 0, troughTime = 0, peakTime = 0} = {}) {

  if (
    dose === 0 || interval === 0 ||
    trough === 0 || peak === 0 ||
    troughTime === 0 || peakTime === 0
  )  return undefined;

  const tInf = getInfusionTime(dose);
  const ke = -Math.log(trough/peak)/(troughTime-peakTime);
  const truePeak = peak/(Math.exp(-ke*(peakTime-tInf)));
  const trueTrough = trough*Math.exp(-ke*(interval-troughTime));
  const aucInf = (truePeak+trueTrough)*tInf/2;
  const aucElim = (truePeak-trueTrough)/ke;
  const auc24 = (aucInf+aucElim)*24/interval;
  const vd = (dose/tInf)*(1-Math.exp(-ke*tInf))/(ke*(truePeak-(trueTrough*Math.exp(-ke*tInf))));
  const goalTroughLow = config.aucLowNormal * trueTrough / auc24;
  const goalTroughHigh = config.aucHighNormal * trueTrough / auc24;
  return {
    vd: vd,
    ke: ke,
    halflife: getHalflife(ke),
    auc24: auc24,
    aucInf: aucInf,
    aucElim: aucElim,
    truePeak: truePeak,
    trueTrough: trueTrough,
    tInf: tInf,
    therapeutic: aucTherapeutic(auc24),
    oldDose: dose,
    oldInterval: interval,
    goalTroughLow: goalTroughLow,
    goalTroughHigh: goalTroughHigh
  };
};
/**
 * Calculate data for table of doses based on selected interval
 *
 * @param   {AucCurrent} aucCurrent  AUC calculation results
 * @param   {Number}     interval    Selected interval in hours
 * @returns {Object}     res
 * @returns {Number[]}   res.dose         New dose in mg
 * @returns {Number[]}   res.auc          Predicted AUC from new dose
 * @returns {Number[]}   res.infTime      Infusion time in hours
 * @returns {Number[]}   res.trough       Calculated trough level
 * @returns {Number[]}   res.peak         Calculated peak level
 * @returns {Boolean[]}  res.therapeutic  If resulting AUC is therapeutic
 */
export function calculateAUCNew(aucCurrent, interval){
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

  for (let dose of config.doses) {
    let infTime = getInfusionTime(dose);
    let auc = auc24*(dose*24/interval)/(oldDose*24/oldInterval);
    let peak = (dose/infTime)*(1-Math.exp(-ke*infTime))/(vd*ke*(1-Math.exp(-ke*interval)));
    let trough = peak*Math.exp(-ke*(interval-infTime));
    let thx = ( auc >= config.aucLowNormal && auc <= config.aucHighNormal ) ? true : false;
    res.dose.push(dose);
    res.auc.push(auc);
    res.infTime.push(infTime);
    res.trough.push(trough);
    res.peak.push(peak);
    res.therapeutic.push(thx);
  }
  return res;
};
/**
 * Calculate dosing for single-level adjustment
 *
 * @param   {Object} obj                   Input parameters
 * @param   {Number} obj.curDose           Current dose in mg
 * @param   {Number} obj.curFreq           Current frequency in hours
 * @param   {Number} obj.curTrough         Current trough in mg/dL
 * @param   {Number} obj.testDose          Selected dose in mg
 * @param   {Number} obj.testFreq          Selected frequency in hours
 * @param   {Number} obj.goalTrough        Middle of goal trough range in mg/dL
 * @returns {Object} res
 * @returns {Number} res.linearDose        Calculated dose for linear adjustment in mg
 * @returns {Number} res.linearFreq        Calculated frequency for linear adjustment in hours
 * @returns {Number} res.linearTrough      Estimated trough from calculated dose/frequency
 * @returns {Number} res.testLinearDose    Test dose from input parameters if all inputs are valid
 * @returns {Number} res.testLinearFreq    Test frequency from input parameters if all inputs are valid
 * @returns {Number} res.testLinearTrough  Est trough from test dose and test frequency
 */
export function getLinearAdjustment({curDose, curFreq, curTrough, testDose, testFreq, goalTrough} = {}){

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
};
/**
 * Calculate single level pharmacokinetic dose adjustment
 *
 * @param   {Object}    obj             Input parameters
 * @param   {Number}    obj.bmi         Body mass index in kg/m^2
 * @param   {Number}    obj.wt          Weight in kg
 * @param   {Number}    obj.curDose     Current dose in mg
 * @param   {Number}    obj.curFreq     Current frequency in hours
 * @param   {Number}    obj.curTrough   Measured trough in mg/dL
 * @param   {Number}    obj.troughTime  Time before next dose that trough was drawn
 * @param   {Number}    obj.goalTrough  Middle of goal trough range
 * @param   {Number}    obj.goalMin     Minimum of goal trough range
 * @param   {Number}    obj.goalMax     Maximum of goal trough range
 * @param   {Number}    obj.goalPeak    Goal peak level
 * @param   {Number}    obj.selFreq     Selected new frequency
 * @param   {Number}    obj.selDose     Selected new dose
 * @returns {Object}    res
 * @returns {Number[]}  res.newDose     Possible new doses
 * @returns {Number[]}  res.newTrough   Troughs from newDose and newFreq
 * @returns {Boolean[]} res.newViable   Whether newTrough is within target range
 * @returns {Number}    res.recFreq     Recommended new frequency
 * @returns {Number}    res.selFreq     Selected new frequency from input parameters if all inputs are valid
 * @returns {Number}    res.newFreq     selFreq if defined, otherwise recFreq
 * @returns {Number}    res.recDose     Recommended new dose
 * @returns {Number}    res.selDose     Selected new dose from input parameters if all inputs are valid
 * @returns {Number}    res.newDose     selDose if defined, otherwise recDose
 * @returns {Number}    res.recTrough   Calculated trough from recDose and recFreq
 * @returns {Number}    res.selTrough   Calculated trough from selDose and selFreq
 * @returns {Number}    res.newTrough   Calculated trough from newDose and newFreq
 */
export function getSingleLevelAdjustment({bmi, wt, curDose, curFreq, curTrough, troughTime, goalTrough, goalMin, goalMax, goalPeak, selFreq, selDose} = {}){
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
  const vd = getVd({bmi: bmi, wt: wt});
  const infTime = getInfusionTime(curDose);
  const ke = Math.log( ( ( curDose / vd ) + curTrough ) / curTrough ) / ( curFreq - troughTime );
  const estTrough = curTrough * Math.exp(-ke * troughTime);
  const estPeak = estTrough / Math.exp(-ke * ( curFreq - infTime - troughTime));
  res.halflife = getHalflife(ke);

  res.recFreq = getRoundedFrequency(infTime + ( Math.log(goalTrough/goalPeak) / -ke ));
  const arrDose = [];
  const arrTrough = [];
  const arrViable = [];
  let useDose = 0;

  config.doses.forEach( (d, i) => {
    const {p, tr} = getPeakAndTrough({dose: d, ke: ke, inf: getInfusionTime(d), vd: vd, interval: res.recFreq});
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

  config.doses.forEach( (d, i) => {
    const {p, tr} = getPeakAndTrough({dose: d, ke: ke, inf: getInfusionTime(d), vd: vd, interval: res.newFreq});
    res.newDose.push(d);
    res.newTrough.push(tr);
    res.newViable.push(tr >= goalMin && tr <= goalMax);
  });

  if ( selDose > 0 && selFreq > 0 ){
    const {p, tr} = getPeakAndTrough({dose: selDose, ke: ke, inf: getInfusionTime(selDose), vd: vd, interval: selFreq});
    res.selDose = selDose;
    res.selFreq = selFreq;
    res.selTrough = tr;
  }

  return res;

};
/**
 * Calculate dose adjustments using two levels and kinetic calculations
 * Target trough is fixed at 10-20 mcg/mL
 *
 * @param   {Object}    obj                   Input parameters
 * @param   {Number}    obj.wt                Weight in kg
 * @param   {Number}    obj.bmi               Body mass index in kg/m^2
 * @param   {Number}    obj.ke                Elimination rate constant
 * @param   {Number}    obj.selectedInterval  Selected interval in hours
 * @returns {Object}    res
 * @returns {Number}    res.vd                Volume of distribution
 * @returns {Number}    res.halflife          Halflife in hours (from obj.ke)
 * @returns {Number[]}  res.newDose           Possible new doses
 * @returns {Number[]}  res.infTime           Infusion time for new doses
 * @returns {Number[]}  res.newPeak           Peaks from newDose and newFreq
 * @returns {Number[]}  res.newTrough         Troughs from newDose and newFreq
 * @returns {Boolean[]} res.newViable         Whether newTrough is within target range
 * @returns {Number}    res.pkFreq            Recommended frequency (or selected frequency if chosen)
 * @returns {Number}    res.pkDose            Recommended dose given pkFreq
 * @returns {Number}    res.pkTrough          Estimated torugh from pkDose and pkFreq
 */
export function calculateTwoLevelPK({ wt = 0, bmi = 0, ke= 0, selectedInterval= 0 } = {}){
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
    vd: 0,
    pkDose: 0,
    pkFreq: 0,
    pkTrough: 0,
    halflife: 0
  };
  if ( ke <= 0 ) return res;
  res.vd = getVd({bmi: bmi, wt: wt});
  res.halflife = getHalflife(ke);
  res.pkFreq = selectedInterval > 0 ? selectedInterval : getSuggestedInterval(res.halflife);
  config.doses.forEach( (d, i) => {
    res.newDose.push(d);
    const infTime = getInfusionTime(d);
    res.infTime.push(infTime);
    const {p, tr} = getPeakAndTrough({dose: d, ke: ke, inf: infTime, vd: res.vd, interval: res.pkFreq});
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
  return res;
};
/**
 * Get dose revision recommendation for dialysis patients
 *
 * @param   {Object} obj      Input parameters
 * @param   {Number} wt       Patient's weight in kg
 * @param   {Number} trough   Measured trough level
 * @returns {String}          Recommendation as HTML string
 */
export function hdRevision({wt, trough} = {}){
  if ( trough === 0 ) return '';
  if ( trough < 10 ) {
    if ( wt === 0 ) return "Reload with 25 mg/kg <br>and increase maintenance dose by 250-500 mg";
    const ld = Math.min(roundTo(25*wt, 250), config.load.hd.max);
    return `Reload with ${ld} mg<br> and increase maintenance dose by 250-500 mg`;
  }
  if ( trough < 15 ) return "Increase dose by 250-500 mg";
  if ( trough > 25 ) return "Hold x 1, recheck level prior to next<br>dialysis session and dose accordingly."
  if ( trough > 20 ) return "Decrease dose by 250-500 mg";
  return "Therapeutic - continue current dose";
};
