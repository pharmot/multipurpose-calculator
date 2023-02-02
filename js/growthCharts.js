/**
 * Module for growth chart calculations
 * @module growthCharts
 * @since v0.2.0
 */

/**
 * @typedef BmiForAgeDataItem
 * @type {object}
 * @property {string} sex - M or F
 * @property {number} age - age in months
 * @property {number} p95 - 95th percentile of BMI
 */

 /**
  * BMI for Age Data from
  * {@link https://www.cdc.gov/growthcharts/percentile_data_files.htm}.
  * Age is in months, starting at that and up to but not including
  * the next age ({@link https://github.com/pharmot/multipurpose-calculator/blob/main/lib/bmiagerev.json|Raw Data})
  * @constant
  * @type {BmiForAgeDataItem[]}
  */
 const bmiagerev = require('../lib/bmiagerev.json');

 /**
 * Determines if child is obese based on the 95th percentile of BMI-for-age
 * @param   {string}   sex          M or F
 * @param   {number}   age          age in years
 * @param   {number}   bmi          body mass index
 * @returns {boolean}               Is child obese?
 */
export function childIsObese({sex, age, bmi}={}){
  if ( age > 20 || age < 2 ) return undefined;
  const ageMos = Math.floor(age*12);
  const ref = bmiagerev.filter( el => {
    if ( el.sex === sex && el.age === ageMos ) return true;
    return false;
  })[0];
  if ( bmi >= ref.p95 ) return true;
  return false;
}
