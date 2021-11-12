/**
 * Standard Administration Times (Next Dose) module
 * @module nextdose
 * @since v1.1.0
 */

/**
 * Standard Dosing Frequency Parameters
 *
 * @typedef  {Object} StandardDosingFrequency
 * @property {string}   name       - The name of the frequency
 * @property {number[]} resultMap  - An array of 24 numbers mapping each hour to a string in the resultText property
 * @property {string[]} resultText - Possibilities of when next dose should be given
 */

// TODO: reset on resetAll

/**
 * Standard Dosing Frequencies
 * @type {StandardDosingFrequency[]}
 */
const freqs = [
  {
    name: 'daily',
    resultMap: [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    resultText: [
      "Give first dose now and repeat at 2100 daily.",
      "Give first dose now and repeat at 0900 daily."
    ]
  },
  {
    name: 'bid',
    resultMap: [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    resultText: [
      "Give first dose now and repeat at 0900.",
      "Give first dose now and repeat at 2100."
    ]
  },
  {
    name: 'bidac',
    resultMap: [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2],
    resultText: [
      "Give first dose at 0700.",
      "Give first dose at 1600.",
      "Give first dose at 0700 tomorrow."
    ],
  },
  {
    name: 'bidcc',
    resultMap: [0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2],
    resultText: [
      "Give first dose at 0800.",
      "Give first dose at 1700.",
      "Give first dose at 0800."
    ],
  },
  {
    name: 'bidpc',
    resultMap: [0,0,0,0,0,0,0,0,0,1,2,2,2,2,3,3,3,3,3,4,4,4,4,4],
    resultText: [
      "Hold until 0900 if able, or give first dose now with snack and repeat at 1800.",
      "Give first dose at 0900",
      "Give first dose after lunch, repeat at 1800.",
      "Give first dose at 1800",
      "Hold until 0900 if able, or give first dose now with snack and repeat at 0900."
    ],
  },
  {
    name: 'tidac',
    resultMap: [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3],
    resultText: [
      "Give first dose at 0700.",
      "Give first dose at 1100.",
      "Give first dose at 1600.",
      "Not specified"
    ]
  },
  {
    name: 'tidcc',
    resultMap: [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3,3,3],
    resultText: [
      "Give first dose with a snack now and repeat at 0800.",
      "Give first dose now and repeat at 1200.",
      "Give first dose now and repeat at 1700.",
      "Give first dose with dinner or a snack now and repeat at 0800."
    ]
  },
  {
    name: 'tidpc',
    resultMap: [0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3,3],
    resultText: [
      "Give first dose now and repeat at 0900.",
      "Give first dose now and repeat at 1300.",
      "Give first dose now and repeat at 1800.",
      "Give first dose with dinner or a snack now and repeat at 0900."
    ]
  },
  {
    name: 'q8h',
    resultMap: [2,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2],
    resultText: [
      "Give first dose now and repeat at 1300.",
      "Give first dose now and repeat at 2100.",
      "Give first dose now and repeat at 0500."
    ]
  },
  {
    name: 'q6h',
    resultMap: [0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,0,0,0],
    resultText: [
      "Give first dose now and repeat at 0600.",
      "Give first dose now and repeat at 1200.",
      "Give first dose now and repeat at 1800.",
      "Give first dose now and repeat at 0000."
    ]
  }
];


$('input.radio--nextdose').on('change', () => {

  const freq = $('input[name="nextdose-freq"]:checked').val();
  const startTime = +$('input[name="nextdose-time"]:checked').val();

  $('.btn-group--nextdose-time > label').removeClass('highlighted');
  if ( freq !== undefined ) {
    $(`.st-${freq}`).addClass('highlighted');
  }
  if ( !isNaN(startTime) && freq !== undefined ) {
    $('#nextdose-result').show();
    const stdFreq = freqs.filter( obj => obj.name === freq )[0];
    $('#nextdose-result').html(stdFreq.resultText[stdFreq.resultMap[startTime]]);
  }
});
