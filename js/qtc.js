/**
* Corrected QT Calculatior Module
* @module qtc
* @requires module:util
* @since v1.2.0
*/
import { checkValue, displayValue } from './util.js';

$(".input-qtc").on('keyup', () => calculateQtc() );

/**
* Calculate Corrected QT interval depending on AF or non-AF
*/
function calculateQtc() {

  const _qt = +checkValue($('#qtc-qt').val(), 1, 9999);
  const _qrs = +checkValue($('#qtc-qrs').val(), 1, 9999);
  const _hr = +checkValue($('#qtc-hr').val(), 1, 9999);
  
  const { method, value } = calculate({
    hr: _hr,
    qrs: _qrs,
    qt: _qt,
  });
  $('#qtc-method').html(method);
  displayValue('#qtc-result', value, 1, ' msec');
}

/**
* Calculate corrected QT interval for non-AF rhythms
* @param   {QTCalcParams}
* @returns {QtcResult}
*/
function calculate({ hr, qrs, qt } = {}) {
  const res = {
    value: 0,
    method: '',
  };

  /* Check for required inputs */
  if ( hr === 0 || qrs === 0 || qt === 0 ) return res;
  
  /**
   * QT interval adjusted using Modified Bogossian formula if QRS > 120
   * @type {Number}
   */
  let qta = qt;

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
 */