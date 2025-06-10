/**
 * NICU Equivalent Lytes Calculator
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
import { default as setupValidation } from './formValidation.js';
import * as LOG from './logger.js';

/**
 * Length of timeout (in ms) for event handlers that use elements from other modules
 */
const MODULE_DELAY = 100;
let validatedFields;
const comps = [
  { ident: 'NaCl', sodium: 1 },
  { ident: 'NaAcet', sodium: 1 },
  { ident: 'KCl', potassium: 1 },
  { ident: 'KPhos', potassium: 1, phosphate: 1 },
  { ident: 'CaGluc', calcium: 1 },
  { ident: 'NaPhos', sodium: 1, phosphate: 1 },
  { ident: 'MgSulf', magnesium: 1 },
  { ident: 'KAcet', potassium: 1 },
];
//---------------------------------------------------------------
// ON PAGE LOAD

$( () => {
  if ( /debug/.test( location.search ) ) {
    LOG.enable();
    LOG.presetValues();
    $('#nicu-lytes-weight').val(0.785);
    $('#nicu-lytes-dailyRatePerKg').val(160);
    calculateNicuFluid();
  } else if ( /log/.test( location.search ) ) {
    LOG.enable();
  }

  validatedFields = setupValidation([
    { selector: '#nicu-lytes-weight', min: 0, max: 40 },
    { selector: '#nicu-lytes-dailyRatePerKg', min: 0, max: 999 },
    { selector: '#nicu-lytes-input-NaCl', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-NaAcet', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-KCl', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-KPhos', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-CaGluc', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-NaPhos', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-MgSulf', min: 0, max: 20 },
    { selector: '#nicu-lytes-input-KAcet', min: 0, max: 20 },
  ]);
  $('#nicu-lytes-name').get(0).focus();
});

$( '#nicu-lytes-reset' ).on( 'click', () => {
  LOG.green( 'Reset' );
  $( '.input-nicu-lytes' ).val(null);
  $( validatedFields ).removeClass( 'invalid' );
  $('#nicu-lytes-name').get(0).focus();
});

$('.input-nicu-lytes').on('keyup', () => {
  setTimeout( () => {
    LOG.yellow('NICU Lytes Input Received');
    calculateNicuFluid();
  }, MODULE_DELAY);
});

/** Class representing a component used in NICU Fluid builder */
class NicuFluidComponent {
  /**
   * Create a NicuFluidComponent
   * @param {NicuFluidComponentParams} cfg 
   */
  constructor( cfg ) {
    this.ident = cfg.ident;
    this.sodium = cfg.sodium || 0;
    this.potassium = cfg.potassium || 0;
    this.calcium = cfg.calcium || 0;
    this.phosphate = cfg.phosphate || 0;
    this.magnesium = cfg.magnesium || 0;
    this.idInput = `nicu-lytes-input-${cfg.ident}`;
    this.idBagDosePerKg = `nicu-lytes-bagDose-${cfg.ident}`;
    this.idBagAmount =  `nicu-lytes-bagAmount-${cfg.ident}`;
    this.idBagConcentration =  `nicu-lytes-bagConc-${cfg.ident}`;
    this.dailyDosePerKg = 0;
    this.bagDosePerKg = 0;
    this.bagAmount = 0;
    this.bagConcentration = 0;
    this.isIncluded = 0;
    return this;
  }
  update({ wt, hourlyRate } = {}) {
    LOG.beginFunction(`Update: ${this.ident}`, arguments);
    this.dailyDosePerKg = checkValue( $( `#${this.idInput}` ).val() );
    if ( this.dailyDosePerKg > 0 && wt > 0 && hourlyRate > 0 ) {
      this.bagDosePerKg =   this.dailyDosePerKg / ( hourlyRate * 24 ) * 250;
      this.bagAmount = this.bagDosePerKg * wt;
      this.bagConcentration = this.bagAmount / 250;
      this.isIncluded = 1;
    } else {
      this.bagDosePerKg = 0;
      this.bagAmount = 0;
      this.bagConcentration = 0;
      this.isIncluded = 0;
    }
    displayValue(`#${this.idBagDosePerKg}`, this.bagDosePerKg, 0.1, ' mEq/kg/bag');
    displayValue(`#${this.idBagAmount}`, this.bagAmount, 0.1, ' mEq/bag');
    displayValue(`#${this.idBagConcentration}`, this.bagConcentration, 0.0001, ' mEq/mL');
    LOG.endResult(this);
  }
}

const components = comps.map( c => new NicuFluidComponent( c ) );

function calculateNicuFluid() {
  
  const wt = checkValue( +$('#nicu-lytes-weight').val(), 0, 40 );
  const dailyRatePerKg = checkValue( +$('#nicu-lytes-dailyRatePerKg').val(), 0, 999 );

  const hourlyRate = dailyRatePerKg * wt / 24;
  displayValue('#nicu-lytes-hourlyRate', hourlyRate, 0.1, ' mL/hr');

  const inputs = { wt, dailyRatePerKg, hourlyRate };
  LOG.cyanGroupCollapsed('Update components');
  components.forEach( c => c.update( inputs ) );
  LOG.groupEnd();

  const totalNaPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.sodium }, 0 );
  const totalKPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.potassium }, 0);
  const totalCaPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.calcium }, 0);
  const totalPhosPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.phosphate }, 0);
  const totalMgPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.magnesium }, 0);
  const numberOfAdditives = components.reduce( ( tot, c ) => { return tot + c.isIncluded }, 0);
  LOG.log(`Na: ${totalNaPerBag}, K: ${totalKPerBag}, Ca: ${totalCaPerBag}, Phos: ${totalPhosPerBag}, Mg: ${totalMgPerBag}`);

  const totalNaRate =  totalNaPerBag / 250  * hourlyRate;
  const totalKRate =  totalKPerBag / 250  * hourlyRate;
  const totalCaRate =  totalCaPerBag / 250  * hourlyRate;
  const totalPhosRate =  totalPhosPerBag / 250  * hourlyRate;
  const totalMgRate =  totalMgPerBag / 250  * hourlyRate;
  const caPhosProduct = totalCaPerBag * totalPhosPerBag;

  displayValue('#nicu-lytes-total-sodium', totalNaPerBag, 0.1, ' mEq');
  displayValue('#nicu-lytes-total-sodium-rate', totalNaRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-total-potassium', totalKPerBag, 0.1, ' mEq');
  displayValue('#nicu-lytes-total-potassium-rate', totalKRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-total-calcium', totalCaPerBag, 0.1, ' mEq');
  displayValue('#nicu-lytes-total-calcium-rate', totalCaRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-total-phosphate', totalPhosPerBag, 0.1, ' mEq');
  displayValue('#nicu-lytes-total-phosphate-rate', totalPhosRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-total-magnesium', totalMgPerBag, 0.1, ' mEq');
  displayValue('#nicu-lytes-total-magnesium-rate', totalMgRate, 0.1, ' mEq/hr');

  if ( numberOfAdditives > 3 ) {
    $('#nicu-lytes-additive-note').removeClass('hidden');
  } else {
    $('#nicu-lytes-additive-note').addClass('hidden');
  }
  if ( totalNaPerBag > 38.5 ) {
    $('#nicu-lytes-sodium-note').html('Warning: NaCl exceeds the recommended 0.9% concentration');
    $('#nicu-lytes-sodium-note').addClass('alert-danger').removeClass('alert-warning').removeClass('hidden');
  } else if ( totalNaPerBag > 19.3 ) {
    $('#nicu-lytes-sodium-note').html('Warning: NaCl exceeds the recommended 0.45% concentration');
    $('#nicu-lytes-sodium-note').addClass('alert-warning').removeClass('alert-danger').removeClass('hidden');
  } else {
    $('#nicu-lytes-sodium-note').html('');
    $('#nicu-lytes-sodium-note').removeClass('alert-danger').removeClass('alert-warning').addClass('hidden');
  }
  if ( totalKPerBag > 20 ) {
    $('#nicu-lytes-potassium-note').html('Warning: Potassium exceeds the recommended 20 mEq/250 mL concentration');
    $('#nicu-lytes-potassium-note').addClass('alert-danger').removeClass('hidden');
  } else {
    $('#nicu-lytes-potassium-note').html('');
    $('#nicu-lytes-potassium-note').removeClass('alert-danger').addClass('hidden');
  }
  if ( caPhosProduct > 50 ) {
    $('#nicu-lytes-caPhos-note').html('Ca-Phos product is too high, consider supplementing Ca gluconate via IV bolus');
    $('#nicu-lytes-caPhos-note').addClass('alert-danger').removeClass('alert-warning').removeClass('hidden');
  } else if ( totalCaPerBag > 0 && totalPhosPerBag > 0 ) {
    $('#nicu-lytes-caPhos-note').html('Fluid contains both Ca and Phos; ensure that a 0.22 micron filter is used');
    $('#nicu-lytes-caPhos-note').removeClass('alert-danger').addClass('alert-warning').removeClass('hidden');
  } else {
    $('#nicu-lytes-caPhos-note').html('');
    $('#nicu-lytes-caPhos-note').removeClass('alert-danger').removeClass('alert-warning').addClass('hidden');
  }
  const nsEquivRate = hourlyRate * 0.154;
  const hnsEquivRate = hourlyRate * 0.077;
  const qnsEquivRate = hourlyRate * 0.0385;

  displayValue('#nicu-lytes-equivalent-ns', nsEquivRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-equivalent-hns', hnsEquivRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-equivalent-qns', qnsEquivRate, 0.1, ' mEq/hr');

}


/**
 * NICU Fluid Component Parameters
 * @typedef  {Object} NicuFluidComponentParams
 * @property {String} ident        - Identifier
 * @property {Number} [sodium]     - mEq of sodium per mEq of this component
 * @property {Number} [potassium]  - mEq of potassium per mEq of this component
 * @property {Number} [calcium]    - mEq of calcium per mEq of this component
 * @property {Number} [phosphate]  - mEq of phosphate per mEq of this component
 */