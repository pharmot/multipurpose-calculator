/**
 * Reverse Heparin Calculator Module
 * @module heparin
 * @requires module:util
 * @since v1.1.0
 */
// TODO: display data validation errors
import { checkValue, roundTo, displayValue } from './util.js';

$('.input-heparin').on('keyup', () => { heparin.calc() });
$('.input-heparin').on('keyup', () => {
    setTimeout( () => {
      heparin.check()
    }, 500);
});

/**
 * Heparin calculator module namespace
 * @namespace
 */
 const heparin = {
   startingRate: 0,
   finalRate: 0,
   /**
    * Calculates rates and displays calculated values
    * @returns {Null}
    */
   calc() {
     $('#heparin-icon-yes, #heparin-icon-no, #heparin-resultText').addClass('hidden');
     const dw = checkValue(+$('#heparin-wt').val(), 20, 300);
     this.startingRate = checkValue(+$('#heparin-startingRate').val(), 0, 4000);
     const tr = checkValue(+$('#heparin-roundedRate').val(), 0, 50);
     let rate = 0;
     if ( dw > 0 && this.startingRate > 0 ) {
       rate = roundTo(this.startingRate/dw, 0.01);
     }
     displayValue($('#heparin-startingWtRate'), rate, 0.01, ' units/kg/hr');
     if ( tr > 0 && dw > 0 ) {
       this.finalRate = roundTo(dw * tr, 50);
     } else {
       this.finalRate = 0;
     }
     displayValue($('#heparin-finalRate'), this.finalRate, 50, ' units/hr');
   },
   /**
    * Checks final rate against desired rate and displays whether they match
    * @returns {Null}
    */
   check(){
     if ( this.finalRate > 0 && this.startingRate > 0 ) {
       $('#heparin-resultText').removeClass('hidden');
       if ( this.startingRate === this.finalRate ) {
         $('#heparin-resultText').html('Initial rate = desired starting rate').addClass('text-success').removeClass('text-danger');
         $('#heparin-icon-yes').removeClass('hidden');
       } else {
         $('#heparin-resultText').html('Initial rate will not equal desired starting rate.').addClass('text-danger').removeClass('text-success');
         $('#heparin-icon-no').removeClass('hidden');
       }
     }
   }
 }
