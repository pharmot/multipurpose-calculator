/**
 * PCA Calculatior Module
 * @module pca
 * @requires module:util
 * @since v1.x
 */

import { checkValue, roundTo, displayValue } from './util.js';

$('#pca-drug, #pca-orderset').on('change', changedDrug);
$('#pca-continuous').on('change', changedCi);
$('.input-pca').on('keyup', calcDose);

/** Class representing a PCA. */
class Pca {
  /**
   * Create a PCA.
   * @param {string} name - The drug name.
   * @param {string} range - The dosing range or order set (standard or high).
   * @param {string} unit - The dosing unit (mg or mcg).
   * @param {number} conc - The concentration (in units/mL)
   * @param {array} limits - Pump limits [dose USL, dose UHL, rate USL, rate UHL, max USL, max UHL]
   */
  constructor(name, range, unit, conc, limits) {
    this.name = name;
    this.range = range;
    this.unit = unit;
    this.conc = conc;
    this.limits = limits;
  }
  /**
   * Get the syringe concentration
   * @return {string} The concentration (e.g. '150 mg/30 mL')
   */
  get syringe(){
    return `${this.conc*30} ${this.unit}/30 mL`
  }
  /**
   * Get the units for continuous infusion rate
   * @return {string} The rate units.
   */
  get unitRate(){
    return `${this.unit}/hr`;
  }
  /**
   * Get the units for the dose max
   * @return {string} The units (e.g. mg/4 hr or mcg/1 hr)
   */
  get unitMax(){
    if ( this.range === "standard" ) return `${this.unit}/4 hr`;
    if ( this.range === 'high' ) return `${this.unit}/hr`;
  }
  /**
   * Get the time corresponding to the max dose
   * @return {number} Time in hours for max dose
   */
  get maxDoseTimespan(){
    if ( this.range === "standard" ) return 4;
    if ( this.range === 'high' ) return 1;
  }
  /**
   * Get the amount of drug in each syringe
   * @return {number} Total mg/mcg per syringe
   */
  get mgPerSyr(){
    return this.conc*30;
  }
  /**
   * Get a pump limit value.
   * @param {string} param - The pump parameter to get.  Must be doseUSL, doseUHL, rateUSL, rateUHL, maxUSL, or maxUHL
   * @return {number} The requested limit.
   */
  getLimit(param){
    switch(param) {
      case 'doseUSL': return this.limits[0];
      case 'doseUHL': return this.limits[1];
      case 'rateUSL': return this.limits[2];
      case 'rateUHL': return this.limits[3];
      case 'maxUSL': return this.limits[4];
      case 'maxUHL': return this.limits[5];
      default: return 0;
    }
  }
  /**
   * Get pump limit HTML to display on screen.
   * @return {string[]} HTML for all 3 limits [dose, rate, max].
   */
  getLimitHtml() {
    return [
      `${this.getLimit('doseUSL')}-<b>${this.getLimit('doseUHL')} ${this.unit}</b>`,
      `${this.getLimit('rateUSL')}-<b>${this.getLimit('rateUHL')} ${this.unitRate}</b>`,
      `${this.getLimit('maxUSL')}-<b>${this.getLimit('maxUHL')} ${this.unitMax}</b>`
    ]
  }
}

const mStd = new Pca('morphine', 'standard', 'mg', 1, [4, 5, 2, 3, 30, 60]);
const mHigh = new Pca('morphine', 'high', 'mg', 5, [5, 6, 5, 20, 100, 100]);
const hStd = new Pca('hydromorphone', 'standard', 'mg', 1, [1, 2, 0.5, 1, 8, 20]);
const hHigh = new Pca('hydromorphone', 'high', 'mg', 2, [2, 4, 3, 10, 20, 40]);
const fStd = new Pca('fentanyl', 'standard', 'mcg', 20, [20, 50, 40, 50, 300, 500]);
const fHigh = new Pca('fentanyl', 'high', 'mcg', 50, [50, 100, 50, 400, 300, 750]);

let pca = mStd;
let ci = 'none'

function changedDrug(){
  const drug = $('#pca-drug')[0].value;
  const range = $('#pca-orderset')[0].value;

  if ( drug === 'morphine' ) {
    if ( range === 'standard' ) {
      pca = mStd;
    } else if ( range === 'high' ) {
      pca = mHigh;
    }
  } else if ( drug === 'hydromorphone' ) {
    if ( range === 'standard' ) {
      pca = hStd;
    } else if ( range === 'high' ) {
      pca = hHigh;
    }
  } else if ( drug === 'fentanyl' ) {
    if ( range === 'standard' ) {
      pca = fStd;
    } else if ( range === 'high' ) {
      pca = fHigh;
    }
  }
  const limits = pca.getLimitHtml();
  $('#pca-pumplimit-dose').html(limits[0]);
  $('#pca-pumplimit-rate').html(limits[1]);
  $('#pca-pumplimit-max').html(limits[2]);
  $('#pca-syringe').html(`${pca.name} ${pca.syringe}`);
  $('.pca-units').html(pca.unit);
  $('.pca-unitsPerOneHour').html(pca.unitRate);
  $('.pca-unitsPerHours').html(pca.unitMax);
  calcDose();
}

function changedCi(){
  ci = $('#pca-continuous')[0].value;
  if ( ci !== 'overnight') {
    $('.pca-ci-night').hide();
  } else {
    $('.pca-ci-night').show();
  }
  if ( ci === 'none' ) {
    $('.pca-ci-only').hide();
  } else {
    $('.pca-ci-only').show();
  }
// TODO: reset all - change dropdowns to default
calcDose();

}

function calcDose(){

  $('.pca-bg-warning').removeClass('pca-bg-warning');
  $('.pca-bg-danger').removeClass('pca-bg-danger');
  $('.pca-bg-error').removeClass('pca-bg-error');

  const bolus = checkValue($('#pca-bolusDose').val(), 0.01, 300);

  const lockout = checkValue($('#pca-lockout').val(), 1, 240);

  const max = checkValue($('#pca-orderedMax').val(), 0.1, 2000);

  // Set rate to zero if rate input field is hidden
  const rate = (ci === 'none') ? 0 : checkValue($('#pca-ciRate').val(), 0.01, 1000, true);

  const hours = pca.maxDoseTimespan;

  const syringeTotal = pca.mgPerSyr;

  const doseUnit = ` ${pca.unit}`;
  const doseUnitHour = ` ${pca.unitMax}`;

  const fromBolus = lockout === 0 ? 0 : (60 / lockout) * hours * bolus;
  displayValue("#pca-maxFromBolus", fromBolus, 0.1, doseUnitHour);
  displayValue("#pca-maxFromBolus2", fromBolus, 0.1, doseUnitHour);

  const fromInfusionDay = (ci === 'continuous') ? rate*hours : 0;


  const fromInfusionNight = ((ci !== 'none') ? rate*hours : 0) || 0;
  displayValue("#pca-amtFromCI", fromInfusionNight, 0.1, doseUnitHour);


  if ( ci === 'night' && fromInfusionNight > 0 ) {
    $('#pca-amtFromCI-day').html('---');
  } else {
    $('#pca-amtFromCI-day').html('');
  }

  const preMaxDay = fromInfusionDay + fromBolus;
  displayValue('#pca-totalAmtPossible-day', preMaxDay, 0.1, doseUnitHour);

  const preMaxNight = fromInfusionNight + fromBolus;
  displayValue('#pca-totalAmtPossible-night', preMaxNight, 0.1, doseUnitHour);

  const dispFreqDay = ( syringeTotal / preMaxDay ) * hours;
  displayValue('#pca-maxDispenseFreq-day', dispFreqDay, 0.1, ' hr');

  const dispFreqNight = ( syringeTotal / preMaxNight ) * hours;
  displayValue('#pca-maxDispenseFreq-night', dispFreqNight, 0.1, ' hr');

  let forBolusDay = max - fromInfusionDay;
  let forBolusNight = max - fromInfusionNight;

  if ( forBolusDay <= 0 && max > 0 ) {
    $('#pca-availableForBolus-day').html('max &le; CI').addClass('pca-bg-error');
    forBolusDay = 0;
  } else {
    displayValue('#pca-availableForBolus-day', forBolusDay, 0.1, doseUnitHour);
  }

  if ( forBolusNight <= 0 && max > 0 ) {
    $('#pca-availableForBolus-night').html('max &le; CI').addClass('pca-bg-error');
    forBolusNight = 0;
  } else {
    displayValue('#pca-availableForBolus-night', forBolusNight, 0.1, doseUnitHour);
  }

  const avgLockoutDay = max > 0 ? 60 / ( ( forBolusDay / hours ) / bolus ) : 0;
  const avgLockoutNight = max > 0 ?  60 / ( ( forBolusNight / hours ) / bolus ) : 0;


  if ( forBolusDay < bolus && max > 0 ) {
    $('#pca-averageFreq-day').html('---').addClass('pca-bg-error');
  } else {
    displayValue('#pca-averageFreq-day', avgLockoutDay, 0.1, ' min', 'q ');
    if ( lockout > 0 && avgLockoutDay > lockout ) {
      $('#pca-averageFreq-day').addClass('pca-bg-warning');
    }
  }


  if ( forBolusNight < bolus && max > 0 ) {
    $('#pca-averageFreq-night').html('---').addClass('pca-bg-error');
  } else {
    displayValue('#pca-averageFreq-night', avgLockoutNight, 0.1, ' min', 'q ');
    if ( lockout > 0 && avgLockoutNight > lockout ) {
      $('#pca-averageFreq-night').addClass('pca-bg-warning');
    }
  }


  const finalDispFreq = ( syringeTotal / max ) * hours;
  displayValue('#pca-maxDispenseFreq-final', finalDispFreq, 0.1, ' hr');

  checkPumpLimits(
    [ bolus, rate, max ],
    [ pca.getLimit('doseUSL'), pca.getLimit('rateUSL'), pca.getLimit('maxUSL') ],
    [ pca.getLimit('doseUHL'), pca.getLimit('rateUHL'), pca.getLimit('maxUHL') ],
    [ '#pca-pumplimit-dose', '#pca-pumplimit-rate', '#pca-pumplimit-max' ]
  );
}
/**
 * Check settings against pump limits and adds classes (background colors)
 * to limit table if settings exceed parameters.
 *
 * @param   {number[]} settings - Current pump settings [bolus, rate, max]
 * @param   {number[]} softLimits - Pump soft limits [bolus, rate, max]
 * @param   {number[]} hardLimits - Pump hard limits [bolus, rate, max]
 * @param   {string[]} selectors - jQuery selectors for HTML elements [bolus, rate, max]
 */
function checkPumpLimits(settings, softLimits, hardLimits, selectors) {
  for ( let i = 0; i <= settings.length; i++ ) {
    if ( settings[i] > hardLimits[i] ) {
      $(selectors[i]).addClass('pca-bg-danger')
    } else if ( settings[i] > softLimits[i] ) {
      $(selectors[i]).addClass('pca-bg-warning')
    }
  }
}
