/**
* Glucommander Initial Dosing Module
* @module glucommander
* @requires module:util
* @requires module:logger
* @since v1.3.1
*/

import { checkValue, displayValue } from './util.js';
import * as LOG from "./logger.js";

/**
 * Total daily dose of PTA regimen.
 * @type {number}
 */
let PTA_TDD;

/**
 * Percent as basal of PTA regimen (0 to 100)
 * @type {number}
 */
let PTA_PCT_BASAL;

/**
 * Length of timeout (in ms) for event handlers that use elements from other modules
 */
const MODULE_DELAY = 150;

$(() => {
  setTimeout( () => {
    if ( LOG.debugEnabled ) {      
      $('#gm-ptaDose1').val(23);
      $('#gm-ptaDose2').val(20);
      $('#gm-ptaDose3').val(14);
      $('#gm-ptaDose4').val(14);
      $('#gm-ptaDose5').val(15);
      ptaDosing(); 
    }
  }, MODULE_DELAY);

  resetAll(true);

});

$('#weight').on('keyup', weightChanged);
$('#btnReset').on('click', resetClicked);
$('.gm-pta').on('change', ptaChanged);
$('#gm-multiplier').on('change', multiplierChanged);
$('.gm-custom-param').on('change', customParamChanged);
$('.gm-custom-dose').on('change', customDoseChanged);

function resetClicked(){
  setTimeout( resetAll, MODULE_DELAY );
}

function resetAll(initial=false){
  $('#gm-fromPta-custom0').val(20);
  $('#gm-fromPta-custom1').val(25);
  $('#gm-fromPta-custom2').val(30);
  $('#gm-percentBasal-custom0').val(50);
  $('#gm-percentBasal-custom1').val(50);
  $('#gm-percentBasal-custom2').val(50);
  if ( !initial ) {
    $('#gm-multiplier')[0].selectedIndex = 0;
    $('.gm-direction').removeClass('fa-arrow-left').addClass('fa-arrow-right');
    ptaDosing();
    updateBackgroundColor('#gm-fromPta-custom0');
    updateBackgroundColor('#gm-fromPta-custom1');
    updateBackgroundColor('#gm-fromPta-custom2');
  }
}

function weightChanged(){
  setTimeout( calcMultiplier, MODULE_DELAY);
}

function ptaChanged(event){
  setTimeout( () => {
    LOG.yellow('Input received: Glucommander - PTA');
    ptaDosing();
  }, 100); 
}
function multiplierChanged(event){
  LOG.yellow('Glucommander Multiplier Changed')
  calcMultiplier();
}

function customParamChanged(event){
  setTimeout( () => {
    LOG.yellow(`GM CUSTOM PARAM CHANGED: #${event.target.id}`);
    customFromParams(/\d/.exec(event.target.id)[0]);
  }, 200);
}

function customDoseChanged(event){
  setTimeout( () => {
    LOG.yellow(`GM CUSTOM DOSE CHANGED: #${event.target.id}`);
    customFromDose(/\d/.exec(event.target.id)[0]);
  }, 200);
}
 
function ptaDosing(){
  LOG.cyanGroupCollapsed('GLUCOMMANDER: PTA Dosing')
  let basal = 0;
  let bolus = 0;
  PTA_TDD = 0;

  for( let i = 1; i < 6; i++ ){
    const txtDose = $(`#gm-ptaDose${i}`)[0];
    const isBasal = txtDose.classList.contains('gm-basal');    
    const dose = checkValue($(txtDose).val(), 0, 500, true) || 0;

    LOG.greenText(`PTA dose #${i} (${isBasal ? 'basal' : 'bolus'}) = ${dose} units`)
    
    if ( isBasal ) {
      basal += dose;
      LOG.blueText(`        Total basal = ${basal} units`);
    } else {
      bolus += dose;
      LOG.blueText(`        Total bolus = ${basal} units`);
    }    
    PTA_TDD += dose;
    LOG.purpleText(`                TDD = ${PTA_TDD} units`)
  }

  if ( PTA_TDD > 0 ) {
    let percentBasal = ( basal / PTA_TDD ) * 100;
    LOG.log(`FINAL Basal: ${basal}; Bolus: ${bolus}; TDD: ${PTA_TDD}; ${percentBasal}% as basal`);
    PTA_PCT_BASAL = Math.round( percentBasal );
  } else {
    PTA_TDD = undefined;
    PTA_PCT_BASAL = undefined;
  }
  displayValue('#gm-ptaTdd', PTA_TDD);
  displayValue('#gm-ptaTotalBasal', basal);
  displayValue('#gm-ptaTotalBolus', bolus);
  displayValue('#gm-ptaPercentBasal', PTA_PCT_BASAL);


  LOG.groupEnd();
  calcMultiplier();
  recalculateCustom();
}

function calcMultiplier(){
  LOG.cyanGroupCollapsed('GLUCOMMANDER: Multiplier')

  const weight = checkValue(+$("#weight").val(), 1, 300);
  
  const cboMultiplier = $("#gm-multiplier")[0];
  const multiplier = cboMultiplier.options[cboMultiplier.selectedIndex].value;
  
  const c = {
    ident: 'multiplier',
    tdd: Math.round(weight*multiplier),
    percentBasal: weight > 0 ? 50 : 0,
  }
  
  calculateDoses(c);
  if ( weight > 0 ) {
    if ( PTA_TDD ) {
      displayValue(`#gm-fromPta-${c.ident}`, c.percentReduction, 1, '', '', true, true);
    } else {
      displayValue(`#gm-fromPta-${c.ident}`, 0);
    }    
    displayValue(`#gm-percentBasal-${c.ident}`, c.percentBasal);
  } else {
    displayValue(`#gm-fromPta-${c.ident}`, 0);
    displayValue(`#gm-percentBasal-${c.ident}`, 0)
  }
  displayValue(`#gm-tdd-${c.ident}`, c.tdd);
  displayValue(`#gm-basal-${c.ident}`, c.basal);
  displayValue(`#gm-breakfast-${c.ident}`, c.breakfast);
  displayValue(`#gm-lunch-${c.ident}`, c.lunch);
  displayValue(`#gm-dinner-${c.ident}`, c.dinner);
  updateBackgroundColor(`#gm-fromPta-${c.ident}`);
  LOG.groupEnd();
}

/**
 * Calculate custom dosing when dose is provided
 *
 * @param   {Number} i Index of custom dose row that was changed
 */
function customFromDose(i){
  i = parseFloat(i);
  LOG.cyanGroup(`GLUCOMMANDER: Custom (row ${i+1}) from Dose`)
  

  /** @type GlucommanderParams */
  const c = {
    ident: `custom${i}`,
    dir: "fa-arrow-left",
    oppDir: "fa-arrow-right",
    tdd: 0,
  };
  
  
  c.basal = checkValue(+$(`#gm-basal-${c.ident}`).val());
  c.breakfast = checkValue(+$(`#gm-breakfast-${c.ident}`).val());
  c.lunch = checkValue(+$(`#gm-lunch-${c.ident}`).val());
  c.dinner = checkValue(+$(`#gm-dinner-${c.ident}`).val());
  c.tdd = c.basal + c.breakfast + c.lunch + c.dinner;

  checkDirection(c);

  LOG.greenText(`Basal: ${c.basal} / Breakfast: ${c.breakfast} / Lunch: ${c.lunch} / Dinner: ${c.dinner}`);

  if ( c.tdd > 0 ) {
    const percentBasal = 100 * c.basal / c.tdd;
  
    LOG.blueText(`Basal is ${percentBasal}% of TDD`);
  
    c.percentBasal = Math.round(percentBasal);

    if( PTA_TDD > 0 ) {
      const percentReduction = ( 1 - ( c.tdd / PTA_TDD ) ) * 100
      LOG.log(`Reduced from PTA by ${PTA_TDD - c.tdd} units = ${percentReduction}% reduction`);
  
      c.percentReduction = Math.round( percentReduction );
    
    } else {
      LOG.grayText('No PTA dosing available, unable to calculate percent reduction');
    }
    
  } else {
    c.percentBasal = undefined;
    c.percentReduction = undefined;
  }
  if ( PTA_TDD ) {
    if ( c.percentReduction === 0 ) {
      $(`#gm-fromPta-${c.ident}`).val("0");
    } else {
      displayValue(`#gm-fromPta-${c.ident}`, c.percentReduction, 0.1, '', '', true, true);
    }
  } else {
    displayValue(`#gm-fromPta-${c.ident}`, 0);
  }

  displayValue(`#gm-percentBasal-${c.ident}`, c.percentBasal);

  displayValue(`#gm-tdd-${c.ident}`, c.tdd); 

  $(`#gm-fromPta-${c.ident}`).css('background-color', getColor(c.percentReduction));
  LOG.groupEnd();
}

/**
 * Calculate custom dosing when parameters are provided
 *
 * @param   {Number} i Index of custom dose row that was changed
 */
function customFromParams(i){
  i = parseFloat(i);
  LOG.cyanGroup(`GLUCOMMANDER: Custom (row ${i+1}) from Parameters`)
  /** @type GlucommanderParams */
  const c = {
    ident: `custom${i}`,
    dir: "fa-arrow-right",
    oppDir: "fa-arrow-left",
  };
  checkDirection(c);

  LOG.blueText(`PTA: TDD ${PTA_TDD} units (${PTA_PCT_BASAL}% as basal)`);
  if( PTA_TDD > 0 ) {
    c.percentReduction = checkValue(+$(`#gm-fromPta-${c.ident}`).val(), -1000, 1000, true);
    if ( c.percentReduction !== undefined ) {
      c.percentBasal = checkValue(+$(`#gm-percentBasal-${c.ident}`).val(),0,100);      
      LOG.log(`Desired: ${c.percentReduction}% reduction with ${c.percentBasal}% as basal`);
      if ( c.percentBasal > 0 ) {
        const newTdd = (1 - ( c.percentReduction/100 ) ) * PTA_TDD;
        c.tdd = Math.round( newTdd );
        LOG.log(`New TDD is ${newTdd} (rounded to ${c.tdd})`);
        calculateDoses(c);
        displayValue(`#gm-tdd-${c.ident}`, c.tdd);
        LOG.log(`TDD: ${c.tdd} (${c.percentBasal}% as basal) = ${c.percentReduction}% reduction from PTA`);

      }  else {
        LOG.redText('No % basal provided');
      }
    } else {
      LOG.redText('No % reduction provided');
    }
  } else {
    LOG.redText('No PTA dosing provided');
  }
  
  
  displayValue(`#gm-basal-${c.ident}`, c.basal);
  displayValue(`#gm-breakfast-${c.ident}`, c.breakfast);
  displayValue(`#gm-lunch-${c.ident}`, c.lunch);
  displayValue(`#gm-dinner-${c.ident}`, c.dinner);
  
  $(`#gm-fromPta-${c.ident}`).css('background-color', getColor(c.percentReduction));
  
  LOG.groupEnd();
}
/**
 * Check the arrow direction for the current row and update if it has changed
 * @param {GlucommanderParams} c
 */
function checkDirection(c){ 
  if( $(`#gm-dir-${c.ident}`).hasClass(c.oppDir) ){
    LOG.purpleText(`Switched Direction for ${c.ident}`);
    $(`#gm-dir-${c.ident}`).removeClass(c.oppDir).addClass(c.dir);
  } else {
    LOG.purpleText(`Same Direction for ${c.ident}`);
  }
}

/**
 * Calculate all parameters given a TDD and percent basal.
 * TDD is returned unchanged; percentBasal will be adjusted if needed, so all doses are an round number of units
 * 
 * @param {GlucommanderParams} c
 */
function calculateDoses( c ){
  LOG.beginFunction('GLUCOMMANDER: Calculate Doses', arguments);
  if ( c?.tdd > 0 ) {
    const basal = c.tdd * ( c.percentBasal/100 );
    c.basal = Math.round( basal );
    c.bolus = c.tdd - c.basal;
    const percentBasal = (c.basal/c.tdd)*100;
    c.percentBasal = Math.round( percentBasal );
    LOG.log(`Basal: ${basal} / Bolus: ${c.bolus} / Percent Basal: ${percentBasal}`)
    let [ breakfast, lunch, dinner ] = distributeBolus(c.bolus);
    LOG.log(`Breakfast: ${breakfast} / Lunch: ${lunch} / Dinner: ${dinner}`);
    c.breakfast = breakfast;
    c.lunch = lunch;
    c.dinner = dinner;
    if( PTA_TDD > 0 ) {
      const percentReduction = ( 1 - ( c.tdd / PTA_TDD ) ) * 100
      LOG.log(`Reduced from PTA by ${PTA_TDD - c.tdd} units = ${percentReduction}% reduction`);
      c.percentReduction = Math.round( percentReduction );
    } else {
      LOG.grayText('No PTA dosing available, unable to calculate percent reduction');
    }
  } else {
    LOG.redText('TDD = 0');
  }
  LOG.endResult(c);
}


function recalculateCustom(){
  LOG.cyanGroupCollapsed('GLUCOMMANDER: Recalculate Custom');
  for(let i=0; i<3; i++){
    if( $(`#gm-dir-custom${i}`).hasClass("fa-arrow-right") ){
      LOG.cyanText(`Calculating row ${i+1} based on PARAMETERS`);
      customFromParams(i);
    } else {
      LOG.cyanText(`Calculating row ${i+1} based on DOSES`);
      customFromDose(i);
    }
  }  
  LOG.groupEnd();
}
/**
 * Changes the background color of the specified element based on its value
 * 
 * @param {String} selector JQuery selector for either an output div or an input
 */
function updateBackgroundColor(selector) {
  LOG.cyanGroupCollapsed(`GLUCOMMANDER: background color for ${selector}`);
  const el = $(selector)[0];
  const val = el.nodeName === "INPUT" ? $(el).val() : $(el).html();
  LOG.cyanText(val);
  if ( val.length === 0 ) {
    $(el).css('background-color', '')
  } else {
    const clr = getColor(val);
    LOG.cyanText(clr);
    $(el).css('background-color', clr); 
  }
  LOG.groupEnd()
}

function getColor(change){
  if ( isNaN(change) ) return ""; // blank
  if ( change < 0 || change > 100 ) return "#f9c"; // pink
  if ( change > 50 ) return "#fcc"; // red
  if ( change > 40 || change < 10 ) return "#fc9"; // orange
  if ( change > 30 || change < 20 ) return "#ff9"; // yellow
  if ( change > 19 || change < 31 ) return "#cfc"; // green
  return "";
}

/**
 * Distributes a total daily bolus dose between 3 meals with
 * the largest at dinner, then breakfast, then lunch.
 *
 * @param    {Number} total       Total bolus dose to distribute
 * @returns  {Number[]}           Array of breakfast, lunch, and dinner doses
 */
function distributeBolus(total){
  LOG.beginFunction('GLUCOMMANDER: Distribute Bolus', arguments);
  const middle = Math.round( total / 3 );
  const large = Math.round( ( total - middle ) / 2);
  const small = total - middle - large; 
  LOG.log(`Middlest dose: ${middle} --> Breakfast`);
  LOG.log(`Smallest dose: ${small} --> Lunch`);
  LOG.log(`Largest dose:  ${large} --> Dinner`);
  const res = [middle, small, large];
  LOG.endResult(res);
  return res; 
}

/**
 * @typedef  {Object} GlucommanderParams
 * @property {String} ident             identifier to use for DOM updates
 * @property {Number} tdd               total daily dose
 * @property {Number} percentBasal      percent of daily dose that's basal
 * @property {Number} percentReduction  percent reduction from PTA TDD
 * @property {Number} basal             total daily basal dose
 * @property {Number} bolus             total daily bolus dose
 * @property {Number} breakfast         breakfast bolus dose
 * @property {Number} lunch             lunch bolus dose
 * @property {Number} dinner            dinner bolus dose
 * @property {String} dir               direction of calculation (for custom dose)
 * @property {String} oppDir            opposite direction of calculation (for custom dose)
 */