/**
 * TPN Dosing Module
 * @module tpn
 * @since v0.1.0 //TODO: update when live
 * @requires module:util
 */
// import {  } from './util.js';


/**
 * Parameters for TPN calculations
 *
 * @typedef  {Object}  PtBiometrics
 *
 * @property {Number}  age  Patient's age in years
 * @property {Number}  wt   Patient's weight in kg
 * @property {Number}  ht   Patient's height in cm
 * @property {Number}  ibw  Patient's ideal weight in kg
 * @property {Number}  bmi  Patient's body mass index in kg/m^2
 * @property {String}  sex  Patient's sex as 'M' or 'F'
 */


/**
 * Gets daily fluid requirements.
 *
 * @param   {PtBiometrics}
 * @returns {Number}          Daily fluid requirements (or zero if invalid input)
 */
export function getFluidReq({age, wt} = {}) {
  if ( age === 0 || wt === 0 ) return 0;
  if ( age < 56 ) return 35*wt;
  if ( age > 75 ) return 25*wt;
  return 30*wt;
}
/**
 * Gets TPN dosing weight.
 *
 * @param   {PtBiometrics}
 * @returns {Number}          Dosing weight (or zero if invalid input)
 */
export function getDosingWt({age, wt, ibw} = {}){
  if ( age < 18 || ibw === 0 ) return 0;
  if ( wt < ( 1.25 * ibw) ) return wt;
  return ( 0.25 * ( wt - ibw ) ) + ibw;
}
/**
 * Gets Basal energy expenditure.
 *
 * @param   {PtBiometrics}
 * @returns {Number}          BEE in kcal/day (or zero if invalid input)
 */
export function getBee({age, wt, ht, sex} = {}){
  if ( age < 18 || wt === 0 || ht === 0 ) return 0;

  if ( sex === 'M' ) {
    return 66.5 + ( 13.75 * wt ) + ( 5.003 * ht ) - ( 6.775 * age );
  }
  if ( sex === 'F' ) {
    return 655.1 + ( 9.563 * wt ) + ( 1.85 * ht ) - ( 4.676 * age );
  }
  return 0;
}
/**
 * Gets resting metabolic rate using the Mifflin-St. Jeor equation.
 *
 * @param   {PtBiometrics}
 * @returns {Number}          RMR in kcal/day (or zero if invalid input)
 */
export function getRmr({age, wt, ht, sex} = {}){
  if ( age < 18 || wt === 0 || ht === 0 || sex === 0 ) return 0;
  const s = ( sex === 'M' ? 5 : -161 );
  return ( 9.99 * wt ) + ( 6.25 * ht ) - ( 4.92 * age ) + s;
}

/**
 * Energy Requirements for TPN for different patient characteristics.
 * Properties are either a number or an array of two numbers representing a range.
 *
 * @typedef  {Object}   EnergyRequirements
 * @property {Number}   maint            RMR method: Maintenance
 * @property {Number[]} stress           RMR method: Mild-moderate stress
 * @property {Number[]} icuMaint         Method 2: maintenance
 * @property {Number[]} icuMalnourished  Method 2: malnourished, hypermetabolic
 * @property {Number}   icuRefeeding     Method 2: refeeding risk
 * @property {Number[]} icuRenal         Method 2: CKD/HD/PD
 * @property {Number}   icuBmi30         Method 2: obesity (BMI < 30)
 * @property {Number[]} icuBmi3050       Method 2: obesity (30-50)
 * @property {Number[]} icuBmi50         Method 2: obesity (BMI > 50)
 */

/**
 * Gets daily energy requirements.
 *
 * @param   {PtBiometrics}
 * @returns {EnergyRequirements}
 */
export function getKcalReqs(params){
  const { age, wt, ibw } = params;
  let res = {
    maint: 0,
    stress: 0,
    icuMaint: 0,
    icuMalnourished: 0,
    icuRefeeding: 0,
    icuRenal: 0,
    icuBmi30: 0,
    icuBmi3050: 0,
    icuBmi50: 0,
  };
  const dw = getDosingWt(params);
  const rmr = getRmr(params);
  if ( age === 0 || ibw === 0 ) return res;
  res.maint = rmr * 1.2;
  res.stress = [
    rmr * 1.3,
    rmr * 1.5
  ];
  res.icuMaint = [
    25 * dw,
    30 * dw
  ];
  res.icuMalnourished = [
    30 * dw,
    35 * dw
  ];
  res.icuRefeeding = 25 * dw;
  res.icuRenal = [
    30 * dw,
    35 * dw
  ];
  res.icuBmi30 = 25 * dw;
  res.icuBmi3050 = [
    11 * wt,
    14 * wt
  ];
  res.icuBmi50 = [
    22 * ibw,
    25 * ibw
  ];
  return res;
}
/**
 * Protein Requirements for TPN for different patient characteristics.
 * Properties are either a number or an array of two numbers representing a range.
 *
 * @typedef  {Object}   ProteinRequirements
 * @property {Number[]} maint         Maintenance
 * @property {Number[]} mildStress    Mild stress
 * @property {Number[]} modStress     Moderate stress
 * @property {Number[]} severeStress  Severe stress
 * @property {Number}   obesity       Obesity
 * @property {Number}   icuBmi3040    Obesity - ICU, BMI 30-40
 * @property {Number}   icuBmi40      Obesity - ICU, BMI 30-40
 * @property {Number[]} aki           Acute renal failure
 * @property {Number[]} ckd           Chronic renal not on dialysis
 * @property {Number[]} hd            ESRD on HD or PD
 */

 /**
  * Gets daily protein requirements.
  *
  * @param   {PtBiometrics}
  * @returns {ProteinRequirements}
  */
 export function getProteinReqs(params){
     const { age, wt, ht, ibw } = params;
     let res = {
       maint: 0,
       mildStress: 0,
       modStress: 0,
       severeStress: 0,
       obesity: 0,
       icuBmi3040: 0,
       icuBmi40: 0,
       aki: 0,
       ckd: 0,
       hd: 0
     };
     if ( age === 0 || ibw === 0 ) return res;
     const dw = getDosingWt(params);
     res.maint = [
       0.8 * dw,
       1 * dw,
     ];
     res.mildStress = [
       1 * dw,
       1.2 * dw,
     ];
     res.modStress = [
       1.2 * dw,
       1.5 * dw,
     ];
     res.severeStress = [
       1.5 * dw,
       2.2 * dw,
     ];
     res.obesity = 1.5 * ibw;
     res.icuBmi3040 = 2 * ibw;
     res.icuBmi40 = 2.5 * ibw;
     res.aki = [
       1.2 * dw,
       1.6 * dw
     ];
     res.ckd = [
       0.6 * dw,
       0.8 * dw
     ]
     res.hd = [
       1.2 * dw,
       1.4 * dw
     ]
     return res;

 }
