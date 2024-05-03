/**
 * PCA Calculatior Module
 * @module pca
 * @requires module:util
 * @requires module:formValidation
 * @since v1.1.0
 */

import { checkValue, displayValue } from './util.js';
import { default as setupValidation } from "./formValidation.js";

/** @type {PcaOptions[]} */
const guardrails = require('../lib/pcaGuardrails.json');

$('#pca-drug').on('change', changedDrug);
$('#pca-therapy').on('change', () => { changedDrug(false) } );
$('#pca-continuous').on('change', changedCi);
$('.input-pca').on('keyup', calcDose);

$("#btnReset").on("click", () => {
  $("#pca-drug")[0].selectedIndex = 0;
  $("#pca-therapy")[0].selectedIndex = 0;
  $("#pca-continuous")[0].selectedIndex = 0;
  $(".pca-bg-warning").removeClass("pca-bg-warning");
  $(".pca-bg-danger").removeClass("pca-bg-danger");
  $(".pca-bg-error").removeClass("pca-bg-error");
  changedDrug();
});

/** Class representing a PCA. */
class Pca {
  /**
   * Create a PCA.
   * @param {PcaOptions} opts - Parameters for this PCA
   */
  constructor(opts) {
    this.drugName = opts.drugName;
    this.therapy = opts.therapy;
    this.unit = opts.dosingUnit;
    this.concentration = opts.concentration;
    this.volume = opts.volume;
    this.limits = opts.limits;
    this.maxIncludesBolus = opts.maxIncludesBolus;
    return this;
  }
  /**
   * Get the full description of this PCA
   * @returns {String} Full description of drug/therapy and syringe
   */
  getFullDescription() {
    const _therapy = this.therapy.replace(/ \(.*\)/, '');
    return `${this.drugName} (${_therapy}) ${this.concentration * this.volume} ${this.unit}/${this.volume} mL`;
  }
}

const library = [];

guardrails.forEach( self => library.push( new Pca(self) ) );

let pca = library.filter(obj => obj.drugName === 'morphine' && obj.therapy === 'Standard')[0];

let ci = 'none';

setupValidation([
  { selector: '#pca-bolusDose',  min: 0.01, max: 999 },
  { selector: '#pca-ciRate',     min: 0.01, max: 999 },
  { selector: '#pca-lockout',    min: 1,    max: 240 },
  { selector: '#pca-orderedMax', min: 0.01, max: 999 },
]);

/**
 * Called when drug selection is changed. Changes units, hour max interval, and pump limits displayed on form.
 * @param {Boolean} clearInputs - Default is to clear input fields when drug is changed. Set to false to keep values.
 * @returns {Null}
 */
function changedDrug(clearInputs = true) {
  const selectedDrug = $('#pca-drug')[0].value;
  const selectedTherapy = $('#pca-therapy')[0].value;

  pca = library.filter(obj => obj.drugName === selectedDrug && obj.therapy === selectedTherapy)[0];
  
  $('.pca-pumplimit').html('');

  if ( clearInputs ) { $('.input-pca').val(null) }

  displayValue('#pca-pumplimit-load-min-soft', pca.limits.load.min.soft, -1, ` ${pca.unit}`);
  displayValue('#pca-pumplimit-load-max-soft', pca.limits.load.max.soft, -1, ` ${pca.unit}`);
  displayValue('#pca-pumplimit-load-max-hard', pca.limits.load.max.hard, -1, ` ${pca.unit}`);
  displayValue('#pca-pumplimit-pca-min-soft', pca.limits.pca.min.soft, -1, ` ${pca.unit}`);
  displayValue('#pca-pumplimit-pca-max-soft', pca.limits.pca.max.soft, -1, ` ${pca.unit}`);
  displayValue('#pca-pumplimit-pca-max-hard', pca.limits.pca.max.hard, -1, ` ${pca.unit}`);
  displayValue('#pca-pumplimit-continuous-min-soft', pca.limits.continuous.min.soft, -1, ` ${pca.unit}/hr`);
  displayValue('#pca-pumplimit-continuous-max-soft', pca.limits.continuous.max.soft, -1, ` ${pca.unit}/hr`);
  displayValue('#pca-pumplimit-continuous-max-hard', pca.limits.continuous.max.hard, -1, ` ${pca.unit}/hr`);
  displayValue('#pca-pumplimit-lockout-min-hard', pca.limits.lockout.min.hard, -1, ' min');
  displayValue('#pca-pumplimit-lockout-min-soft', pca.limits.lockout.min.soft, -1, ' min');
  displayValue('#pca-pumplimit-lockout-max-soft', pca.limits.lockout.max.soft, -1, ' min');
  displayValue('#pca-pumplimit-accumulated-min-soft', pca.limits.accumulated.min.soft, -1, ` ${pca.unit}/1 hr`);
  displayValue('#pca-pumplimit-accumulated-max-soft', pca.limits.accumulated.max.soft, -1, ` ${pca.unit}/1 hr`);
  displayValue('#pca-pumplimit-accumulated-max-hard', pca.limits.accumulated.max.hard, -1, ` ${pca.unit}/1 hr`);

  $('#pca-syringe').html( pca.getFullDescription() );
  $('.pca-units').html(pca.unit);
  $('.pca-unitsPerHour').html(`${pca.unit}/hr`);
  $('.pca-unitsPerOneHour').html(`${pca.unit}/1 hr`);
  calcDose();
}
/**
 * Called when continuous infusion selection is changed. Shows or hides relevant inputs and rows on form.
 * @returns {Null}
 */
function changedCi() {
  ci = $('#pca-continuous')[0].value;
  if ( ci !== 'overnight') {
    $('.pca-ci-night').addClass('hidden');
  } else {
    $('.pca-ci-night').removeClass('hidden');
  }
  if ( ci === 'none' ) {
    $('.pca-ci-only').addClass('hidden');
  } else {
    $('.pca-ci-only').removeClass('hidden');
  }
  calcDose();

}
/**
 * Calculates all outputs based on inputs and adds/removes shading in output/limit fields.
 * @returns {Null}
 */
function calcDose() {

  $('.pca-bg-warning').removeClass('pca-bg-warning');
  $('.pca-bg-danger').removeClass('pca-bg-danger');
  $('.pca-bg-error').removeClass('pca-bg-error');

  const bolus = checkValue($('#pca-bolusDose').val(), 0.01, 999);

  const lockout = checkValue($('#pca-lockout').val(), 1, 240);

  const max = checkValue($('#pca-orderedMax').val(), 0.01, 999);

  // Set rate to zero if rate input field is hidden
  const rate = ci === 'none' ? 0 : checkValue($('#pca-ciRate').val(), 0.01, 999, true);

  const syringeTotal = pca.concentration * pca.volume;

  const doseUnitPerHour = ` ${pca.unit}/hr`;

  const fromBolus = lockout === 0 ? 0 : 60 / lockout * bolus;
  displayValue("#pca-maxFromBolus", fromBolus, 0.1, doseUnitPerHour);
  displayValue("#pca-maxFromBolus2", fromBolus, 0.1, doseUnitPerHour);

  const fromInfusionDay = ci === 'continuous' ? rate : 0;

  const fromInfusionNight = (ci !== 'none' ? rate : 0) || 0;

  displayValue("#pca-amtFromCI", fromInfusionNight, 0.1, doseUnitPerHour);

  if ( ci === 'night' && fromInfusionNight > 0 ) {
    $('#pca-amtFromCI-day').html('---');
  } else {
    $('#pca-amtFromCI-day').html('');
  }

  const preMaxDay = fromInfusionDay + fromBolus;
  displayValue('#pca-totalAmtPossible-day', preMaxDay, 0.1, doseUnitPerHour);

  const preMaxNight = fromInfusionNight + fromBolus;
  displayValue('#pca-totalAmtPossible-night', preMaxNight, 0.1, doseUnitPerHour);

  const dispFreqDay =  syringeTotal / preMaxDay;
  displayValue('#pca-maxDispenseFreq-day', dispFreqDay, 0.1, ' hr');

  const dispFreqNight =  syringeTotal / preMaxNight;
  displayValue('#pca-maxDispenseFreq-night', dispFreqNight, 0.1, ' hr');

  let forBolusDay = max - fromInfusionDay;
  let forBolusNight = max - fromInfusionNight;

  if ( forBolusDay <= 0 && max > 0 ) {
    $('#pca-availableForBolus-day').html('max &le; CI').addClass('pca-bg-error');
    forBolusDay = 0;
  } else {
    displayValue('#pca-availableForBolus-day', forBolusDay, 0.1, doseUnitPerHour);
  }

  if ( forBolusNight <= 0 && max > 0 ) {
    $('#pca-availableForBolus-night').html('max &le; CI').addClass('pca-bg-error');
    forBolusNight = 0;
  } else {
    displayValue('#pca-availableForBolus-night', forBolusNight, 0.1, doseUnitPerHour);
  }

  const avgLockoutDay = max > 0 ? 60 / (  forBolusDay / bolus ) : 0;
  const avgLockoutNight = max > 0 ?  60 / (  forBolusNight / bolus ) : 0;


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

  const finalDispFreq =  syringeTotal / max;

  displayValue('#pca-maxDispenseFreq-final', finalDispFreq, 0.1, ' hr');

  checkPumpLimits(pca.limits, {
    pca: bolus,
    rate: rate,
    max: max,
    lockout: lockout,
  });
}
/**
 * Checks settings against pump limits and adds classes (background colors)
 * to limit table if settings exceed parameters.
 *
 * @param   {PcaLimitSet} pcaLimits  - Limits for current PCA
 * @param   {PcaParams}   pcaOrdered - Current ordered PCA parameters
 */
function checkPumpLimits(pcaLimits, pcaOrdered) {
  const arr = [
    {
      value: pcaOrdered.pca,
      limits: pcaLimits.pca,
      softMinSelector: '#pca-pumplimit-pca-min-soft',
      softMaxSelector: '#pca-pumplimit-pca-max-soft',
      hardMaxSelector: '#pca-pumplimit-pca-max-hard',
    },
    {
      value: pcaOrdered.rate,
      limits: pcaLimits.continuous,
      softMinSelector: '#pca-pumplimit-continuous-min-soft',
      softMaxSelector: '#pca-pumplimit-continuous-max-soft',
      hardMaxSelector: '#pca-pumplimit-continuous-max-hard',
    },
    {
      value: pcaOrdered.lockout,
      limits: pcaLimits.lockout,
      hardMinSelector: '#pca-pumplimit-lockout-min-hard',
      softMinSelector: '#pca-pumplimit-lockout-min-soft',
      softMaxSelector: '#pca-pumplimit-lockout-max-soft',
    },
    {
      value: pcaOrdered.max,
      limits: pcaLimits.accumulated,
      softMinSelector: '#pca-pumplimit-accumulated-min-soft',
      softMaxSelector: '#pca-pumplimit-accumulated-max-soft',
      hardMaxSelector: '#pca-pumplimit-accumulated-max-hard',
    },
  ];

  arr.forEach( me => {

    const hardMin = me.limits.min.hard || 0;
    const softMin = me.limits.min.soft || 0;
    const hardMax = me.limits.max.hard || 9999;
    const softMax = me.limits.max.soft || 9999;

    if ( me.value !== undefined && me.value > 0 ) {
      if ( me.value < hardMin ) {
        $(me.hardMinSelector).addClass('pca-bg-danger');
        $(me.softMinSelector).addClass('pca-bg-danger');
      } else if ( me.value < softMin ) {
        $(me.softMinSelector).addClass('pca-bg-warning');
      } else if ( me.value > hardMax ) {
        $(me.hardMaxSelector).addClass('pca-bg-danger');
        $(me.softMaxSelector).addClass('pca-bg-danger');
      } else if ( me.value > softMax ) {
        $(me.softMaxSelector).addClass('pca-bg-warning');
      }
    }

  });
}

/**
 * PCA Order Parameters
 *
 * @typedef  {Object} PcaParams
 * @property {Number} pca     - patient-delivered PCA dose
 * @property {Number} rate    - continuous infusion rate per hour
 * @property {Number} lockout - lockout interval in minutes
 * @property {Number} max     - max accumulated dose in one hour
 */

/**
 * PCA Options for one drug and therapy
 *
 * @typedef  {Object} PcaOptions
 * @property {String}      drugName         - Drug name
 * @property {String}      dosingUnit       - Unit (mg or mcg)
 * @property {Number}      concentration    - Concentration in <unit> per mL
 * @property {Number}      volume           - Total volume of PCA in mL
 * @property {Boolean}     maxIncludesBolus - Whether clinician-delivered bolus is included in accumulated dose calculation
 * @property {PcaLimitSet} limits           - Alaris Guardrails PCA settings
 */

/**
 * Alaris Guardrails PCA Limits for one drug and therapy
 *
 * @typedef  {Object} PcaLimitSet
 * @property {PcaLimitMinMax} pca         - Limits for patient-delivered PCA dose
 * @property {PcaLimitMinMax} continuous  - Limits for continuous infusion rate per hour
 * @property {PcaLimitMinMax} bolus       - Limits for clinician-delivered bolus
 * @property {PcaLimitMinMax} load        - Limits for clinician-delivered loading dose
 * @property {PcaLimitMinMax} lockout     - Limits for lockout interval in minutes
 * @property {PcaLimitMinMax} accumulated - Limits for max accumulated dose in one hour
 */

/**
 * All values for one type of PCA limit
 *
 * @typedef  {Object} PcaLimitMinMax
 * @property {PcaLimit} min - Minimum limits
 * @property {PcaLimit} max - Maximum limits
 */

/**
 * Hard and soft limits. null if not applicable, 0 if not set.
 *
 * @typedef  {Object} PcaLimit
 * @property {Number} soft - Soft limit
 * @property {Number} hard - Hard limit
 */