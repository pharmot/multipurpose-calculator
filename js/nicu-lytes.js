/**
 * NICU Equivalent Lytes Calculator
 * @since v1.4.0
 * @requires module:util
 * @requires module:formValidation
 * @requires module:periodicCalc
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
import { getValence, getAtomicMass } from './periodicCalc.js';

/**
 * Length of timeout (in ms) for event handlers that use elements from other modules
 */
const MODULE_DELAY = 100;

let debug = false;
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
    debug = true;
    LOG.enable();
  } else if ( /log/.test( location.search ) ) {
    LOG.enable();
  }
  // $("[data-toggle=\"popover\"]").popover({ html: true });
  // $("[data-toggle=\"tooltip\"]").tooltip();
  // $(".hidden").addClass('hidden');

  if ( debug ) {
    LOG.presetValues();
    $('#nicu-lytes-weight').val(4.4);
    $('#nicu-lytes-dailyRatePerKg').val(60);
    $('#nicu-lytes-hourlyRate').val(5.5);
  } else {
    // resetDates();
  }
  validatedFields = setupValidation([
    { selector: '#nicu-lytes-weight', min: 0, max: 40 },
    { selector: '#nicu-lytes-totalVolume', min: 0, max: 1000 },
  ]);
  // $("#nicu-wt").get(0).focus();
});
//---------------------------------------------------------------
// EVENT LISTENERS

// Reset Button
$( '#nicu-lytes-reset' ).on( 'click', () => {
  LOG.green( 'Reset' );
  $( '.input-nicu-lytes' ).val(null);
  $( '#nicu-lytes-totalVolume' ).val( 250 );
  $( '#nicu-lytes-dextroseConc' ).val( 5 );
  $( validatedFields ).removeClass( 'invalid' );
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
    return this;
  }
  update({ wt, hourlyRate, totalVolume } = {}) {
    LOG.beginFunction(`Update: ${this.ident}`, arguments);
    this.dailyDosePerKg = checkValue( $( `#${this.idInput}` ).val() );
    if ( this.dailyDosePerKg > 0 && wt > 0 && hourlyRate > 0 && totalVolume > 0 ) {
      this.bagDosePerKg =   this.dailyDosePerKg / ( hourlyRate * 24 ) * totalVolume;
      this.bagAmount = this.bagDosePerKg * wt;
      this.bagConcentration = this.bagAmount / totalVolume;
    } else {
      this.bagDosePerKg = 0;
      this.bagAmount = 0;
      this.bagConcentration = 0;
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
  const inputHourlyRate = checkValue( +$('#nicu-lytes-hourlyRate').val(), 0, 999 );
  const totalVolume = checkValue( +$('#nicu-lytes-totalVolume').val(), 0, 1000 );

  const calcHourlyRate = dailyRatePerKg * wt / 24;

  if ( inputHourlyRate === 0 ) {
    displayValue('#nicu-lytes-hourlyRate', calcHourlyRate, 0.1);
  }

  const hourlyRate = inputHourlyRate === 0 ? calcHourlyRate : inputHourlyRate;

  const inputs = { wt, dailyRatePerKg, hourlyRate, totalVolume };
  LOG.cyanGroupCollapsed('Update components');
  components.forEach( c => c.update( inputs ) );
  LOG.groupEnd();

  const totalNaPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.sodium }, 0 );
  const totalKPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.potassium }, 0);
  const totalCaPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.calcium }, 0);
  const totalPhosPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.phosphate }, 0);
  const totalMgPerBag = components.reduce( ( tot, c ) => { return tot + c.bagAmount * c.magnesium }, 0);
  LOG.log(`Na: ${totalNaPerBag}, K: ${totalKPerBag}, Ca: ${totalCaPerBag}, Phos: ${totalPhosPerBag}, Mg: ${totalMgPerBag}`);

  const totalNaRate =  totalNaPerBag / totalVolume  * hourlyRate;
  const totalKRate =  totalKPerBag / totalVolume  * hourlyRate;
  const totalCaRate =  totalCaPerBag / totalVolume  * hourlyRate;
  const totalPhosRate =  totalPhosPerBag / totalVolume  * hourlyRate;
  const totalMgRate =  totalMgPerBag / totalVolume  * hourlyRate;

  const mwNaCl = getAtomicMass('NaCl');
  const valNaCl = getValence('NaCl');
  const sodPercentNaCl =   totalNaPerBag / ( totalVolume / 100 ) / valNaCl  * mwNaCl  / 1000;
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
  displayValue('#nicu-lytes-sodium-percent-nacl', sodPercentNaCl, 0.01, '% NaCl', 'Bag contains the same amount of sodium as in ');

  if ( sodPercentNaCl === 0 ) {
    $('#nicu-lytes-sodium-percent-nacl').addClass('hidden');
  } else {
    $('#nicu-lytes-sodium-percent-nacl').removeClass('hidden');
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

  const nsEquivRate = calcHourlyRate * 0.154;
  const hnsEquivRate = calcHourlyRate * 0.077;
  const qnsEquivRate = calcHourlyRate * 0.0385;

  displayValue('#nicu-lytes-equivalent-ns', nsEquivRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-equivalent-hns', hnsEquivRate, 0.1, ' mEq/hr');
  displayValue('#nicu-lytes-equivalent-qns', qnsEquivRate, 0.1, ' mEq/hr');


  //  mL  x   mEq
  //  hr      mL
}


// At the ordered daily rate, 1/4 NS (NaCl 0.225%) would deliver NaCl __ mEq/hr (contains 0.0385 mEq/mL)
// At the ordered daily rate, 1/2 NS (NaCl 0.45%) would deliver NaCl __  mEq/hr (contains 0.077 mEq/mL)
// At the ordered daily rate, NS (NaCl 0.9%) would deliver NaCl __ mEq/hr (contains 0.154 mEq/mL)


/**
 * NICU Fluid Component Parameters
 * @typedef  {Object} NicuFluidComponentParams
 * @property {String} ident        - Identifier
 * @property {Number} [sodium]     - mEq of sodium per mEq of this component
 * @property {Number} [potassium]  - mEq of potassium per mEq of this component
 * @property {Number} [calcium]    - mEq of calcium per mEq of this component
 * @property {Number} [phosphate]  - mEq of phosphate per mEq of this component
 */