/**
 * Copyright (c) 2021
 *
 * VMFH Pharmacy Multipurpose Calculator
 * Second Dose timing module
 *
 * @author Andy Briggs <andrewbriggs@chifranciscan.org>
 * @since v0.2.0
 * Created at     : 2021-06-13
 * Last modified  : 2021-07-18
 */

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
const freqs = [
  { id: "q6vanco", interval: 6, startHour: 5 },
  { id: "q8", interval: 8, startHour: 5 },
  { id: "q12vanco", interval: 12, startHour: [5, 9] },
  { id: "q24vanco", interval: 24, startHour: [5, 9, 13, 17, 21] }
];

/**
* Generate an array of standard times for the selected frequency
*
* @param   {String}  id              identifier of the selected frequency
* @returns {Object}  obj
* @returns {Array}   obj.timeArray   An array of numbers representing standard times
* @returns {Number}  obj.interval    The dosing interval in hours
*/
function createTimeArray(id){
  let {interval, startHour} = freqs.filter( freq => {
    return id === freq.id;
  })[0];
  if ( !Array.isArray(startHour) ){
    startHour = [startHour];
  }
  let timeArray = [];
  const innerLength = (24/interval)*2+2;
  startHour.forEach( start => {
    let j = start;
    for ( let i=0;i<innerLength;i++){
      timeArray.push(j);
      j += interval;
    }
  });
  timeArray.sort((a,b)=>{
    if (a<b) return -1;
    return 1;
  });
  return {timeArray: timeArray, interval: interval};
}
export function getSecondDose({fd = "", freqId} = {} ){
  if ( fd === "" ) return undefined; // TODO: return something?

  fd = parseFloat(fd.slice(-2)) / 60 + parseFloat(fd.slice(0, -2));
  const {timeArray, interval} = createTimeArray(freqId);
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
