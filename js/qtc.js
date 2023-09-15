/**
* Corrected QT Calculatior Module
* @module qtc
* @requires module:util
* @since v1.2.0
*/
import { checkValue, displayValue } from './util.js';

$(".input-qtc").on('keyup', () => calculateQtc() );
$("#qtc-af").on('change', () => changedAfib() );
$("#btnReset").on('click', () => {
  $('#qtc-af').prop( "checked", false );
  changedAfib();
});

/**
* Check AF box status and show/hide DOM elements based on dosing method
*/
function changedAfib() {
  if ( $('#qtc-af').is(':checked') ) {
    $('#card--qtc').addClass('qtc-afib');
  } else {
    $('#card--qtc').removeClass('qtc-afib');
  }
  calculateQtc();
}

/**
* Calculate Corrected QT interval depending on AF or non-AF
*/
function calculateQtc() {
  
  let res;
  
  if ( $('#qtc-af').is(':checked') ) {
    res = calculateAfib(
      +checkValue($('#qtc-qt-shortest').val(), 1, 9999),
      +checkValue($('#qtc-qt-longest').val(), 1, 9999)
    );
  } else {
    res = calculateStandard({
      hr: +checkValue($('#qtc-hr').val(), 1, 9999),
      qrs: +checkValue($('#qtc-qrs').val(), 1, 9999),
      qt: +checkValue($('#qtc-qt').val(), 1, 9999),
    });
  }
  if ( res.value !== '' ) {
    $('#qtc-method').html(res.method);
  } else {
    $('#qtc-method').html('');
  }
  displayValue('#qtc-result', res.value, 1, ' msec');
}
/**
* QTc calculation result
*
* @typedef  {Object} QtcResult
* @property {String}        method - Method used for calculation
* @property {Number|String} value  - Corrected QT interval, or empty string if invalid/insufficient inputs
*/

/**
* Calculate corrected QT interval for non-AF rhythms
*
* @param   {Object} param     - object containing input values
* @param   {Number} param.hr  - heart rate
* @param   {Number} param.qrs - QRS interval
* @param   {Number} param.qt  - QT interval
* @returns {QtcResult}
*/
function calculateStandard({ hr, qrs, qt } = {}) {
  
  if ( hr === 0 || qrs === 0 || qt === 0 ) return { value: 0, method: '' };
  
  /** QT interval adjusted using Modified Bogossian formula if QRS > 120 */
  let qta = qt;
  
  let adj = '';
  
  if ( qrs > 120 ) {
    qta = qt -  0.5 * qrs;
    adj = 'Modified Bogossian &amp; ';
  }
  
  /** RR interval */
  const rr = 60 / hr;
  
  /** Fridericia formula */
  if ( hr < 50 ) {return {
    method: `${adj}Fridericia formula`,
    value:  qta / Math.cbrt(rr),
  };}
  
  if ( hr > 70 ) {return {
    method: `${adj}Framingham formula`,
    value:  qta +  154 * ( 1 - rr ),
  };}
  
  return {
    method: `${adj}Bazett formula`,
    value:  qta / Math.sqrt(rr),
  };
}

/**
* Calculate corrected QT interval for AFib
*
* @param   {Number} qt1    - shortest QT interval
* @param   {Number} qt2    - longest QT interval
* @returns {QtcResult}
*/
function calculateAfib(qt1, qt2) {
  const method = 'Average of longest and shortest QT intervals';
  if ( qt1 === 0 || qt2 === 0 ) {
    return {
      method: method,
      value: '',
    };
  }
  return {
    method: method,
    value:  ( qt1 + qt2 ) / 2,
  };
}

