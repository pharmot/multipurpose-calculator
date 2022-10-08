/**
 * Aminoglycoside Dosing Module
 * @module amg
 * @since v0.1.0 //TODO: update when live
 * @requires module:util
 */
import { roundTo } from './util.js';

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
 * Gets the dosing weight for aminoglycoside dosing, per AMG dosing guidelines (2018 version).
 *
 * Return weight of 0 if age <= 15 years (per attachment "B" of aminoglycoside
 * dosing guidelines, use LexiPeds for ages 29 days through 15 years).
 *
 * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/equations.md/#aminoglycoside-dosing-weight)
 *
 * @param   {DosingWeightParams}  - Dosing weight calculation parameters
 * @returns {String}              - Text description of weight to use
 */
export function dosingWeightString({ alt, age, wt, ibw, adjBW, overUnder } = {} ){
  if ( age <= 15 && age > 0 ) return 'Does not apply for age &le; 15';
  if ( ibw === 0 ) return '';
  if ( overUnder > 20 ) return `Use adjusted weight: ${roundTo(adjBW, 0.1)} kg`;
  if ( alt || wt < ibw ) return `Use actual weight: ${roundTo(wt, 0.1)} kg`;
  return `Use ideal weight: ${roundTo(ibw, 0.1)} kg`;
}
