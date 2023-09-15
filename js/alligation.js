/**
 * Alligation Module
 * @module alligation
 * @requires module:util
 * @requires module:logger
 * @since v1.2.0
 */
import { checkValue, roundTo } from "./util.js";
import * as LOG from "./logger.js";

$( ".input-alligation" ).on( "keyup", () => calculate() );
$( "[name='alligation-type']" ).on( "change", () => changedType() );
$( "#btnReset" ).on( "click", () => clearOutput() );

$('#button--alligation-example').on('click', () => {
  if ( isSingle() ) {
    $('#alligation-lowerName').val('D5W');
    $('#alligation-lowerConc').val(5);
    $('#alligation-higherName').val('D50W');
    $('#alligation-higherConc').val(50);
    $('#alligation-finalConc2').val(20);
    $('#alligation-finalVolume').val(1000);
  } else {
    $('#alligation-lowerConc').val(0);
    $('#alligation-higherConc').val(50);
    $('#alligation-lowerName').val('sterile water');
    $('#alligation-higherName').val('D50W');
    $('#alligation-secondConc').val(23.4);
    $('#alligation-secondName').val('concentrated NaCl');
    $('#alligation-finalConc1').val(10);
    $('#alligation-finalConc2').val(0.9);
    $('#alligation-finalVolume').val(1000);
    $('#alligation-name1').val('dextrose');
    $('#alligation-name2').val('sodium chloride');
  }
  calculate();
});

/**
 * Update DOM based on Single/Double selection, clear inputs, then recalculate
 */
function changedType() {
  clearOutput();
  if ( isSingle() ) {
    $( "#card--alligation" ).addClass( "alligation-single" );
  } else {
    $( "#card--alligation" ).removeClass( "alligation-single" );
  }
  $( ".input-alligation" ).val( "" );
  calculate();
}

function clearOutput() {
  $('#col--alligation-result').html('');
}

/**
 * Run calculation and display or clear result
 */
function calculate() {
  clearOutput();
  const res = getValues();
  let txt = '';
  if ( res.hasOwnProperty('err') ) {
    txt = res.err;
  } else {
    res.components.forEach( (c, i, arr) => {
      const last = i + 1 === arr.length ? true : false;
      txt += `<div class="form-row${last ? ' border-bottom' : ''}">
                ${last ? '<div class="col-1">+</div>' : ''}
                <div class="col-2 ${last ? '' : 'offset-1 '}text-right">${c.amount}</div>
                <div class="col-1 text-center">of</div>
                <div class="col-8">${c.description}</div>
              </div>`;
    });
    txt += `<div class="form-row">
              <div class="col-2 offset-1 text-right">${res.final.amount}</div>
              <div class="col-1 text-center">of a</div>
              <div class="col-8">${res.final.description}</div>
            </div>`;
  }
  $('#col--alligation-result').html(txt);
}

/**
 * @function  
 * @returns {Boolean} Is single alligation selected
 */
const isSingle = () => $( "#alligation-type--single" ).prop( "checked" );

/**
 * Check values and return result or undefined if invalid inputs
 * 
 * @returns {AlligationResult}
 */
function getValues() {
  LOG.group('Alligation Calculator');
  $('#card--alligation .input-alligation').removeClass('invalid');

  const single = isSingle();
  let lowerConc = +checkValue($('#alligation-lowerConc').val(), 0, 100, true);
  if ( $('#alligation-lowerConc').val() === '' ) lowerConc = 0;
  const higherConc = +checkValue($('#alligation-higherConc').val(), 0, 100);
  const secondConc = +checkValue($('#alligation-secondConc').val(), 0, 100);
  const finalConc1 = +checkValue($('#alligation-finalConc1').val(), 0, 100);
  const finalConc2 = +checkValue($('#alligation-finalConc2').val(), 0, 100);
  const finalVolume = +checkValue($('#alligation-finalVolume').val(), 0);
  
  let lowerName = $('#alligation-lowerName').val();
  if ( lowerName.length === 0 ) {
    if ( lowerConc === 0 ) {
      lowerName = 'sterile water';
    } else {
      lowerName = `${lowerConc}%${single ? '' : ' first solution'}`;
    }
  }
  
  let higherName = $('#alligation-higherName').val();
  if ( higherName.length === 0 ) higherName = `${higherConc}%${single ? '' : ' first solution'}`;
  
  let name1 = $('#alligation-name1').val();
  if ( name1.length === 0 ) name1 = `(FIRST)`;
  
  let name2 = $('#alligation-name2').val();
  if ( name2.length === 0 ) name2 = `(SECOND)`;
  
  let secondName = $('#alligation-secondName').val();
  if ( secondName.length === 0 ) secondName = `${secondConc}% second solution`;
  LOG.groupCollapsed(`Inputs for ${single ? 'Single' : 'Double'} Alligation`);
  if ( single) LOG.log(`name1: ${name1}`);
  if ( single) LOG.log(`finalConc1: ${finalConc1}`);
  LOG.log(`lowerName: ${lowerName}`);
  LOG.log(`lowerConc: ${lowerConc}`);
  LOG.log(`higherName: ${higherName}`);
  LOG.log(`higherConc: ${higherConc}`);
  if ( single) LOG.log(`name2: ${name2}`);
  if ( single) LOG.log(`secondName: ${secondName}`);
  if ( single) LOG.log(`secondConc: ${secondConc}`);
  LOG.log(`finalConc2: ${finalConc2}`);
  LOG.log(`finalVolume: ${finalVolume}`);
  LOG.groupEnd();
  /** @type {AlligationCheck[]} */
  const checks = [
    {
      errMessage: "Lower concentration must be 0 or more",
      check: lowerConc >= 0,
    },
    {
      errMessage: "Higher concentration must be greater than 0",
      check: higherConc > 0,
    },
    {
      errMessage: "Second concentration must be greater than 0",
      check: secondConc > 0,
      ignoreSingle: true,
    },
    {
      errMessage: "Final concentration must be greater than 0",
      check: finalConc2 > 0,
      ignoreDouble: true,
    },
    {
      errMessage: "Final concentration of second component must be greater than 0",
      check: finalConc2 > 0,
      ignoreSingle: true,
    },
    {
      errMessage: "Final volume must be greater than 0",
      check: finalVolume > 0,
    },
    {
      errMessage: "Higher concentration must be greater than lower concentration",
      check: lowerConc < higherConc,
      markInvalid: '#alligation-higherConc',
    },
    {
      errMessage: "Final concentration must be between lower and higher concentrations",
      check: finalConc2 > lowerConc && finalConc2 < higherConc,
      ignoreDouble: true,
      markInvalid: '#alligation-finalConc2',
    },
    {
      errMessage: "Second component's final concentration must be less than its original concentration",
      check: finalConc2 < secondConc,
      ignoreSingle: true,
      markInvalid: secondConc > 0 ? '#alligation-finalConc2' : '',
    },
    {
      errMessage: "First component's final concentration must be between the lower and higher original concentrations",
      check: lowerConc < finalConc1 && higherConc > finalConc1,
      ignoreSingle: true,
      markInvalid: higherConc > 0 ? '#alligation-finalConc1' : '',
    },
    {
      errMessage: "First component's final concentration must be greater than 0",
      check: finalConc1 > 0,
      ignoreSingle: true,
    },
  ];
  let passedChecks = true;
  LOG.groupCollapsed("Checks");
  checks.forEach( c => {
    let runCheck = true;
    if ( c.hasOwnProperty('ignoreSingle') ) {
      if ( c.ignoreSingle && single) runCheck = false;
    }
    if ( c.hasOwnProperty('ignoreDouble') ) {
      if ( c.ignoreDouble && !single ) runCheck = false;
    }
    if ( runCheck && !c.check ) {
      passedChecks = false;
      if ( c.hasOwnProperty('markInvalid') ) {
        if ( c.markInvalid !== '' ) {
          if ( $(c.markInvalid).val() !== 0 && $(c.markInvalid).val() !== '' ) {
            $(c.markInvalid).addClass('invalid');
            LOG.log(`[${c.markInvalid}] ${c.errMessage}`);
          } else {
            LOG.log(c.errMessage);
          }
        } else {
          LOG.log(c.errMessage);
        }
      } else {
        LOG.log(c.errMessage);
      }
    }
  });
  LOG.groupEnd();
  if ( passedChecks ) {
    LOG.logArgs("%cPassed Checks", 'color:green');
  } else {
    LOG.logArgs("%cFailed Checks", 'color: red');
  }
  
  
  if ( passedChecks ) {
    LOG.groupCollapsed('Calculations');
    if ( single ) {
      const partsLow = higherConc - finalConc2;
      const partsHi = finalConc2 - lowerConc;
      const partsTotal = partsLow + partsHi;
      const lowerAmount = partsLow / partsTotal * finalVolume;
      const higherAmount = partsHi / partsTotal * finalVolume;


      LOG.log(`partsLow: ${partsLow}`);
      LOG.log(`partsHi: ${partsHi}`);
      LOG.log(`partsTotal: ${partsTotal}`);
      LOG.log(`lowerAmount: ${lowerAmount}`);
      LOG.log(`higherAmount: ${higherAmount}`);
      LOG.groupEnd();
      LOG.groupEnd();
      return {
        components: [
          { amount: `${roundTo(lowerAmount, 0.1)} mL`, description: lowerName },
          { amount: `${roundTo(higherAmount, 0.1)} mL`, description: higherName },
        ],
        final: { amount: `${finalVolume} mL`, description: `${finalConc2}% solution` },
      };
    } else {
      const secondAmount =  finalConc2 / 100  * ( finalVolume / ( secondConc / 100 ) );
      const lowerAmount =  -( finalConc1 / 100 * finalVolume - higherConc / 100  * ( finalVolume - secondAmount ) ) / ( higherConc / 100 - lowerConc / 100 );
      const higherAmount = finalVolume - secondAmount - lowerAmount;
      LOG.log(`secondAmount: ${secondAmount}`);
      LOG.log(`lowerAmount: ${lowerAmount}`);
      LOG.log(`higherAmount: ${higherAmount}`);
      LOG.groupEnd();
      LOG.groupEnd();
      if ( lowerAmount < 0 || higherAmount < 0 || secondAmount < 0 ) {
        return { err: "The desired solution cannot be made with the defined stock solutions." };
      } else {
        return {
          components: [
            { amount: `${roundTo(lowerAmount, 0.1)} mL`, description: lowerName },
            { amount: `${roundTo(higherAmount, 0.1)} mL`, description: higherName },
            { amount: `${roundTo(secondAmount, 0.1)} mL`, description: secondName },
          ],
          final: { amount: `${finalVolume} mL`, description: `${name1} ${finalConc1}% and ${name2} ${finalConc2}% solution` },
        };
      }
    }
  } else {
    LOG.groupEnd();
    return { err: '' };
  }
}
/**
 * Alligation Result Row
 *
 * @typedef  {Object} AlligationResultRow
 * @property {String} amount                - Amount and units of the solution
 * @property {String} description           - Description of the solution
 */

/**
 * Alligation Result
 *
 * @typedef  {Object} AlligationResult
 * @property {String}                err        - Error text if calculation is not possible
 * @property {AlligationResultRow[]} components - Components that make the final solution
 * @property {AlligationResultRow}   final      - Details of final solution
 */

/**
 * Input validity check
 *
 * @typedef  {Object}   AlligationCheck
 * @property {String}   errMessage          - Error message to display if check fails
 * @property {Boolean}  check               - Expression to evaluate that returns true if valid
 * @property {Boolean} [ignoreSingle=false] - Ignore this check for single alligation
 * @property {Boolean} [ignoreDouble=false] - Ignore this check for double alligation
 * @property {String}  [markInvalid]        - jQuery selector of element to mark as invalid if check fails
 */