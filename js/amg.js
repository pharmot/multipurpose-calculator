/**
 * Aminoglycoside Dosing Module
 * @module amg
 * @since v1.1.0
 * @requires module:util
 */
import { addHoursToDate, getHoursBetweenDates, roundTo } from './util.js';

/**
 * Configuration for aminoglycoside calculations and related input validation.
 * @constant
 * @type     {Object}
 * @default
 * @property {Number}     infTime             assumed infusion time in hours
 * @property {Number}     distTime            assumed distribution time in hours
 * @property {Object}     check               acceptable input values for input validation
 * @property {Number}     check.doseMin       minimum acceptable dose input
 * @property {Number}     check.doseMax       maximum acceptable dose input
 * @property {Number}     check.freqMin       minimum acceptable frequency input
 * @property {Number}     check.freqMax       maximum acceptable frequency input
 * @property {Number}     check.goalPeakMin   minimum acceptable goal peak level input
 * @property {Number}     check.goalPeakMax   maximum acceptable goal peak level
 */
export const config = {
  infTime: 1,
  distTime: 1.7,
  check: {
    goalPeakMin: 1,
    goalPeakMax: 100,
    freqMin: 4,
    freqMax: 96,
    doseMin: 1,
    doseMax: 10000,
  }
};


/**
 * Parameters for calculating AMG dosing weight
 *
 * @typedef  {Object}  DosingWeightParams
 * @property {Boolean} alt       Use alternate dosing weight
 * @property {Number}  age       Patient age in years
 * @property {Number}  wt        Patient weight in kg
 * @property {Number}  ibw       Ideal body weight in kg
 * @property {Number}  adjBW     Adjusted body weight in kg
 * @property {Number}  overUnder Percent over or under ideal body weight
 */

/**
 * Results from AMG dosing weight calculations
 *
 * @typedef  {Object} DosingWtResults
 * @property {Number} dosingWeight       Dosing weight in kg
 * @property {String} dosingWeightType   Weight type
 * @property {String} dosingWeightReason Reason for using specified weight
 * @property {String} dosingWeightString Full HTML string for display
 */

/**
 * Gets the dosing weight for aminoglycoside dosing, per AMG dosing guidelines (2018 version).
 *
 * Return weight of 0 if age <= 15 years (per attachment "B" of aminoglycoside
 * dosing guidelines, use LexiPeds for ages 29 days through 15 years).
 *
 * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/equations.md/#aminoglycoside-dosing-weight)
 *
 * @param   {DosingWeightParams}  - Dosing weight calculation parameters
 * @returns {DosingWtResults}     - Dosing weight recommendations
 */
export function getDosingWeight({ alt, age, wt, ibw, adjBW, overUnder } = {} ){
  if ( age <= 15 && age > 0 ) {
    return {
      dosingWeight: 0,
      dosingWeightType: '',
      dosingWeightReason: 'Does not apply for age &le; 15',
      dosingWeightString: 'Does not apply for age &le; 15'
    }
  }
  if ( ibw === 0 ) {
    return {
      dosingWeight: 0,
      dosingWeightType: '',
      dosingWeightReason: '',
      dosingWeightString: ''
    }
  }
  if ( overUnder > 20 ) {
    return {
      dosingWeight: adjBW,
      dosingWeightType: 'adjusted',
      dosingWeightReason: 'ABW &gt; 120% of IBW',
      dosingWeightString: `Use adjusted weight: <b>${roundTo(adjBW, 0.1)} kg</b><br><i>(ABW &gt; 120% of IBW)</i>`
    }
  }
  if ( alt ) {
    return {
      dosingWeight: wt,
      dosingWeightType: 'actual',
      dosingWeightReason: 'non-obese and CF OR pre-/postpartum',
      dosingWeightString: `Use actual weight: <b>${roundTo(wt, 0.1)} kg</b><br><i>(non-obese and CF OR pre-/postpartum)</i>`
    }
  }
  if (  wt < ibw ) {
    return {
      dosingWeight: wt,
      dosingWeightType: 'actual',
      dosingWeightReason: 'ABW &lt; IBW',
      dosingWeightString: `Use actual weight: <b>${roundTo(wt, 0.1)} kg</b><br><i>(ABW &lt; IBW)</i>`
    }
  }
  return {
    dosingWeight: ibw,
    dosingWeightType: 'ideal',
    dosingWeightReason: 'ABW &lt; 120% of IBW',
    dosingWeightString: `Use ideal weight: <b>${roundTo(ibw, 0.1)} kg</b><br><i>(ABW &lt; 120% of IBW)</i>`
  }
}

/**
 * Gets the goal trough level
 *
 * @param   {String} drug - The selected drug, as a single uppercase letter: [G]entamicin, [T]obramycin, or [A]mikacin
 * @returns {Number}      - The goal trough, in mcg/mL
 */
function getGoalTrough(drug){
  if ( drug === "A" ) return 4;
  return 2;
}

/**
 * Rounds the dose with factor based on drug
 *
 * @param   {Number} dose - The dose to be rounded
 * @param   {String} drug - The selected drug, as a single uppercase letter: [G]entamicin, [T]obramycin, or [A]mikacin
 * @returns {Number}      - The goal trough, in mcg/mL
 */
export function roundDose(dose, drug){
  if ( drug === "A" ) return roundTo(dose, 50);
  return roundTo(dose, 10);
}

//TODO: add AMG goal trough to equations.md
//TODO: add AMG round dose to equations.md
//TODO: add AMG kinetics to equations.md




// ## Aminoglycoside Dosing Weight

// | Condition                    | Weight to Use                  |
// | ---------------------------- | ------------------------------ |
// | if age < 15                  | n/a - guideline does not apply |
// | else if overUnder > 20       | use adjusted wt                |
// | else if actual wt < ideal wt | use actual wt                  |
// | else                         | use ideal weight               |

// ## Alternate Aminoglycoside Dosing Weight

// Used for patients with cystic fibrosis or who are pre- or postpartum.

// | Condition              | Weight to Use                  |
// | ---------------------- | ------------------------------ |
// | if age < 15            | n/a - guideline does not apply |
// | else if overUnder > 20 | use adjusted wt                |
// | else                   | use actual wt                  |


/**
 * Aminoglycoside Calculation Parameters
 *
 * @typedef  {Object}  AmgParams
 * @property {String}  drug          - The selected drug, as a single uppercase letter: [G]entamicin, [T]obramycin, or [A]mikacin
 * @property {Number}  goalPeak      - Goal peak level in mcg/mL
 * @property {Number}  dose          - Current dose in mg
 * @property {Date}    doseTime      - Date and time of dose
 * @property {Number}  postAbxEffect - Post antibiotic effect, in hours
 * @property {Number}  level1        - First level in mcg/mL
 * @property {Date}    level1Time    - Date and time of first level
 * @property {Number}  level2        - Second level in mcg/mL
 * @property {Date}    level12ime    - Date and time of second level
 * @property {Date}    customTime    - Date and time for custom estimation
 */
/**
 * Aminoglycoside Extended Interval Calculation Results
 *
 * @typedef  {Object}  AmgExtendedResult
 * @property {Number}  ke                     - Elinimation rate constant in (1/hr), or 0 if insufficient inputs
 * @property {Number}  truePeak               - True peak level in mcg/mL, or 0 if insufficient inputs     
 * @property {Date}    troughDT               - Date and time of goal trough/target MIC, or 0 if insufficient inputs
 * @property {Date}    redoseDT               - Date and time of redose point, or 0 if insufficient inputs
 * @property {Number}  redoseLevel            - Estimated level at redose point, or undefined if insufficient inputs
 * @property {Date}    newDoseToRedoseTime    - Time from start of new dose to redose point, or 0 if insufficient inputs
 * @property {Number}  vd                     - Volume of distribution, or 0 if insufficient inputs
 * @property {Number}  recDose                - Recommended new dose in mg, or 0 if insufficient inputs
 * @property {Number}  recFreq                - Recommended new frequency to the nearest 12 hours, or 0 if insufficient inputs
 * @property {Number}  levelAtCustom          - Estimated level at custom date and time, or undefined if insufficient inputs
 * @property {Boolean} warn                   - Show warning that distribution may not be complete
 * @property {Boolean} [valid=true]           - Set to false if inputs already known to be invalid
 */

/**
 * Calculate extended interval kinetics
 *
 * @param   {AmgParams}             - Input parameters
 * @returns {AmgExtendedResult}     - Results
 */
export function extended({drug, goalPeak, dose, doseTime, postAbxEffect, level1, level1Time, level2, level2Time, customTime, valid=true} = {}){

  const goalTrough = getGoalTrough(drug);

  
  if ( valid && level1Time > 0 && level2Time > 0 && doseTime > 0 && level1 > 0 && level2 > 0 && dose > 0 && goalPeak > 0 ) {


    //  ┌──tpOffset──┬───2.7───┐        ┌─────────TTR──────────┐
    // dose      truePeak   level1    level2     trough      redose
    //      warn               └────ke──┴────TTT────┴───PAE────┘
    //  └─2.7─┘
    const ke = Math.log(level1/level2) / getHoursBetweenDates(level1Time, level2Time);
    const truePeakOffset = getHoursBetweenDates(doseTime, level1Time) - ( config.infTime + config.distTime );
    const truePeak = level1 / Math.exp( -truePeakOffset * ke);
    const timeToTrough = Math.log( goalTrough / level2 ) / -ke;
    const troughDT = addHoursToDate(level2Time, timeToTrough);    
    const redoseDT = addHoursToDate(troughDT, postAbxEffect);
    const timeToRedose = timeToTrough + postAbxEffect
    const redoseLevel = Math.exp( -ke * timeToRedose ) * level2;
    const peakToTroughTime = Math.log( goalTrough / goalPeak ) / -ke;
    const newDoseToRedoseTime = peakToTroughTime + postAbxEffect + ( config.infTime + config.distTime );
    const vd = +(dose / truePeak);
    const recDose = goalPeak / truePeak * dose;
    const recDoseRounded = roundDose(recDose, drug);
    const recFreq = roundTo(newDoseToRedoseTime, 12);
    const warnTime = addHoursToDate(doseTime, ( config.infTime + config.distTime ) );

    const levelAtCustom = ( customTime > 0 && customTime > level1Time ) ? Math.exp( -ke * getHoursBetweenDates(level2Time,  customTime) ) * level2 : undefined;

    const warn = warnTime > level1Time;

    return { goalTrough, ke, truePeak, troughDT, redoseDT, redoseLevel, newDoseToRedoseTime, vd, recDose, recFreq, levelAtCustom, recDoseRounded, warn};
    
  }
  return {
    goalTrough: goalTrough,
    ke: 0,
    truePeak: 0,
    troughDT: 0,
    redoseDT: 0,
    redoseLevel: undefined,
    newDoseToRedoseTime: 0,
    vd: 0,
    recDose: 0,
    recDoseRounded: 0,
    recFreq: 0,
    levelAtCustom: undefined,
    warn: false
  }  
}

/**
 * Aminoglycoside Cystic Fibrosis Calculation Results
 *
 * @typedef  {Object}
 * @property {String} goalTrough - Goal trough
 * @property {String} goalPeak   - Goal peak, with units
 * @property {String} goalAuc    - Goal AUC, with units
 * @property {Number} ke         - Elimination rate constant in 1/hr
 * @property {Number} predPeak   - Predicted peak in mcg/mL
 * @property {Number} predTrough - Predicted trough in mcg/mL
 * @property {Number} auc        - AUC in mg·hr/L
 * @property {Number} halflife   - Halflife in hours
 */
/**
 * Calculate kinetics for CF dosing
 *
 * @param   {AmgParams}       - Input parameters
 * @returns {AmgCfResult}     - Results
 */
export function cf({drug, freq, doseTime, level1,  level1Time, level2, level2Time}={}){

  const goalTrough = 'Undetectable'
  const goalPeak = drug === 'A' ? '35-50 mcg/mL' : '20-30 mcg/mL';
  const goalAuc = (drug === 'T' && freq === 24 ) ? '&lt; 101 mg&middot;hr/L' : 'n/a' ;  

  if ( level1Time < level2Time && doseTime < level1Time && level1Time !== 0 && level2Time !== 0 && doseTime !== 0 && level1 !== 0 && level2 !== 0 && freq !== 0 ) {
    const timeBetweenLevels = getHoursBetweenDates(level1Time, level2Time);
    const timeToLevel1 = getHoursBetweenDates(doseTime, level1Time);
    const timeToLevel2 = getHoursBetweenDates(doseTime, level2Time);
    const ke = Math.log(level1/level2)/timeBetweenLevels;
    const predPeak = level1 / Math.exp( -ke * ( timeToLevel1 - config.infTime ) );
    const predTrough = level2 * Math.exp( -ke * ( freq - timeToLevel2 ) );
    const auc = ( predPeak - predTrough ) / ke;
    const halflife = 0.693/ke;
    return {goalTrough, goalPeak, goalAuc, ke, predPeak, predTrough, auc, halflife};
  } else {
    return {
      goalTrough: goalTrough,
      goalPeak: goalPeak,
      goalAuc: goalAuc,
      ke: 0,
      predPeak: 0,
      predTrough: 0,
      auc: 0,
      halflife: 0
    }
  }



}