import { default as arial } from './arial.js';
import { roundTo } from './util.js';
const drugs = [
  {
    rates: [0.6, 1.2, 2.4, 4.8, 7.2],
    durations: [30, 30, 30, 30, 9999],
    padding: [8,6,6,4,7],
    conc: 0.1
  },
  {
    rates: [0.6, 1.2, 2.4, 4.2],
    durations: [30,30,30,9999],
    padding: [6,4,4,8],
    conc: 0.05
  },
  {
    rates: [0.6, 1.2, 2.4, 4.8],
    durations: [30, 30, 30, 9999],
    padding: [6,4,4,8],
    conc: 0.1
  },
  {
    rates: [1.2, 2.4, 4.8],
    durations: [30, 30, 9999],
    padding: [6,4,7],
    conc: 0.1
  }
];
function getText(selected, wt, totalDose){
  let allSteps = {
    steps: ["Time"],
    rates1: ["Rate"],
    rates2: ["Infusion Rate"]
  };
  const { rates, steps, padding, conc, durations } = drugs[selected];
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
