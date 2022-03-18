/**
 * Form input validation module
 * @module formValidation
 * @requires module:util
 */
 import { checkValue, checkTimeInput } from './util.js'

/**
 * Set up event listeners for form validation
 * @param   {FormValidationConfig[]} config  configuration for setup
 * @returns {String} space-delimited list of all selectors used
 */
export default function setup(config){
  let fields = "";
  for ( let item of config ) {
    fields += `${item.selector}, `;
    // Remove 'invalid' class on focus
    $(item.selector).on("focus", e => {
      $(e.target).removeClass("invalid");
    })
    // Handle items with an itemType
    if ( item.inputType ) {
      if ( item.inputType === "age" ) {
        $(item.selector).on("focusout", e => {
          if( $(e.target).val() !== "" ) {
            validateAge(e.target, item);
          }
        })
      } else if ( item.inputType === "time" ) {
        $(item.selector).on("focusout", e => {
          if( $(e.target).val() !== "" ) {
            validateTime(e.target, item);
          }
        })
      }
    } else if ( item.max ) {
      // Handle items with a range
      $( item.selector ).on("focusout", e => {
        if( $( e.target ).val() !== "" ) {
          validateRange(e.target, item);
        }
      });
    } else if ( item.match ) {
      // Handle items with a RegExp match
      $(item.selector).on("focusout", e => {
        if( $(e.target).val() !== "" ) {
          validateMatch(e.target, item);
        }
      });
    }
  }
  // Remove trailing comma-space
  return fields.slice(0,-2);
};

/**
 * Form validation configuration parameters.  Must have either an inputType,
 * a 'match' property, or a 'min' and 'max' property
 * @typedef  {Object} FormValidationConfig
 * @property {String}  selector      jQuery selector of inputs to validate
 * @property {Number} [min]          Minimum valid numeric input
 * @property {Number} [max]          Maximum valid numeric input
 * @property {RegExp} [match]        Regular expression that matches valid input
 * @property {String} [inputType]    Type of input if not a match or min/max validation
 */


/**
 * Callback for validating age input.  Adds 'invalid' class to DOM element if
 * input is invalid or removes if valid.
 * @requires module:util
 * @param   {HTMLElement}          el     DOM element
 * @param   {FormValidationConfig} item   Current element's validation configuration
 * @returns {HTMLElement}                 The original DOM element, for chaining
 */
function validateAge(el, item){
  let x = $(el).val();
  let yearsOld = 0;
  if ( /^\d+ *[Dd]$/.test(x) ) {
    const days = +x.replace(/ *d */gi, '');
    yearsOld = days/365.25;
  } else if ( /^\d+ *[Mm]$/.test(x) ) {
    const months = +x.replace(/ *m */gi, '');
    yearsOld = months/12;
  } else if ( /^\d+ *[Mm]\d+ *[Dd]$/.test(x) ) {
    let arrAge = x.split('m');
    arrAge[1] = arrAge[1].replace('d', '');
    yearsOld = arrAge[0]/12 + arrAge[1]/365.25;
  } else {
    yearsOld = x
  }
  const validatedAge = checkValue(yearsOld, item.min, item.max);
  if ( validatedAge === 0 ) {
    $(el).addClass("invalid");
  } else {
    $(el).removeClass("invalid");
  }
  return el;
};
/**
 * Callback for validating time input.  Adds 'invalid' class to DOM element if
 * input is invalid.  If valid, replaces input value with correctly formatted
 * time input string and removes 'invalid' class.
 * @requires module:util
 * @param   {HTMLElement}          el    DOM element
 * @param   {FormValidationConfig} item  Current element's validation configuration
 * @returns {HTMLElement}                The original DOM element, for chaining
 */
function validateTime(el, item){
  let x = $(el).val();
  let corrected = checkTimeInput(x);
  if ( corrected === "" ) {
    $(el).addClass("invalid");
  } else {
    $(el).val(corrected);
    $(el).removeClass('invalid');
    $(el).removeClass('invalid');
  }
  return el;
};
/**
 * Callback for validating numerical input with defined minimum and maximum.
 * Adds 'invalid' class to DOM element if input is invalid, otherwise removes
 * 'invalid' class.
 * @param   {HTMLElement}          el    DOM element
 * @param   {FormValidationConfig} item  Current element's validation configuration
 * @returns {HTMLElement}                The original DOM element, for chaining
 */
function validateRange(el, item){
  if ( checkValue(+$(el).val(), item.min, item.max) === 0 ) {
    $(el).addClass("invalid");
  } else {
    $(el).removeClass('invalid');
  }
  return el;
};
/**
 * Callback for validating input against a regular expression.  Adds 'invalid'
 * class to DOM element if input is invalid, otherwise removes 'invalid' class.
 * @param   {HTMLElement}          el    DOM element
 * @param   {FormValidationConfig} item  Current element's validation configuration
 * @returns {HTMLElement}                The original DOM element, for chaining
  */
function validateMatch(el, item){
  if ( ! item.match.test($(el).val())) {
    $(el).addClass("invalid");
  } else {
    $(el).removeClass('invalid');
  }
  return el;
}
