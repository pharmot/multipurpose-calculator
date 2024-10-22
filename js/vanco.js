/**
 * Vancomycin dosing calculations
 * @module vanco
 * @requires module:util
 * @requires module:growthCharts
 */

import { checkValue, roundTo } from './util.js';
import { childIsObese } from './growthCharts.js';
import * as LOG from "./logger.js";

/**
 * Configuration for vancomycin calculations and related input validation.
 * @type     {VancoConfig}
 * @default 
 */
export const config = {
  doses: [500, 750, 1000, 1250, 1500, 1750, 2000],
  load: {
    def: { low: 25, high: 25, max: 3000 },
    sepsis: { low: 25, high: 35, max: 3000 },
    hd: { low: 25, high: 25, max: 2000 },
    pd: { low: 25, high: 25, max: 2000 },
    crrt: { low: 20, high: 25, max: 3000 },
    sled: { low: 20, high: 25, max: 3000 },
  },
  maxHDDose: 1500,
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
    timeMax: 60,
    infTimeMin: 30,
    infTimeMax: 480,
  },
};
/**
 * Round dose per protocol - to nearest 250 mg if adult or if dose is
 * greater than or equal to 250 mg, otherwise to nearest 25 mg.
 *
 * @param   {Number} dose    Dose in mg
 * @param   {Number} age     Age in years (default 18)
 * @returns {Number}         Rounded dose in mg
 */
function roundDose(dose, age = 18) {
  LOG.beginFunction('VANCO: roundDose', {dose, age});
  let res;
  if ( age >= 18 ) {
    LOG.log('Adult, round to nearest 250 mg')
    res = roundTo(dose, 250);
  } else {
    const rounded = roundTo(dose, 25);
    if ( rounded >= 250 ) {
      LOG.log('Pediatric, but dose is over 250 mg, round to nearest 250 mg')
      res = roundTo(dose, 250);
    } else {
      LOG.log(`Pediatric, round to nearest 25 mg => ${rounded}`);
      res = rounded;
    }
  }
  LOG.log(`Result: ${res} mg`)
  LOG.groupEnd();
  return res;
}
/**
 * Get standard infusion time from dose
 *
 * @param   {Number} dose   Dose in mg
 * @returns {Number}        Infusion time in hours
 */
export function getInfusionTime(dose) {
  LOG.beginFunction('VANCO: getInfusionTime', {dose});
  let res = 1
  if ( dose > 2500 ) res = 3;
  if ( dose > 2000 ) res = 2.5;
  if ( dose > 1500 ) res = 2;
  if ( dose > 1000 ) res = 1.5;
  LOG.endResult(res);
  return res;
}
/**
 * Calculate halflife from ke
 *
 * @param   {Number} ke    elimination rate constant
 * @returns {Number}       halflife in hours
 */
function getHalflife(ke) {
  LOG.beginFunction('VANCO: getHalflife', {ke});
  const res = Math.log(2) / ke;
  LOG.endResult(res);
  return res;
}
/**
 * Get elimination rate constant from clearance and volume of distribution
 *
 * @param   {Number} cl   Clearance
 * @param   {Number} vd   Volume of distribution
 * @returns {Number}      Elimination rate constant (ke)
 */
function getKe(cl, vd) {
  LOG.beginFunction('VANCO: getKe', {cl, vd});
  const res = cl / vd;
  LOG.endResult(res);
  return res;

}
/**
 * Evaluate AUC to determine if therapeutic
 * @param   {Number} auc  AUC to check
 * @returns {String}     [subtherapeutic|supratherapeutic|therapeutic]
 */
function aucTherapeutic(auc) {
  LOG.beginFunction('VANCO: aucTherapeutic', arguments);
  let res;
  if ( auc === 0 ) {
    res = '';
  } else if ( auc < config.aucLowNormal ) {
    res = 'subtherapeutic';
  } else if ( auc > config.aucHighNormal ) {
    res = 'supratherapeutic';
  } else {
    res = 'therapeutic';
  }
  LOG.endResult(res);
  return res;
}
/**
 * Get peak and trough from kinetic parameters
 * @param   {VancoPeakTroughParams} 
 * @returns {VancoPeakTroughResult}
 
 */
function getPeakAndTrough({ dose, ke, inf, vd, interval } = {}) {
  LOG.beginFunction('VANCO: getPeakAndTrough', arguments);
  if ( dose === 0 || ke === 0 || inf === 0 || vd === 0 || interval === 0 ) {
    LOG.exitFunction();
    return 0;
  }
  const peak = dose * (1 - Math.exp(-ke * inf)) / (inf * vd * ke * (1 - Math.exp(-ke * interval)));
  const trough = peak * Math.exp(-ke * (interval - inf));
  const res = { p: peak, tr: trough };
  LOG.endResult(res);
  return res;
}
/**
 * Calculate volume of distribution based on patient's weight, using 0.5 L/kg
 * for BMI >= 40 otherwise using 0.7 L/kg
 *
 * @param   {VancoVdParams}
 * @returns {Number}        Volume of distribution in L
 */
function getVd({ bmi, wt } = {}) {
  LOG.groupCollapsed('[FUNCTION] getVd');
  LOG.log(`Input: BMI => ${bmi}; wt => ${wt}`);
  let res;
  if ( bmi === 0 ) {
    LOG.exitFunction();
    return 0;
  }
  if ( bmi >= 40 ) {
    LOG.log('Equation: Vd = 0.5 x wt (for BMI >= 40)');
    res = wt * 0.5;
  } else {
    LOG.log('Equation: Vd = 0.7 x wt (for BMI < 40)');
    res = wt * 0.7;
  }  
  LOG.log(`Result: ${res}`);
  LOG.groupEnd();
  return res;
}
/**
 * Get the per-protocol recommended initial maintenance dose range.
 * @param   {VancoMaintRangeParams}
 * @returns {VancoMaintRangeResult}
 */
function getMaintenanceDoseRange({ age, indication, crcl, hd, aki } = {}) {
  LOG.beginFunction('VANCO: getMaintenanceDoseRange', arguments);

  if ( age < 12 && hd === 0 ) {
    LOG.log('Pediatric (non-HD), age < 12');
    const res = {
      lowDailyPeds: 60,
      highDailyPeds: 80,
      freqs: [6],
    };
    LOG.endResult(res);
    return res;
  }
  if ( age < 18 && hd === 0 ) {
    LOG.log('Pediatric (non-HD), age 12-18');
    const res = {
      lowDailyPeds: 60,
      highDailyPeds: 70,
      freqs: [6, 8],
    };
    LOG.endResult(res);
    return res;
  }
  const { maxDailyDose, maxHDDose, maxPDDose } = config;  
  const res = { maxDaily: maxDailyDose };
  if ( hd === 0 ) {    

    if ( aki ) {
      LOG.log('AKI; 10 mg/kg when level < 15 or 20')
      res.low = 10;
      res.high = 10;
      res.freqText = `when level &le; ${indication > 1 ? '20' : '15'} mcg/mL.`
      LOG.endResult(res);
      return res;
    }  

    if ( crcl >= 75 ) {
      if ( age < 40 ) {
        LOG.log('Non-HD; CrCl >= 75; Age < 40; Frequency = q8h');
        res.freq = 8;        
      } else {
        LOG.log('Non-HD; CrCl >= 75; Age >= 40; Frequency = q12h');
        res.freq = 12;
      }
      if ( age < 70 ) {
        LOG.log('....................Age < 70; Dose = 15-20 mg/kg');
        res.low = 15;
        res.high = 20;
      } else {
        LOG.log('....................Age >= 70; Dose = 10-15 mg/kg');
        res.low = 10;
        res.high = 15;
      }
    } else if ( crcl >= 50 ) {
      if ( age < 70 ) {
        LOG.log('Non-HD; CrCl 50-75; Age < 70; Dose = 15-20 mg/kg q12h');
        res.low = 15;
        res.high = 20;
        res.freq = 12;
      } else if ( age < 80 ) {
        LOG.log('Non-HD; CrCl 50-75; Age 70-79; Dose = 10-15 mg/kg q12h');
        res.low = 10;
        res.high = 15;
        res.freq = 12;        
      } else {
        LOG.log('Non-HD; CrCl 50-75; Age >= 80; Dose = 15-20 mg/kg q24h')
        res.low = 15;
        res.high = 20;
        res.freq = 24;
      }
    } else if ( crcl >= 35 ) {
      if ( age < 70 ) {
        LOG.log('Non-HD; CrCl 35-50; Age < 70; Dose = 15-20 mg/kg q24h')
        res.low = 15;
        res.high = 20;
        res.freq = 24;
      } else if ( age < 80 ) {
        LOG.log('Non-HD; CrCl 35-50; Age 70-79; Dose = 10-15 mg/kg q24h')
        res.low = 10;
        res.high = 15;
        res.freq = 24;
      } else {
        LOG.log('Non-HD; CrCl 35-50; Age >= 80; Dose = 10 mg/kg q24h')
        res.low = 10;
        res.high = 10;
        res.freq = 24;
      }
    } else if ( crcl >= 15 ) {
      res.freq = 24;
      if ( age < 80 ) {
        LOG.log('Non-HD; CrCl 15-35; Age < 80; Dose = 10 mg/kg q24h')
        res.low = 10;
        res.high = 10;
      } else {
        LOG.log('Non-HD; CrCl 15-35; Age < 80; Dose = 7.5 mg/kg q24h')
        res.low = 7.5;
        res.high = 7.5;
      }
    } else {
      LOG.log('Non-HD; CrCl < 15; Dose = 15-20 mg/kg x1 and check level')
      res.low = 15;
      res.high = 20;
      res.freqText = `x 1 and consider checking level in 24-48 hours.<br>Repeat dose when level &le; ${indication > 1 ? '20' : '15'} mcg/mL.`;
    }
    LOG.endResult(res);
    return res;
  }
  if ( hd === 1 ) {
    LOG.log('HD; Dose = 10 mg/kg after first HD');    
    res.low = 10;
    res.high = 10;
    res.freqText = 'after first HD';
    res.maxDose = maxHDDose;
    res.maxDoseExceededText = `[max ${maxHDDose} mg initial dose for HD]`;
    LOG.endResult(res);
    return res;
  }
  if ( hd === 2 ) {
    LOG.log('PD; Dose = 10-15 mg/kg when random level < 15');
    res.low = 10;
    res.high = 15;
    res.freqText = 'when random level &lt;&nbsp;15&nbsp;mcg/mL<br>Check first random level with AM labs ~48&nbsp;hrs after load.';
    res.maxDose = maxPDDose;
    res.maxDoseExceededText = `[max ${maxPDDose} mg initial dose for PD]`;
    LOG.endResult(res);
    return res;
  }
  if ( hd === 4 ) {
    LOG.log('SLED; Dose = 15-20 mg/kg after each session');
    res.low = 15;
    res.high = 20;
    res.freqText = 'after SLED session ends (or in last 60-90&nbsp;minutes)';
    res.maxDaily = maxDailyDose;
    LOG.endResult(res);
    return res;
  }

  LOG.log('CVVH/CVVHD/CVVHDF; dose = 7.5-10 mg/kg q12-24h')
  res.low = 7.5;
  res.high = 10;
  res.freqText = `q12-24h`;
  res.textBeforeDose = 'Check random level q24h until &lt; 20 mcg/mL, then start ';
  res.maxDaily = maxDailyDose;
  LOG.endResult(res);
  return res;
}
/**
 * Round a dosing interval to the nearest common frequency.
 * Possible return values are 0, 6, 8, 12, 18, 24, and 48
 *
 * @param   {Number} freq  Interval in hours
 * @returns {Number}       Rounded frequency
 */
function getRoundedFrequency(freq) {
  LOG.beginFunction('VANCO: getRoundedFrequency', arguments);
  let res;
  if ( freq === 0 ) {
    res = 0;
  } else if ( freq < 7 ) {
    res = 6;
  } else if ( freq < 10 ) {
    res = 8;
  } else if ( freq < 16 ) {
    res = 12;
  } else if ( freq < 21 ) {
    res =  18; 
  } else if ( freq < 36 ) {
    res = 24;
  } else {
    res = 48;
  }
  LOG.endResult(res);
  return res;
}
/**
 * Get suggested interval based on halflife
 *
 * @param   {Number} halflife   halflife in hours
 * @returns {Number}            frequency in hours
 */
function getSuggestedInterval(halflife) {
  LOG.groupCollapsed('[FUNCTION] getSuggestedInterval');
  LOG.log(`Input: halflife => ${halflife}`);
  let res;
  const h = checkValue(halflife);
  if ( h === 0 ) {
    res = 0;
  } else if ( h < 7 ) {
    res = 6;
  } else if ( h < 10 ) {
    res = 8;
  } else if ( h < 15 ) {
    res = 12;
  } else if ( h < 21 ) {
    res = 18;
  } else if ( h < 36 ) {
    res = 24;
  } else {
    res = 48;
  }
  LOG.log(`Result: ${res}`)
  LOG.groupEnd();
  return res;
}
/**
 * Calculates vancomycin clearance using Crass method
 * @param   {VancoClCrassParams}
 * @returns {Number}                   Vancomycin clearance in L/hr
 */
function getVCLCrass({ age, scr, sex, wt } = {}) {
  LOG.beginFunction('VANCO: getVCLCrass', arguments)
  if ( age === 0 || sex === 0 || scr === 0 || wt === 0 ) {
    LOG.exitFunction();
    return 0;
  }
  const _sex = sex === "M" ? 1 : 0;
  const cl = 9.656 - 0.078 * age - 2.009 * scr + 1.09 * _sex + 0.04 * Math.pow(wt, 0.75);
  LOG.endResult(cl);
  return cl;
}
/**
 * Generates loading dose recommendation based on patient info and indication/HD status
 * @param   {VancoLoadParams}
 * @returns {String}                              Loading dose recommendation (may include HTML tags)
 */
export function loadingDose({ ht = 0, wt = 0, age = 0, sex = 0, bmi = 0, hd, vancoIndication } = {}) {
  LOG.beginFunction('VANCO: loadingDose', arguments);
  if ( ht === 0 || wt === 0 || age === 0 ) {
    LOG.exitFunction();
    return '';
  }
  // Pediatric loading dose
  if ( age < 18 ) {
    if ( childIsObese({ age: age, sex: sex, bmi: bmi }) ) {
      LOG.endResult('Consider 20 mg/kg for BMI 95th percentile or above');
      return `Consider ${roundDose(20 * wt, age)} mg <i>(BMI &ge; 95th percentile)</i>`;
    }
    LOG.endResult('No loading dose for non-obese peds');
    return 'Not recommended in non-obese pediatric patients';
  }
  let _load = 0;
  // Adult loading dose
  if ( hd === 0) {
    if ( ( vancoIndication === 2 || vancoIndication === 4 ) && bmi < 30 ) {
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
  const bmiText =  bmi >= 30 && ( vancoIndication === 2 || vancoIndication === 4 ) && hd === 0  ? " for BMI &ge; 30" : "";
  let result = `&nbsp;&nbsp;&nbsp;<i>(${_load.low}${_load.low === _load.high ? "" : ` - ${  _load.high}`} mg/kg)${bmiText}`;
  if (d1 > _load.max || d2 > _load.max) {
    if ( hd === 2 ) {
      result += ` [Max ${_load.max} mg for PD]`;
    } else {
      result += ` [Max ${_load.max} mg]`;
    }
    d1 = Math.min(d1, _load.max);
    d2 = Math.min(d2, _load.max);
  }
  LOG.endResult({d1, d2, result});
  return `${(d1 === d2 ? `${d1} mg` : `${d1} - ${d2} mg`) + result  }</i>`;
}
/**
 * Generates maintenance dose recommendation based on patient info and indication/HD status
 * @param   {VancoMaintRecParams}
 * @returns {String}                         Maintenance dose recommendation (may include HTML tags)
 */
export function getMaintenanceDose({ age, wt, ibw, scr, hd, indication, crcl, aki, outlier } = {}) {
  
  LOG.beginFunction('VANCO: getMaintenanceDose', arguments);
  let res;

  if ( age >= 18 && ibw === 0 || age === 0 || wt === 0 ) {
    res = { maintText: '', freq: 0 };
    LOG.exitFunction(res);
    return res;
  }
  if ( scr === 0 && hd === 0 ) {
    res = { maintText: 'Must order SCr before maintenance dose can be calculated', freq: 0 };
    LOG.endResult(res);
    return res;
  }
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
    maxDose = 0,
  } = getMaintenanceDoseRange({
    age: age,
    indication: indication,
    crcl: crcl,
    hd: hd,
    aki: aki,
    outlier: outlier,
  });

  if ( age < 18 ) {
    
    let pedsMaint = '';
    freqs.forEach( (f, i) => {
      if ( i > 0 ) {
        pedsMaint += `<b> <i>or</i></b> `;
      }
      const lowDailyPedsMg = Math.min(lowDailyPeds * wt, 3000);
      const highDailyPedsMg = Math.min(highDailyPeds * wt, 3000);
      const lowSingleDose = roundDose( lowDailyPedsMg / ( 24 / f ), age );
      const highSingleDose = roundDose( highDailyPedsMg / ( 24 / f ), age );
      LOG.log(`Pediatric; mg dose => ${lowDailyPedsMg}-${highDailyPedsMg}; single dose => ${lowSingleDose}-${highSingleDose}`);
      if ( lowSingleDose < highSingleDose ) {
        pedsMaint += `${lowSingleDose}-`;
      }
      pedsMaint += `${highSingleDose} mg q${f}h`;
    });
    const pedsFreqText = freqs.length > 1 ? `${freqs[0]}-${freqs[1]}` : freqs[0];
    pedsMaint += `<br><i>(${lowDailyPeds}-${highDailyPeds} mg/kg/day divided q${pedsFreqText}h)</i>`;
    res = {
      maintText: pedsMaint,
      freq: 0,
    };
    LOG.endResult(res);
    return res;
  }

  let lowDose = lowMg > 0 ? lowMg : roundDose(wt * low, age),
    highDose = highMg > 0 ? highMg : roundDose(wt * high, age),
    lowDaily = 0,
    highDaily = 0,
    txtExceeds = '',
    txtMaxDose = '',
    txtDose = '';
    LOG.log(`Single dose => ${lowDose}-${highDose} mg`)

  if ( freq > 0 ) {
    lowDaily = lowDose / ( freq / 24 );
    highDaily = highDose / ( freq / 24 );
    freqText = `q${freq}h`;
    LOG.log(`Frequency => ${freqText}`)
    LOG.log(`Daily dose => ${lowDaily}-${highDaily} mg`)
  }
  if ( maxDose > 0 ) {
    if ( lowDose > maxDose || highDose > maxDose ) {
      LOG.log(`Single dose (low and or high) is above max (${maxDose})`);
      lowDose = Math.min(lowDose, maxDose);
      highDose = Math.min(highDose, maxDose);
      txtExceeds = `[Max ${maxDose} mg]`;
    }
  }
  if ( maxDaily > 0 ) {
    if ( lowDaily > maxDaily ) {
      LOG.log(`Daily dose is above max daily dose (${maxDaily} mg/day)`);
      txtExceeds = `<br>***Protocol exceeds ${maxDaily / 1000} g/day***`;
    } else if ( highDaily > maxDaily ) {
      LOG.log(`Upper range of daily dose is above max (${maxDaily} mg/day)`);
      txtExceeds = `<br>***Upper range of protocol exceeds ${maxDaily / 1000} g/day***`;
    }
  }
  // v1.3.1, 'consider' is no longer used
  if ( consider > 0 && lowDose !== highDose ) {
    considerText = `<br><i>Consider dosing closer to ${lowDose} mg.</i>`;
  }

  if ( lowDose !== highDose ) {
    txtDose = `${lowDose} - `;
  }
  res = {
    maintText: `${textBeforeDose}${txtDose}${highDose} mg ${freqText} ${considerText}${txtExceeds}`,
    freq: freq,
  };
  LOG.endResult(res);
  return res;
}
/**
 * Get monitoring recommendations for initial per-protocol dosing
 * @param   {VancoProtMonRecParams}
 * @returns {VancoProtMonRecResult}
 */
export function getMonitoringRecommendation( { freq, hd, crcl, scr, bmi, indication, age, aki, outlier } = {} ) {
  LOG.beginFunction('VANCO: getMonitoringRecommendation', arguments);

  const res = {
    monitoring: '',
    targetLevelText: '',
    targetMin: 0,
    targetMax: 0,
    goalTroughIndex: -1,
    method: '', //TODO: keep
  };

  // Pediatric
  if ( age > 0 && age < 18 ) {
    LOG.log('Pediatric patient')
    res.monitoring = 'Initial trough level when at steady state<br>(if therapy anticipated to be &gt;&nbsp;72&nbsp;hours)';
    if ( indication > 1 ) {
      LOG.log('Indication is severe sepsis and/or CNS');
      res.monitoring += '<br>Consider first level within 24-48 hours if serious MRSA infection';
    }
    if ( indication === 1 ) {
      LOG.log('Indication is SSTI/UTI');
      res.targetLevelText = 'Trough 10-15&nbsp;mcg/mL';
      res.targetMin = 10;
      res.targetMax = 15;
      res.goalTroughIndex = 1;
    } else {
      LOG.log('Indication is not SSTI/UTI');
      res.targetLevelText = 'AUC:MIC 400-600&nbsp;mcg&middot;hr/mL';
      res.targetMin = 10;
      res.targetMax = 15;
      res.goalTroughIndex = 1;
    }
    LOG.endResult(res);
    return res;
  }

  if ( hd === 0 && crcl === 0 ) {
    LOG.exitFunction(res);
    return res;
  }
  
  if ( hd > 0 ) {
    LOG.log("Dialysis patient")

    if ( indication === 1 && hd !== 3 ) {
      LOG.log("Target 10-15 for SSTI/UTI in dialysis patient");
      // 10-15 for SSTI/UTI
      res.targetMin = 10;
      res.targetMax = 15;
      res.goalTroughIndex = 1;
    } else {
      LOG.log("Target 15-20 for SSTI/UTI in dialysis patient (or CRRT for any indication)");
      // Always 15-20 for CRRT
      res.targetMin = 15;
      res.targetMax = 20;
      res.goalTroughIndex = 2;
    }

    res.method = 'Weight-based';
    res.targetLevelText = `Trough ${res.targetMin}-${res.targetMax}&nbsp;mcg/mL`;

    if ( hd === 1 ) {
      LOG.log('Hemodialysis')
      res.monitoring = 'Draw level before every HD, starting with 2nd HD after load,<br>until 2 consecutive levels therapeutic.';
    } else if ( hd === 2 ) {
      LOG.log('Peritoneal Dialysis')
      res.monitoring = 'Recheck random levels q24-48h, or as clinically indicated,<br>and re-dose when level &lt; 15 mcg/mL';
    } else if ( hd === 3 ) {
      LOG.log('CRRT')
      res.monitoring = 'Check trough levels q24h';
    } else if ( hd === 4 ) {
      LOG.log('SLED')
      res.monitoring = 'Check trough levels before each SLED run<br><i>Use caution in basing maintenance dosing on serum concentration values</i>';
    }
    LOG.endResult(res);
    return res;
  }
  // Adult non-HD

  
  if ( aki ) {    
    if ( indication > 2 ) {
      LOG.log('Non-HD, AKI, CNS/meningitis')
      // CNS
      res.targetMin = 15;
      res.targetMax = 20;
      res.goalTroughIndex = 2;
    } else {
      LOG.log('Non-HD, AKI, not CNS/meningitis')
      res.targetMin = 10;
      res.targetMax = 15;
      res.goalTroughIndex = 1;
    }
    res.method = 'Weight-based';
    res.monitoring = 'Check first level in ~12 hours'
    res.targetLevelText = `Trough ${res.targetMin}-${res.targetMax}&nbsp;mcg/mL`;
    LOG.endResult(res);
    return res;
  }

  res.method = 'InsightRx';
  if ( indication > 2 ) {
    LOG.log('Non-HD, no AKI, CNS/meningitis')
    res.targetMin = 15;
    res.targetMax = 20;
    res.goalTroughIndex = 2;
    res.targetLevelText = `Trough 15-20&nbsp;mcg/mL`;
  } else {
    LOG.log('Non-HD, no AKI, not CNS/meningitis')
    res.targetMin = 10;
    res.targetMin = 20;
    res.goalTroughIndex = 0;
    res.targetLevelText = 'AUC:MIC 400-600&nbsp;mcg&middot;hr/mL';
  }
  
  if ( outlier ) {
    LOG.log('Kinetic outlier')
    res.monitoring = 'First level within 24 hours, then repeat within 24-48 hours'
  } else {
    LOG.log('Not kinetic outlier')
    res.monitoring = 'Levels not indicated unless therapy exceeds 72 hours.'
  }
  LOG.endResult(res);
  return res;  
}
/**
 * Get initial pharmacokinetic dosing
 *
 * @param   {VancoInitialPkParams}
 * @returns {VancoInitialPkResult}
 */
export function getInitialDosing({ method, crcl, age, scr, sex, wt, bmi, infTime = 1, goalMin, goalMax, selDose, selFreq } = {}) {
  LOG.beginFunction('VANCO: getInitialDosing', arguments);
  const res = {
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
  };
  if ( crcl === 0 ) {
    LOG.exitFunction(res);
    return res;
  }
  res.vd = getVd({ bmi: bmi, wt: wt });

  res.ke =  (0.695 * crcl + 0.05) * 0.06  / res.vd;
  res.pkHalflife = getHalflife(res.ke);
  res.pkRecFreq = getSuggestedInterval(res.pkHalflife);
  res.pkFreq = selFreq > 0 ? selFreq : res.pkRecFreq;
  let useDose = 0;

  const rec = {
    arrDose: [],
    arrLevel: [],
    arrViable: [],
    useDose: 0,
  };

  config.doses.forEach( (d, i) => {
    rec.arrDose.push(d);
    const infTime = getInfusionTime(d);
    const { p, tr } = getPeakAndTrough({ dose: d, ke: res.ke, inf: infTime, vd: res.vd, interval: res.pkRecFreq });
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
    const { p, tr } = getPeakAndTrough({ dose: d, ke: res.ke, inf: infTime, vd: res.vd, interval: res.pkFreq });
    res.arrLevel.push(tr);
    res.arrViable.push(tr >= goalMin && tr <= goalMax);
  });
  for (let i = 0; i < res.arrViable.length; i++) {
    if ( res.arrViable[i] ) {
      useDose = i;
      break;
    }
  }
  if ( selDose > 0 && selFreq > 0 ) {
    const newInfTime = getInfusionTime(selDose);
    const { p, tr } = getPeakAndTrough({ dose: selDose, ke: res.ke, inf: newInfTime, vd: res.vd, interval: selFreq });
    res.pkLevel = tr;
    res.pkDose = selDose;
  }
  
  LOG.endResult(res);
  return res;
}
/**
 * Calculate AUC and personalized goal trough
 *
 * @param   {AucCalcParams}
 * @returns {AucCurrent}    Calculation results (or undefined if inadequate inputs)

 */
export function calculateAUC({ dose = 0, interval = 0, trough = 0, peak = 0, troughTime = 0, peakTime = 0 } = {}) {
  LOG.beginFunction('VANCO: calculateAUC', arguments);
  if ( dose === 0 || interval === 0 || trough === 0 || peak === 0 || troughTime === 0 || peakTime === 0 ) {
    LOG.exitFunction();
    return undefined;
  } 

  const tInf = getInfusionTime(dose);
  const ke = -Math.log(trough / peak) / (troughTime - peakTime);
  const truePeak = peak / Math.exp(-ke * (peakTime - tInf));
  const trueTrough = trough * Math.exp(-ke * (interval - troughTime));
  const aucInf = (truePeak + trueTrough) * tInf / 2;
  const aucElim = (truePeak - trueTrough) / ke;
  const auc24 = (aucInf + aucElim) * 24 / interval;
  const vd = dose / tInf * (1 - Math.exp(-ke * tInf)) / (ke * (truePeak - trueTrough * Math.exp(-ke * tInf)));
  const goalTroughLow = config.aucLowNormal * trueTrough / auc24;
  const goalTroughHigh = config.aucHighNormal * trueTrough / auc24;
  const res = {
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
    goalTroughHigh: goalTroughHigh,
  };
  LOG.endResult(res);
  return res;
}
/**
 * Calculate data for table of doses based on selected interval
 *
 * @param   {AucCurrent} aucCurrent  AUC calculation results
 * @param   {Number}     interval    Selected interval in hours
 * @returns {AucNew}                 Calculation results for new dose table
 */
export function calculateAUCNew(aucCurrent, interval) {
  LOG.beginFunction('VANCO: calculateAUCNew', {aucCurrent, interval});
  const res = {
    dose: [],
    auc: [],
    infTime: [],
    trough: [],
    peak: [],
    therapeutic: [],
  };

  if ( interval === 0 || aucCurrent === undefined ) {
    LOG.exitFunction(res);
    return res;
  }

  const { vd, ke, auc24, therapeutic, oldDose, oldInterval } = aucCurrent;

  LOG.groupCollapsed('Calculating for each dose');
  for (const dose of config.doses) {
    LOG.group(`${dose} mg`)
    const infTime = getInfusionTime(dose);
    const auc = auc24 * (dose * 24 / interval) / (oldDose * 24 / oldInterval);
    const peak = dose / infTime * (1 - Math.exp(-ke * infTime)) / (vd * ke * (1 - Math.exp(-ke * interval)));
    const trough = peak * Math.exp(-ke * (interval - infTime));
    const thx =  auc >= config.aucLowNormal && auc <= config.aucHighNormal  ? true : false;
    res.dose.push(dose);
    res.auc.push(auc);
    res.infTime.push(infTime);
    res.trough.push(trough);
    res.peak.push(peak);
    res.therapeutic.push(thx);
    LOG.log({infTime, auc, peak, trough, therapeutic: thx});
    LOG.groupEnd()
  }
  LOG.groupEnd();
  LOG.endResult(res);
  return res;
}
/**
 * Calculate dosing for single-level adjustment
 * @param   {VancoLinearParams}
 * @returns {VancoLinearResults}
 */
export function getLinearAdjustment({ curDose, curFreq, curTrough, testDose, testFreq, goalTrough } = {}) {
  LOG.beginFunction('VANCO: getLinearAdjustment', arguments);

  const res = {
    linearDose: 0,
    linearFreq: 0,
    linearTrough: 0,
    testLinearDose: 0,
    testLinearFreq: 0,
    testLinearTrough: 0,
  };
  if ( curDose === 0 || curFreq === 0 ) {
    LOG.exitFunction(res);
    return res;
  }

  if ( curTrough > 0 ) {
    res.linearDose = Math.floor((curDose / curTrough * goalTrough + 125) / 250) * 250;
    res.linearFreq = curFreq;
    res.linearTrough = res.linearDose / curDose * curTrough;
  }
  if ( testDose === 0 || testFreq === 0 ) {
    LOG.exitFunction(res);
    return res;
  }
  res.testLinearDose = testDose;
  res.testLinearFreq = testFreq;
  if ( curTrough > 0 ) {
    const oldTdd = curDose * (24 / curFreq);
    const newTdd = testDose * (24 / testFreq);
    res.testLinearTrough = curTrough * newTdd / oldTdd;
  }
  LOG.endResult(res);
  return res;
}
/**
 * Calculate single level pharmacokinetic dose adjustment
 * @param   {VancoSingleAdjParams}
 * @returns {VancoSingleAdjResult}
 */
export function getSingleLevelAdjustment({ bmi, wt, curDose, curFreq, curTrough, troughTime, goalTrough, goalMin, goalMax, goalPeak, selFreq, selDose } = {}) {
  LOG.beginFunction('VANCO: getSingleLevelAdjustment', arguments);  
  const res = {
    newDose: [],
    newFreq: 0,
    newTrough: [],
    newViable: [],
    recDose: 0,
    recTrough: 0,
    recFreq: 0,
    selTrough: 0,
    selFreq: 0,
    selDose: 0,
  };
  if ( bmi === 0 || curDose === 0 || curTrough === 0 || curFreq === 0 || troughTime === undefined ) {
    LOG.exitFunction(res);
    return res;
  }
  const vd = getVd({ bmi: bmi, wt: wt });
  const infTime = getInfusionTime(curDose);
  const ke = Math.log( (  curDose / vd  + curTrough ) / curTrough ) / ( curFreq - troughTime );
  LOG.log(`ke => ${ke}`);
  const estTrough = curTrough * Math.exp(-ke * troughTime);
  LOG.log(`estTrough => ${estTrough}`);
  const estPeak = estTrough / Math.exp(-ke * ( curFreq - infTime - troughTime));
  LOG.log(`estPeak => ${estPeak}`);
  res.halflife = getHalflife(ke);

  res.recFreq = getRoundedFrequency(infTime +  Math.log(goalTrough / goalPeak) / -ke );
  const arrDose = [];
  const arrTrough = [];
  const arrViable = [];
  let useDose = 0;

  LOG.groupCollapsed('Test Each Dose')
  config.doses.forEach( (d, i) => {
    LOG.groupCollapsed(`Testing ${d} mg`);
    const { p, tr } = getPeakAndTrough({ dose: d, ke: ke, inf: getInfusionTime(d), vd: vd, interval: res.recFreq });
    arrDose.push(d);
    arrTrough.push(tr);
    arrViable.push(tr >= goalMin && tr <= goalMax);
    LOG.groupEnd();
  });
  LOG.log({viableDoses: arrViable});
  LOG.groupEnd();
  for (let i = 0; i < arrViable.length; i++) {
    if (arrViable[i]) {
      useDose = i;
      break;
    }
  }
  res.recTrough = arrTrough[useDose];
  res.recDose = arrDose[useDose];
  res.newFreq = selFreq > 0 ? selFreq : res.recFreq;
  LOG.groupCollapsed('Calculate new peak and trough for each dose');
  config.doses.forEach( (d, i) => {
    LOG.groupCollapsed(`Calculate new peak and trough for ${d} mg dose`);
    const { p, tr } = getPeakAndTrough({ dose: d, ke: ke, inf: getInfusionTime(d), vd: vd, interval: res.newFreq });
    res.newDose.push(d);
    res.newTrough.push(tr);
    res.newViable.push(tr >= goalMin && tr <= goalMax);
    LOG.groupEnd();
  });
  LOG.groupEnd();

  if ( selDose > 0 && selFreq > 0 ) {
    const { p, tr } = getPeakAndTrough({ dose: selDose, ke: ke, inf: getInfusionTime(selDose), vd: vd, interval: selFreq });
    res.selDose = selDose;
    res.selFreq = selFreq;
    res.selTrough = tr;
  }
  LOG.endResult(res);
  return res;
}
/**
 * Calculate dose adjustments using two levels and kinetic calculations
 * Target trough is fixed at 10-20 mcg/mL
 * @param   {VancoTwolevelParams}
 * @returns {VancoTwolevelResult}
 */
export function calculateTwoLevelPK({ wt = 0, bmi = 0, ke = 0, selectedInterval = 0 } = {}) {
  LOG.beginFunction('VANCO: calculateTwoLevelPK', arguments);
  let useDose = 0;
  const goalMin = 10;
  const goalMax = 20;
  const goal = 15;
  const res = {
    newDose: [],
    newPeak: [],
    newTrough: [],
    infTime: [],
    newViable: [],
    vd: 0,
    pkDose: 0,
    pkFreq: 0,
    pkTrough: 0,
    halflife: 0,
  };
  if ( ke <= 0 ) {
    LOG.exitFunction(res);
    return res;
  }
  res.vd = getVd({ bmi: bmi, wt: wt });
  res.halflife = getHalflife(ke);
  res.pkFreq = selectedInterval > 0 ? selectedInterval : getSuggestedInterval(res.halflife);
  LOG.groupCollapsed('Calculate peak and trough for each dose');
  config.doses.forEach( (d, i) => {
    LOG.group(`Dose: ${d} mg`);
    res.newDose.push(d);
    const infTime = getInfusionTime(d);
    res.infTime.push(infTime);
    const { p, tr } = getPeakAndTrough({ dose: d, ke: ke, inf: infTime, vd: res.vd, interval: res.pkFreq });
    res.newPeak.push(p);
    res.newTrough.push(tr);
    res.newViable.push(tr >= goalMin && tr <= goalMax);
    LOG.groupEnd();
  });
  LOG.groupEnd();
  for (let i = 0; i < res.newViable.length; i++) {
    if (res.newViable[i]) {
      useDose = i;
      break;
    }
  }
  res.pkTrough = res.newTrough[useDose];
  res.pkDose = res.newDose[useDose];
  LOG.endResult(res);
  return res;
}
/**
 * Get dose revision recommendation for dialysis patients
 * @param   {VancoHdRevParams} - Input parameters 
 * @returns {String}           - Recommendation as HTML string
 */
export function hdRevision({ wt=0, trough=0, timing, goal, hd } = {}) {

  LOG.beginFunction('VANCO: hdRevision', arguments);
  if ( wt === 0 ) {
    LOG.exitFunction('Missing weight');
    return '';
  }
  if ( hd !== 1 ) {
    LOG.redText('Not applicable to this patient')
    LOG.groupEnd()
    return '';
  }
  if ( trough === 0 ) {
    LOG.exitFunction('No level was provided')
    return '';
  }
  if ( goal === 0 ) {
    LOG.exitFunction('10-20 is not a valid goal for HD patient');
    return 'Select goal trough of 10-15 mcg/mL or 15-20 mcg/mL for HD patient.'
  }
  let lowMgKg;
  let highMgKg = 0;
  let res = '';
  if ( timing === 0 ) {
    LOG.log(`Pre-HD level: ${trough}`);
    if ( goal === 1 ) {
      LOG.log('Goal trough 10-15');
      if ( trough > 20 ) {
        lowMgKg = 'hold';
      } else if ( trough >= 15 ) {
        lowMgKg = 7.5;
      } else if ( trough >= 10) {
        lowMgKg = 10;
      } else {
        lowMgKg = 15;
        highMgKg = 20;
      }
    } else {
      LOG.log('Goal trough 15-20');
      if ( trough > 25 ) {
        lowMgKg = 'hold';
      } else if ( trough > 20 ) {
        lowMgKg = 7.5;
      } else if ( trough > 15 ) {
        lowMgKg = 10;
      } else {
        lowMgKg = 15
        highMgKg = 20;
      }
    }    
  } else {
    LOG.log(`Post-HD level: ${trough}`);
    if ( goal === 1 ) {
      LOG.log('Goal trough 10-15');
      if ( trough > 15 ) {
        lowMgKg = 'hold';
      } else if ( trough >= 10) {
        lowMgKg = 7.5;
      } else {
        lowMgKg = 10;
      }
    } else {
      LOG.log('Goal trough 15-20');
      if ( trough > 20 ) {
        lowMgKg = 'hold';
      } else if ( trough > 15 ) {
        lowMgKg = 7.5;
      } else {
        lowMgKg = 10;
      }
    }
  }
  if ( lowMgKg === 'hold' ) {
    res = 'Hold dose and order trough before next HD';
  } else {
    let mgKgText = '';
    if ( highMgKg === 0 ) {
      highMgKg = lowMgKg;
      mgKgText = `${lowMgKg} mg/kg`;
    } else {
      mgKgText = `${lowMgKg}-${highMgKg} mg/kg`;
    }
    if ( wt === 0 ) {
      res = `Give ${mgKgText} mg/kg after HD`;
    } else {
      
      let lowDose = roundDose(wt * lowMgKg, 18);
      let highDose = roundDose(wt * highMgKg, 18);
      LOG.log(`Single dose => ${lowDose}-${highDose} mg`)
  
      if ( lowDose !== highDose ) {
        res = `${lowDose} - `;
      }
      res = `Give ${res}${highDose} mg (${mgKgText}) after HD`;
    }
  }
  LOG.endResult(res);
  return res;
}
/**
 * Vanco HD Revision Result
 * @typedef  {Object} VancoHdRevParams
 * @property {Number} wt       Patient's weight in kg
 * @property {Number} trough   Measured trough level
 * @property {Number} timing   When was level drawn? 0 = pre-HD, 1 = post-HD
 * @property {Number} goal     Goal trough: 0 = 10-20, 1 = 10-15, 2 = 10-20
 * @property {Number} hd       HD type (as selectedIndex)
 */
/**
 * Vancomycin Configuration
 * @typedef  {Object} VancoConfig
 * @property {Number[]}              doses          Standard maintenance doses to use for dose tables
 * @property {VancoLoadConfigParams} load           Loading dose parameters
 * @property {VancoInputLimits}      check          Acceptable input values for input validation
 * @property {Number}                maxHDDose      Maximum initial maintenance dose for HD patients
 * @property {Number}                maxPDDose      Maximum initial maintenance dose for PD patients
 * @property {Number}                maxDaily       Maximum initial total daily dose
 * @property {Number}                aucLowNormal   Low normal AUC value
 * @property {Number}                aucHighNormal  High normal AUC value
 */
/**
 * Vancomycin Input Validation Parameters
 * @typedef  {Object}  VancoInputLimits
 * @property {Number}  doseMin      minimum acceptable dose input
 * @property {Number}  doseMax      maximum acceptable dose input
 * @property {Number}  freqMin      minimum acceptable frequency input
 * @property {Number}  freqMax      maximum acceptable frequency input
 * @property {Number}  levelMin     minimum acceptable level input
 * @property {Number}  levelMax     maximum acceptable level input
 * @property {Number}  timeMin      minimum acceptable dose-to-level time input for AUC calculation
 * @property {Number}  timeMax      maximum acceptable dose-to-level time input for AUC calculation
 * @property {Number}  infTimeMin   minimum acceptable infusion time
 * @property {Number}  infTimeMax   maximum acceptable infusion time
 */
/**
 * Loading Dose Paramaters
 *
 * @typedef  {Object} VancoLoadConfigParams
 * @property {LoadConfig} def      LD parameters for most patients
 * @property {LoadConfig} sepsis   LD parameters for severe sepsis
 * @property {LoadConfig} hd       LD parameters for hemodialysis
 * @property {LoadConfig} pd       LD parameters for peritoneal dialysis
 * @property {LoadConfig} crrt     LD parameters for CRRT (CVVH, CVVHD, CVVHDF)
 * @property {LoadConfig} sled     LD parameters for SLED
 */
/**
 * Vancomycin Initial PK Dosing Parameters
 *
 * @typedef  {Object} VancoInitialPkParams
 * @property {Number}        method
 * @property {Number}        crcl        Creatinine clearance in mL/min
 * @property {Number}        age         Age in years
 * @property {Number}        scr         Serum creatinine in mg/dL
 * @property {String|Number} sex         Sex (expects "M", "F", or 0)
 * @property {Number}        wt          Weight in kg
 * @property {Number}        bmi         Body mass index in kg/m^2
 * @property {Number}        [infTime=1] Infusion time in hours
 * @property {Number}        goalMin     Bottom of goal range
 * @property {Number}        goalMax     Top of goal range
 * @property {Number}        selDose     Selected dose in mg
 * @property {Number}        selFreq     Selected frequency in hours
 */
/**
 * Vanco Initial PK Dosing Result
 *
 * @typedef  {Object} VancoInitialPkResult
 * @property {Number}        vd                Volume of distribution in L
 * @property {Number}        pkHalflife        Halflife in hours
 * @property {Number}        ke                Elimination rate constant
 * @property {Number[]}      arrDose           Possible doses
 * @property {Boolean[]}     arrViable         Whether dose is viable
 * @property {Number[]}      arrLevel          Expected level for dose
 * @property {Number}        pkFreq            Selected frequency or recommended frequency if none selected
 * @property {Number}        pkLevel           Expected level from selected frequency
 * @property {Number}        pkRecDose         Recommended dose in mg
 * @property {Number}        pkRecFreq         Recommended frequency in hours
 * @property {Number}        pkRecLevel        Expected level from recommended dose and frequency
 */
/**
 * Loading dose configuration
 *
 * @typedef  {Object} LoadConfig
 * @property {Number} low         low end of loading dose range in mg/kg
 * @property {Number} high        high end of loading dose range in mg/kg
 * @property {Number} max         max loading dose in mg
 */
/**
 * Vancomycin Two-Level PK Calculation Parameters
 * @typedef  {Object}  VancoTwolevelParams
 * @property {Number}  wt                Weight in kg
 * @property {Number}  bmi               Body mass index in kg/m^2
 * @property {Number}  ke                Elimination rate constant
 * @property {Number}  selectedInterval  Selected interval in hours
 */
/**
 * Vancomycin Two-Level PK Calculation Result
 * @typedef  {Object}    VancoTwolevelResult
 * @property {Number}    vd               Volume of distribution
 * @property {Number}    halflife         Halflife in hours (from obj.ke)
 * @property {Number[]}  newDose          Possible new doses
 * @property {Number[]}  infTime          Infusion time for new doses
 * @property {Number[]}  newPeak          Peaks from newDose and newFreq
 * @property {Number[]}  newTrough        Troughs from newDose and newFreq
 * @property {Boolean[]} newViable        Whether newTrough is within target range
 * @property {Number}    pkFreq           Recommended frequency (or selected frequency if chosen)
 * @property {Number}    pkDose           Recommended dose given pkFreq
 * @property {Number}    pkTrough         Estimated torugh from pkDose and pkFreq
 */
/**
 * Vancomycin Single Level Adjustment Parameters
 * @typedef  {Object} VancoSingleAdjParams
 * @property {Number}    bmi         Body mass index in kg/m^2
 * @property {Number}    wt          Weight in kg
 * @property {Number}    curDose     Current dose in mg
 * @property {Number}    curFreq     Current frequency in hours
 * @property {Number}    curTrough   Measured trough in mg/dL
 * @property {Number}    troughTime  Time before next dose that trough was drawn
 * @property {Number}    goalTrough  Middle of goal trough range
 * @property {Number}    goalMin     Minimum of goal trough range
 * @property {Number}    goalMax     Maximum of goal trough range
 * @property {Number}    goalPeak    Goal peak level
 * @property {Number}    selFreq     Selected new frequency
 * @property {Number}    selDose     Selected new dose
 */
/**
 * Vancomycin Single Level Adjustment Result
 * @typedef  {Object} VancoSingleAdjResult
 * @property {Number[]}  newDose     Possible new doses
 * @property {Number[]}  newTrough   Troughs from newDose and newFreq
 * @property {Boolean[]} newViable   Whether newTrough is within target range
 * @property {Number}    recFreq     Recommended new frequency
 * @property {Number}    selFreq     Selected new frequency from input parameters if all inputs are valid
 * @property {Number}    newFreq     selFreq if defined, otherwise recFreq
 * @property {Number}    recDose     Recommended new dose
 * @property {Number}    selDose     Selected new dose from input parameters if all inputs are valid
 * @property {Number}    newDose     selDose if defined, otherwise recDose
 * @property {Number}    recTrough   Calculated trough from recDose and recFreq
 * @property {Number}    selTrough   Calculated trough from selDose and selFreq
 * @property {Number}    newTrough   Calculated trough from newDose and newFreq
 */
/**
 * Single level linear adjustment calculation parameters
 *
 * @typedef  {Object} VancoLinearParams
 * @property {Number} curDose           Current dose in mg
 * @property {Number} curFreq           Current frequency in hours
 * @property {Number} curTrough         Current trough in mg/dL
 * @property {Number} testDose          Selected dose in mg
 * @property {Number} testFreq          Selected frequency in hours
 * @property {Number} goalTrough        Middle of goal trough range in mg/dL
 */
/**
 * Single level linear adjustment calculation results
 *
 * @typedef  {Object} VancoLinearResults
 * @property {Number} linearDose        Calculated dose for linear adjustment in mg
 * @property {Number} linearFreq        Calculated frequency for linear adjustment in hours
 * @property {Number} linearTrough      Estimated trough from calculated dose/frequency
 * @property {Number} testLinearDose    Test dose from input parameters if all inputs are valid
 * @property {Number} testLinearFreq    Test frequency from input parameters if all inputs are valid
 * @property {Number} testLinearTrough  Est trough from test dose and test frequency
 */
/**
 * Vanco peak and trough calculation parameters
 * @typedef  {Object} VancoPeakTroughParams
 * @property {Number} dose      Dose in mg
 * @property {Number} ke        Elimination rate constant
 * @property {Number} inf       Infusion time in hours
 * @property {Number} vd        Volume of distribution in L
 * @property {Number} interval  Interval in hours
 */
/**
 * Vanco peak and trough calculation result
 * @typedef  {Object} VancoPeakTroughResult
 * @property {Number} p         Calculated peak level
 * @property {Number} tr        Calculated trough level
 */
/**
 * Calculated AUC results for various possible doses with the selected interval, for output to a table
 *
 * @typedef  {Object}   AucNew
 * @property {Number[]}   dose         New dose in mg
 * @property {Number[]}   auc          Predicted AUC from new dose
 * @property {Number[]}   infTime      Infusion time in hours
 * @property {Number[]}   trough       Calculated trough level
 * @property {Number[]}   peak         Calculated peak level
 * @property {Boolean[]}  therapeutic  If resulting AUC is therapeutic
 */
/**
 * Vancomycin Per-Protocol Monitoring Recommendation Parameters
 * @typedef  {Object} VancoProtMonRecParams
 * @property {Number}  freq            Frequency in hours
 * @property {Number}  hd              Dialysis status as selectedIndex
 * @property {Number}  crcl            Creatinine clearance in mL/min
 * @property {Number}  scr             Serum creatinine in mg/dL
 * @property {Number}  bmi             Body mass index in kg/m^2
 * @property {Number}  indication      Indication as selectedIndex
 * @property {Number}  age             Age in years
 * @property {Boolean} aki             Patient is in AKI
 * @property {Boolean} outlier         Patient is a PK outlier
 */
/**
 * Vancomycin Per-Protocol Monitoring Recommendation Result
 * @typedef  {Object} VancoProtMonRecResult
 * @property {String} monitoring       Monitoring recommendation as HTML string
 * @property {String} targetLevelText  Target level as HTML string
 * @property {String} method           Dosing method as HTML string (e.g. weight-based or InsightRx)
 * @property {Number} targetMin        Bottom of target range
 * @property {Number} targetMax        Top of target range
 * @property {Number} goalTroughIndex  Goal trough as selectedIndex
 */
/**
 * Vancomycin Volume of Distribution Calculation Parameters
 *
 * @typedef  {Object} VancoVdParams
 * @property {Number} bmi    Body mass index in kg/m^2
 * @property {Number} wt     Weight in kg
 */
/**
 * Vancomycin initial maintenance dose range calculation parameters
 * @typedef  {Object} VancoMaintRangeParams
 * @property {Number}   age                   patient age in years
 * @property {Number}   indication            selectedIndex of indication list
 * @property {Number}   crcl                  CrCl to use for dosing
 * @property {Number}   hd                    selectedIndex of HD status
 * @property {Boolean}  aki                   patient is in AKI
 */
/**
 * Vancomycin initial maintenance dose range calculation result
 * @typedef  {Object} VancoMaintRangeResult
 * @property {Number}   low                   low end of dose range
 * @property {Number}   high                  high end of dose range
 * @property {Number}   lowDailyPeds          low end of dose range (per day - for peds)
 * @property {Number}   highDailyPeds         high end of dose range (per day - for peds)
 * @property {Number}   consider              consider dosing closer to this end of range
 * @property {Number[]} freqs                 two choices of frequency
 * @property {Number}   freq                  frequency  (this *or* the below property)
 * @property {String}   freqText              string frequency if number frequency is not applicable
 * @property {Number}   maxDaily              max daily dose    (one or the other of this or below)
 * @property {Number}   maxDose               max single dose
 * @property {String}   maxDoseExceededText   text to append if dose exceeds max single dose
 * @property {String}   textBeforeDose        text to prepend
 */
/**
 * Vancomycin Clearance Calculation Parameters for Crass method
 *
 * @typedef  {Object} VancoClCrassParams
 * @property {Number}        age   Age in years
 * @property {Number}        scr   Serum creatinine in mg/dL
 * @property {String|Number} sex   Sex (expects "M", "F", or 0)
 * @property {Number}        wt    Weight in kg
 */
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
 * Vancomycin AUC Calculation Parameters
 *
 * @typedef  {Object} AucCalcParams
 * @property {Number} dose        Current dose in mg
 * @property {Number} interval    Current interval in hours
 * @property {Number} trough      Current measured trough
 * @property {Number} peak        Current measured peak
 * @property {Number} troughTime  Time from dose to trough in hours
 * @property {Number} peakTime    Time from dose to peak in hours
 */
/**
 * Vancomycin Maintenance Dose Recommendation Parameters
 * @typedef  {Object} VancoMaintRecParams
 * @property {Number}  age        Age in years
 * @property {Number}  wt         Weight in kg
 * @property {Number}  ibw        Ideal body weight in kg
 * @property {Number}  scr        Serum creatinine in mg/dL
 * @property {Number}  crcl       Creatinine clearance in mL/min
 * @property {Number}  hd         Selected index of HD combo box (0=No, 1=HD, 2=PD, 3=CRRT, 4=SLED)
 * @property {Number}  indication Selected index of indication combo box (0=default, 1=SSTI/UTI, 2=severe sepsis, 3=CNS, 4=CNS and severe sepsis)
 * @property {Boolean} aki        Patient is in AKI
 */
/**
 * Vancomycin Loading Dose Calculation Parameters
 *
 * @typedef  {Object} VancoLoadParams
 * @property {Number}        ht               Height in cm
 * @property {Number}        wt               Weight in kg
 * @property {Number}        age              Age in years
 * @property {String|Number} sex              Sex (expects "M", "F", or 0)
 * @property {Number}        bmi              Body mass index in kg/m^2
 * @property {Number}        hd               Selected index of HD combo box (0=No, 1=HD, 2=PD, 3=CRRT, 4=SLED)
 * @property {Number}        vancoIndication  Selected index of indication combo box (0=default, 1=SSTI/UTI, 2=severe sepsis, 3=CNS, 4=CNS and severe sepsis)
 */