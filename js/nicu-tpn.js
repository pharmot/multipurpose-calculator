/**
 * NICU TPN/Fluid Calculator
 * @since v1.4.0
 * @requires module:util
 * @requires module:formValidation
 * @requires module:logger
 */

// eslint-disable-next-line no-global-assign
$ = require( 'jquery' );
import 'bootstrap';
import '../scss/main.scss';
import { checkValue, displayValue } from './util.js';
// displayDate, , , getDateTime, getHoursBetweenDates, checkTimeInput, parseAge, displayTime 
// import * as arial from "./arial.js";
import { default as setupValidation } from './formValidation.js';
import * as LOG from './logger.js';

/**
 * Length of timeout (in ms) for event handlers that use elements from other modules
 */
const MODULE_DELAY = 100;
const tape = {};

const limits = {
  weight:           { min: 0, max: 40 },
  totalDailyFluids: { min: 0, max: 99999 },
  medicationRate:   { min: 0, max: 99999 },
  lipidDose:        { min: 0, max: 99999 },
  oralFeeds:        { min: 0, max: 99999 },
  oralFeedsFreq:    { min: 0, max: 99999 },
  dextrose:         { min: 0, max: 99999 },
  protein:          { min: 0, max: 99999 },
};

// let debug = false;
let validatedFields;

//---------------------------------------------------------------
// ON PAGE LOAD

$( () => {
  if ( /debug/.test( location.search ) ) {
    // debug = true;
    LOG.enable();
    LOG.presetValues();
    $('#nicu-tpn-wt').val(1.78);
    $('#nicu-tpn-totalDailyFluids').val(120);
    $('#nicu-tpn-medicationRate').val(4);
    $('#nicu-tpn-lipidDose').val(1);
    $('#nicu-tpn-oralFeeds').val(20);
    $('#nicu-tpn-oralFeedsFreq').val(3);
    $('#nicu-tpn-dextrose').val(9.5);
    $('#nicu-tpn-protein').val(3);
    calculateNicuTpn();
  } else if ( /log/.test( location.search ) ) {
    LOG.enable();
  }
  // $("[data-toggle=\"popover\"]").popover({ html: true });
  // $("[data-toggle=\"tooltip\"]").tooltip();
  
  $('.hidden').addClass('hidden');
  validatedFields = setupValidation([
    { selector: '#nicu-tpn-weight',           min: limits.weight.min,           max: limits.weight.max           },
    { selector: '#nicu-tpn-totalDailyFluids', min: limits.totalDailyFluids.min, max: limits.totalDailyFluids.max },
    { selector: '#nicu-tpn-medicationRate',   min: limits.medicationRate.min,   max: limits.medicationRate.max   },
    { selector: '#nicu-tpn-lipidDose',        min: limits.lipidDose.min,        max: limits.lipidDose.max        },
    { selector: '#nicu-tpn-oralFeeds',        min: limits.oralFeeds.min,        max: limits.oralFeeds.max        },
    { selector: '#nicu-tpn-oralFeedsFreq',    min: limits.oralFeedsFreq.min,    max: limits.oralFeedsFreq.max    },
    { selector: '#nicu-tpn-dextrose',         min: limits.dextrose.min,         max: limits.dextrose.max         },
    { selector: '#nicu-tpn-protein',          min: limits.protein.min,          max: limits.protein.max          },
  ]);
  $('#nicu-tpn-oralFeedsFreq').val(3);
  $('#nicu-tpn-wt').get(0).focus();
});
//---------------------------------------------------------------
// EVENT LISTENERS

// Reset Button
$( '#nicu-tpn-reset' ).on( 'click', () => {
  LOG.green( 'Reset' );
  $('.input-nicu-tpn').val(null);
  $( validatedFields ).removeClass( 'invalid' );
  $('#card-footer--nicu-tpn-osm, #nicu-tpn-totalOsm').removeClass('text-danger');
  $('#nicu-tpn-oralFeedsFreq').val(3);
  calculateNicuTpn();
});
$('.input-nicu-tpn').on('keyup', ev => {
  setTimeout( () => {
    LOG.yellow(`NICU TPN Input Received (#${ev.target.id})`);
    calculateNicuTpn();
  }, MODULE_DELAY);
});

function calculateNicuTpn() {
  const wt =               checkValue($('#nicu-tpn-wt').val(),               limits.weight.min,           limits.weight.max           );
  const totalDailyFluids = checkValue($('#nicu-tpn-totalDailyFluids').val(), limits.totalDailyFluids.min, limits.totalDailyFluids.max );
  const medicationRate =   checkValue($('#nicu-tpn-medicationRate').val(),   limits.medicationRate.min,   limits.medicationRate.max   );
  const lipidDose =        checkValue($('#nicu-tpn-lipidDose').val(),        limits.lipidDose.min,        limits.lipidDose.max        );
  const oralFeeds =        checkValue($('#nicu-tpn-oralFeeds').val(),        limits.oralFeeds.min,        limits.oralFeeds.max        );
  const oralFeedsFreq =    checkValue($('#nicu-tpn-oralFeedsFreq').val(),    limits.oralFeedsFreq.min,    limits.oralFeedsFreq.max    );
  const dextrose =         checkValue($('#nicu-tpn-dextrose').val(),         limits.dextrose.min,         limits.dextrose.max         );
  const protein =          checkValue($('#nicu-tpn-protein').val(),          limits.protein.min,          limits.protein.max          );
  tape.inputs = [
    [
      ['Weight',             displayValue('', wt,               0.0001, ' kg')],
      ['Total daily fluids', displayValue('', totalDailyFluids, 0.0001, ' mL/kg/day')],
      ['Medications',        displayValue('', medicationRate, 0.0001,   ' mL/day')],
      ['Lipids 20%',         displayValue('', lipidDose,      0.0001,   ' g/kg/day')],
      ['Oral Feeds', `${displayValue('', oralFeeds,      0.0001, ' mL PO ')}${displayValue('', oralFeedsFreq,  0.0001, ' hours', 'every ')}`],
      ['Dextrose',           displayValue('', dextrose,       0.0001,   '%')],
      ['Protein',            displayValue('', protein,        0.0001,   ' g/kg/day')],
    ],
  ];
  // displayValue('#nicu-tpn-totalDailyFluids-weight', wt, 0.01, ' kg =', '&times; ' );
  // displayValue('#nicu-tpn-lipidRate-weight', wt, 0.01, ' kg &div; 0.2 g/mL =', '&times; ' );
  tape.fluids = [[]];
  const totalDailyFluidRate = totalDailyFluids * wt;
  if ( totalDailyFluidRate > 0 ) {
    tape.fluids[0].push(['Total daily fluids', `${displayValue('', wt, 0.0001, ' kg ')}${displayValue('', totalDailyFluids, 0.0001, ' mL/kg/day', ' &times; ')}${displayValue('', totalDailyFluidRate, 0.0001, ' mL/day', ' = ')}`]);
  }
  displayValue('#nicu-tpn-totalDailyFluidRate', totalDailyFluidRate, 0.1, ' mL/day');

  const lipidRate = lipidDose * wt * 5;
  const lipidHourlyRate = lipidRate / 24;
  if ( lipidRate > 0 ) {
    tape.fluids[0].push(['Lipid volume', `${displayValue('', wt, 0.0001, ' kg ')}${displayValue('', lipidDose, 0.0001, ' g/kg/day &div;', ' &times; ')}${displayValue('', lipidRate, 0.0001, ' mL/day', ' 0.2 g/mL = ')}`]);
    tape.fluids[0].push(['Lipid rate', `${displayValue('', lipidRate, 0.0001, ' mL/day')}${displayValue('', lipidHourlyRate, 0.0001, ' mL/hr', ' &divide; 24 hrs/day = ')}`]);
  }
  displayValue('#nicu-tpn-lipidRate', lipidRate, 0.01, ' mL/day');
  displayValue('#nicu-tpn-lipidHourlyRate', lipidHourlyRate, 0.01, ' mL/hr');

  const npoRate = totalDailyFluidRate - medicationRate - lipidRate;
  if ( npoRate > 0 ) {
    tape.fluids[0].push(['NPO volume', `${displayValue('', totalDailyFluidRate, 0.0001, ' mL/day')}${displayValue('', medicationRate, 0.0001, ' mL/day', ' &minus; ')}${displayValue('', lipidRate, 0.0001, ' mL/day', ' &minus; ')}${displayValue('', npoRate, 0.0001, ' mL/day', ' = ')}`]);
  }
  displayValue('#nicu-tpn-npoRate', npoRate, 0.1, ' mL/day');

  const oralFeedRate = oralFeedsFreq > 0 ? oralFeeds * (24 / oralFeedsFreq) : 0;
  if ( oralFeedRate > 0 ) {
    tape.fluids[0].push(['Oral feeds', `${displayValue('', oralFeeds, 0.0001, ' mL &times; ')}${displayValue('', oralFeedsFreq, 0.001, ' hrs)', ' (24 hrs/day &divide ')}${displayValue('', oralFeedRate, 0.0001, ' mL/day', ' = ')}`]);
  }
  displayValue('#nicu-tpn-oralFeedRate', oralFeedRate, 0.1, ' mL/day');

  const adjRate = npoRate - oralFeedRate;
  const pnRate = adjRate / 24;
  if ( adjRate > 0 ) {
    tape.fluids[0].push(['Adjusted volume', `${displayValue('', npoRate, 0.0001, ' mL/day')}${displayValue('', oralFeedRate, 0.0001, ' mL/day ', ' &minus; ')}${displayValue('', adjRate, 0.0001, ' mL/day', ' = ')}`]);
    tape.fluids[0].push(['PN rate', `${displayValue('', adjRate, 0.0001, ' mL/day')}`]);
  }
  displayValue('#nicu-tpn-adjRate', adjRate, 0.1, ' mL/day');
  displayValue('#nicu-tpn-pnRate', pnRate, 0.1, ' mL/hr');

  const pnVolume = npoRate;
  const pnPercent = npoRate > 0 ? 100 * adjRate / npoRate : 0;
  if ( pnPercent > 0 ) {
    tape.fluids[0].push(['% of TPN receiving', `${displayValue('', adjRate, 0.0001, ' mL/day', '100% &times; ')}${displayValue('', pnPercent, 0.0001, '%', ' &divide 24 hrs/day =')}`]);
  }
  displayValue('#nicu-tpn-pnVolume', pnVolume, 0.1, ' mL');
  displayValue('#nicu-tpn-pnPercent', pnPercent, 0.1, '%');
  const gir =  pnRate * dextrose * 0.167  / wt;
  if ( gir > 0 ) {
    tape.fluids[0].push(['Glucose infusion rate', `${displayValue('', pnRate, 0.0001, ' mL/hr')}${displayValue('', dextrose, 0.0001, '% &times; 0.167', ' &times; ')}${displayValue('', wt, 0.0001, ' kg', ' &divide; ')}${displayValue('', gir, 0.0001, ' mg/kg/min', ' = ')}`]);
  }
  displayValue('#nicu-tpn-gir', gir, 0.1, ' mg/kg/min');

  tape.kcal = [[]];
  /**
   * Concentration of dextrose in kcal/mL, given the specified dextrose concentration
   * % = grams/100 mL
   * 3.4 kcal/gram
   */
  const dextroseKcalConc = dextrose / 100 * 3.4;
  if ( dextroseKcalConc > 0 ) {
    tape.kcal[0].push(['Glucose', `${displayValue('', dextrose, 0.0001, '%')}${displayValue('', dextrose / 100, 0.0001, ' g/mL', ' = ')}${displayValue('', dextroseKcalConc, 0.0001, ' kcal/mL', ' &times; 3.4 kcal/g = ')}`]);
  }
  const dextroseDailyKcal = dextroseKcalConc * adjRate;
  if ( dextroseDailyKcal > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', dextroseKcalConc, 0.0001, ' kcal/mL')}${displayValue('', adjRate, 0.0001, ' mL/day', ' &times; ')}${displayValue('', dextroseDailyKcal, 0.0001, ' kcal/day', ' = ')}`]);
  }
  const dextroseTotal = wt > 0 ? dextroseDailyKcal / wt : 0;
  if ( dextroseTotal > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', dextroseDailyKcal, 0.0001, ' kcal/day')}${displayValue('', wt, 0.0001, ' kg', ' &divide; ')}${displayValue('', dextroseTotal, 0.0001, ' kcal/kg/day', ' = ')}`]);
  }
  displayValue('#nicu-tpn-dextroseTotal', dextroseTotal, 1, ' kcal/kg/day');
  const proteinDailyGrams = protein * wt;
  if ( proteinDailyGrams > 0 ) {
    tape.kcal[0].push(['Protein', `${displayValue('', protein, 0.0001, ' g/kg/day')}${displayValue('', wt, 0.0001, ' kg', ' &times ')}${displayValue('', proteinDailyGrams, 0.0001, ' g/day', ' = ')}`]);
  }
  const proteinConc = npoRate > 0 ? proteinDailyGrams / npoRate : 0;
  if ( proteinConc > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', proteinDailyGrams, 0.0001, ' g/day')}${displayValue('', npoRate, 0.0001, ' mL/day', ' &divide; ')}${displayValue('', proteinConc, 0.0001, ' g/mL', ' = ')}`]);
  }
  const proteinDose = proteinConc * adjRate;
  if ( proteinDose > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', proteinConc, 0.0001, ' g/mL')}${displayValue('', adjRate, 0.0001, ' mL/day', ' &times; ')}${displayValue('', proteinDose, 0.0001, ' grams protein/day', ' = ')}`]);
  }
  const proteinDailyKcal = proteinDose * 4;
  if ( proteinDailyKcal > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', proteinDose, 0.0001, ' grams protein/day')}${displayValue('', proteinDailyKcal, 0.0001, ' kcal/day', ' &times 4 kcal/g = ')}`]);
  }
  const proteinTotal = wt > 0 ? proteinDailyKcal / wt : 0;
  if ( proteinTotal > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', proteinDailyKcal, 0.0001, ' kcal/day')}${displayValue('', wt, 0.0001, ' kg', ' &times; ')}${displayValue('', proteinTotal, 0.0001, ' kcal/kg/day', ' = ')}`]);
  }
  const aaTotal = wt > 0 ? proteinDose / wt : 0;
  if ( aaTotal > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', proteinDose, 0.0001, ' grams protein/day')}${displayValue('', wt, 0.0001, ' kg', ' &divide; ')}${displayValue('', aaTotal, 0.0001, ' g/kg/day AA', ' = ')}`]);
  }
  displayValue('#nicu-tpn-proteinTotal', proteinTotal, 1, ' kcal/kg/day');
  displayValue('#nicu-tpn-aaTotal', aaTotal, 0.01, ' g/kg/day AA');

  const lipidDailyKcal = lipidRate * 2;
  if ( lipidDailyKcal > 0 ) {
    tape.kcal[0].push(['Lipids', `${displayValue('', lipidRate, 0.0001, ' mL/day')}${displayValue('', lipidDailyKcal, 0.0001, ' kcal/day', ' &times; 2 kcal/mL = ')}`]);
  }
  const lipidTotal = wt > 0 ? lipidDailyKcal / wt : 0;
  if ( lipidTotal > 0 ) {
    tape.kcal[0].push(['', `${displayValue('', lipidDailyKcal, 0.0001, ' kcal/day')}${displayValue('', wt, 0.0001, ' kg', ' &divide; ')}${displayValue('', lipidTotal, 0.0001, ' kcal/kg/day', ' = ')}`]);
  }
  displayValue('#nicu-tpn-lipidTotal', lipidTotal, 1, ' kcal/kg/day');
  
  const kcalTotal = dextroseTotal + proteinTotal + lipidTotal;
  if ( kcalTotal > 0 ) {
    const componentTotal = [
      displayValue('', dextroseTotal, 0.0001),
      displayValue('', proteinTotal, 0.0001),
      displayValue('', lipidTotal, 0.0001),
    ].join(' + ');
    tape.kcal[0].push(['Total Kilocalories', `${componentTotal}${displayValue('', kcalTotal, 0.0001, ' kcal/kg/day', ' = ')}`]);
  }
  displayValue('#nicu-tpn-kcalTotal', kcalTotal, 1, ' kcal/kg/day');
  displayValue('#nicu-tpn-dextrosePercent', dextroseTotal / kcalTotal * 100, 1, '%');
  displayValue('#nicu-tpn-proteinPercent', proteinTotal / kcalTotal * 100, 1, '%');
  displayValue('#nicu-tpn-lipidPercent', lipidTotal / kcalTotal * 100, 1, '%');
  tape.osm = [[]];

  const dextroseOsmConc = dextrose * 10;
  const dextroseOsm = dextroseOsmConc * 5;
  if ( dextroseOsmConc > 0 ) {
    tape.osm[0].push(['Dextrose', `${displayValue('', dextrose, 0.0001, '%')}${displayValue('', dextrose / 100, 0.00001, ' g/mL', ' = ')}${displayValue('', dextroseOsmConc, 0.0001, ' g/L', ' = ')}`]);
    tape.osm[0].push(['', `${displayValue('', dextroseOsmConc, 0.0001, ' g/L')}${displayValue('', dextroseOsm, 0.0001, ' mOsm/L', ' &times; 5 mOsm/g = ')}`]);
  }
  displayValue('#nicu-tpn-dextroseOsm', dextroseOsm, 1, ' mOsm/L');

  const proteinOsmConc = proteinConc * 1000;
  const proteinOsm = proteinOsmConc * 10;
  if ( proteinOsmConc > 0 ) {
    tape.osm[0].push(['Protein', `${displayValue('', proteinConc, 0.0001, ' g/mL')}${displayValue('', proteinOsmConc, 0.0001, ' g/L', ' = ')}`]);
    tape.osm[0].push(['', `${displayValue('', proteinOsmConc, 0.0001, ' g/L')}${displayValue('', proteinOsm, 0.0001, ' mOsm/L', ' &times; 10 mOsm/g = ')}`]);
  }
  displayValue('#nicu-tpn-proteinOsm', proteinOsm, 1, ' mOsm/L');
  const totalOsm = dextroseOsm + proteinOsm;
  displayValue('#nicu-tpn-totalOsm', totalOsm, 1, ' mOsm/L');
  if ( totalOsm >= 850 ) {
    $('#nicu-tpn-totalOsm, #card-footer--nicu-tpn-osm').addClass('text-danger');
  } else {
    $('#nicu-tpn-totalOsm, #card-footer--nicu-tpn-osm').removeClass('text-danger');
  }
  const tapeHtml = [];
  if ( tape.inputs[0].length > 0 ) {
    tapeHtml.push(LOG.outputTape(tape.inputs, 'Inputs'));
  }
  if ( tape.kcal[0].length > 0 ) {
    tapeHtml.push(LOG.outputTape(tape.kcal, 'Total Kilocalories'));
  }
  if ( tape.osm[0].length > 0 ) {
    tapeHtml.push(LOG.outputTape(tape.osm, 'Est. Osmolarity'));
  }

  $('#tape--nicu-tpn').html(tapeHtml.join('<br>'));
}