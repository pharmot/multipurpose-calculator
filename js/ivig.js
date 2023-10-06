/**
 * IVIG Rate Calculation and admin instruciton generation module
 * @module ivig
 * @exports getText
 * @requires module:util
 * @requires module:arial
 * @since v0.2.0
 */

import * as arial from './arial.js';
import { roundTo } from './util.js';



/**
 * IVIG Product Object
 *
 * @typedef  {Object} IvigProduct
 * @property {Number[]}   rates      Titration rates in mL/kg/hour
 * @property {Number[]}   durations  Length in minutes of each titration step. Must have same length as `rates` property.
 * @property {Number}     conc       Concentration of product, in g/mL (e.g. 0.1 = 10%)
 */

/**
 * Product titrations that correspond with the products in the input/select 
 * @type {IvigProduct[]}
 */
const drugs = [
  {
    rates: [0.3, 0.6, 1.2, 2.4, 4.8],
    durations: [30, 30, 30, 30, 9999],
    conc: 0.1
  },
  {
    rates: [0.3, 0.6, 1.2, 2.4],
    durations: [30, 30, 30, 9999],
    conc: 0.1
  },
  {
    rates: [0.6, 1.2, 2.4, 4.8, 7.2],
    durations: [30, 30, 30, 30, 9999],
    conc: 0.1
  },
  {
    rates: [0.6, 1.2, 2.4, 4.2],
    durations: [30,30,30,9999],
    conc: 0.05
  },
  {
    rates: [0.6, 1.2, 2.4, 4.8],
    durations: [30, 30, 30, 9999],
    conc: 0.1
  },
  {
    rates: [1.2, 2.4, 4.8],
    durations: [30, 30, 9999],
    conc: 0.1
  }
];
/**
 * Generate admin instruction text for IVIG rate titration
 * @param {Integer} selected    Selected index of product selection
 * @param {Number} wt           Patient's actual body weight, in kg
 * @param {Number} [totalDose]  Total dose to be administered, in grams
 * @returns {String}            Admin instruction text
 */
function getText(selected, wt, totalDose){
  let allSteps = {
    steps: ["Time"],
    rates1: ["Rate"],
    rates2: ["Infusion Rate"]
  };
  const { rates, conc, durations } = drugs[selected];
  const totalVolume = totalDose/conc;
  let remainingVolume = totalVolume;
  let timeElapsed = 0;
  let lastStep = rates.length;


  for ( let i=0;i<lastStep;i++ ) {
    allSteps.rates1.push(`${rates[i]} mL/kg/hr`);
    let stepTime = durations[i];
    let stepText = i+1 < rates.length ? `${timeElapsed}-${timeElapsed+stepTime} min` : `${timeElapsed}+ min`;
    if ( wt > 0 ) {
      let stepRate = roundTo( wt*rates[i], 0.1);
      allSteps.rates2.push(`${stepRate} mL/hr`);
      if ( totalDose > 0 ) {
        let stepVolume = stepRate*(stepTime/60);
        if ( stepVolume > remainingVolume ) {
          stepTime = (remainingVolume/stepRate)*60
          lastStep = i;
        }
        if ( i === lastStep ) {
          let totalTime = Math.ceil(timeElapsed+stepTime);
          stepText = `${timeElapsed}-${totalTime} min`;
        }
        remainingVolume -= stepVolume;
      }

    } else {
      if ( i === 0 ) allSteps.rates2.pop(0);
    }
    allSteps.steps.push(stepText);
    timeElapsed += stepTime;
  }

  let txt=""
  allSteps.steps = arial.padArray(allSteps.steps, 4);
  allSteps.rates1 = arial.padArray(allSteps.rates1, 4);
  for(let i=0;i<allSteps.steps.length;i++){
    txt += allSteps.steps[i];
    txt += allSteps.rates1[i];
    if(allSteps.rates2.length > 0 ) {
      txt += allSteps.rates2[i];
    }
    if ( i+1 < allSteps.steps.length ) {
      txt += "\n"
    }
  }
  return txt;
}
export default { getText };
