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

  const _qt = +checkValue($('#qtc-qt').val(), 1, 9999);
  const _qt2 = +checkValue($('#qtc-qt-longest').val(), 1, 9999);
  const _qrs = +checkValue($('#qtc-qrs').val(), 1, 9999);
  const _hr = +checkValue($('#qtc-hr').val(), 1, 9999);
  const _af = $('#qtc-af').is(':checked');
  
  const { method, value } = calculate({
    hr: _hr,
    qrs: _qrs,
    qt: _qt,
    qt2: _qt2,
    af: _af,
  });
  $('#qtc-method').html(method);
  displayValue('#qtc-result', value, 1, ' msec');
}

/**
* Calculate corrected QT interval for non-AF rhythms
* @param   {QTCalcParams}
* @returns {QtcResult}
*/
function calculate({ hr, qrs, qt, qt2, af } = {}) {
  const res = {
    value: 0,
    method: '',
  };

  /* Check for required inputs */
  if ( hr === 0 || qrs === 0 || qt === 0 ) return res;
  
  /* Check for additional required input if Afib */
  if ( af && qt2 === 0 ) return res;
  
  /**
   * QT interval adjusted using Modified Bogossian formula if QRS > 120
   * @type {Number}
   */
  let qta = qt;

  /* Use average of longest and shortest QT if Afib */
  if ( af ) {
    qta = ( qt + qt2 ) / 2;
  }
  
  /**
   * Text to prepend to final formula used
   * @type {String}
   */
  let adj = '';
  
  if ( qrs > 120 ) {
    qta = qt -  0.5 * qrs;
    adj = 'Modified Bogossian &amp; ';
  }
  
  /** RR interval */
  const rr = 60 / hr;
  
  /** Fridericia formula */
  if ( hr < 50 ) {
    res.method = `${adj}Fridericia formula`;
    res.value = qta / Math.cbrt(rr);
    return res;
  }
  
  if ( hr > 70 ) {
    res.method = `${adj}Framingham formula`;
    res.value =  qta +  154 * ( 1 - rr );
    return res;
  }

  res.method = `${adj}Bazett formula`;
  res.value =  qta / Math.sqrt(rr);
  return res;
}

/**
* QTc calculation result
*
* @typedef  {Object} QtcResult
* @property {String}        method - Method used for calculation
* @property {Number|String} value  - Corrected QT interval, or empty string if invalid/insufficient inputs
*/

/**
 * QT Calculation Parameters
 *
 * @typedef  {Object}  QTCalcParams
 * @property {Number}   hr   - heart rate
 * @property {Number}   qrs  - QRS interval
 * @property {Number}   qt   - QT interval or shortest QT interval for Afib
 * @property {Number}  [qt2] - longest QT interval for Afib
 * @property {Boolean}  af   - rhythm is atrial fibrillation
 */