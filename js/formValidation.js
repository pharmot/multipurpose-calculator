/**
 * Form input validation module
 * @module formValidation
 * @requires module:util
 */
import { checkValue, checkTimeInput, parseAge } from './util.js';
import * as LOG from './logger.js';

/**
 * Set up event listeners for form validation
 * @param   {FormValidationConfig[]} config  configuration for setup
 * @param   {Boolean}                logger  Set to true to enable logger
 * @returns {String} space-delimited list of all selectors used
 */
export default function setup(config) {
  LOG.beginFunction('[formValidation] setup', arguments);
  let fields = '';
  for ( const item of config ) {
    fields += `${item.selector}, `;
    // Remove 'invalid' class on focus
    $(item.selector).on('focus', e => {
      $(e.target).removeClass('invalid');
    });
    // Handle items with an itemType
    if ( item.inputType ) {
      if ( item.inputType === 'age' ) {
        $(item.selector).on('focusout', e => {
          if ( $(e.target).val() !== '' ) {
            validateAge(e.target, item);
          }
        });
      } else if ( item.inputType === 'time' ) {
        $(item.selector).on('focusout', e => {
          if ( $(e.target).val() !== '' ) {
            validateTime(e.target, item);
          }
        });
      }
    } else if ( item.max ) {
      // Handle items with a range
      $( item.selector ).on('focusout', e => {
        if ( $( e.target ).val() !== '' ) {
          validateRange(e.target, item);
        }
      });
    } else if ( item.match ) {
      // Handle items with a RegExp match
      $(item.selector).on('focusout', e => {
        if ( $(e.target).val() !== '' ) {
          validateMatch(e.target, item);
        }
      });
    }
  }
  LOG.endResult(fields.slice(0, -2));
  // Remove trailing comma-space
  return fields.slice(0, -2);
}

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
function validateAge(el, item) {
  LOG.beginFunction('[formValidation] validateAge', arguments);
  const yearsOld = parseAge( $(el).val() );
  LOG.blueText(`${$(el).val()} = ${yearsOld} years`);
  const validatedAge = checkValue(yearsOld, item.min, item.max);
  if ( validatedAge === 0 ) {
    LOG.redText(`Invalid input: ${$(el).val()}`);
    $(el).addClass('invalid');
  } else {
    LOG.greenText(`Valid input: ${$(el).val()}`);
    $(el).removeClass('invalid');
  }
  LOG.groupEnd();
  return el;
}
/**
 * Callback for validating time input.  Adds 'invalid' class to DOM element if
 * input is invalid.  If valid, replaces input value with correctly formatted
 * time input string and removes 'invalid' class.
 * @requires module:util
 * @param   {HTMLElement}          el    DOM element
 * @param   {FormValidationConfig} item  Current element's validation configuration
 * @returns {HTMLElement}                The original DOM element, for chaining
 */
/* eslint-disable-next-line no-unused-vars */
function validateTime(el, item) {
  LOG.beginFunction('[formValidation] validateTime', arguments);
  const x = $(el).val();
  const corrected = checkTimeInput(x);
  if ( corrected === '' ) {
    LOG.redText(`Invalid time input: ${x}`);
    $(el).addClass('invalid');
  } else {
    if ( corrected !== x ) LOG.blueText(`${x} corrected to ${corrected}`);
    $(el).val(corrected);
    LOG.greenText(`Valid time input: ${corrected}`);
    $(el).removeClass('invalid');
  }
  LOG.groupEnd();
  return el;
}
/**
 * Callback for validating numerical input with defined minimum and maximum.
 * Adds 'invalid' class to DOM element if input is invalid, otherwise removes
 * 'invalid' class.
 * @param   {HTMLElement}          el    DOM element
 * @param   {FormValidationConfig} item  Current element's validation configuration
 * @returns {HTMLElement}                The original DOM element, for chaining
 */
function validateRange(el, item) {
  LOG.beginFunction('[formValidation] validateRange', arguments);
  if ( checkValue(+$(el).val(), item.min, item.max) === 0 ) {
    LOG.redText(`Invalid input: ${$(el).val()}`);
    $(el).addClass('invalid');
  } else {
    LOG.greenText(`Valid input: ${$(el).val()}`);
    $(el).removeClass('invalid');
  }
  LOG.groupEnd();
  return el;
}
/**
 * Callback for validating input against a regular expression.  Adds 'invalid'
 * class to DOM element if input is invalid, otherwise removes 'invalid' class.
 * @param   {HTMLElement}          el    DOM element
 * @param   {FormValidationConfig} item  Current element's validation configuration
 * @returns {HTMLElement}                The original DOM element, for chaining
  */
function validateMatch(el, item) {
  LOG.beginFunction('[formValidation] validateMatch', arguments);
  if ( !item.match.test($(el).val())) {
    LOG.redText(`Invalid input: ${$(el).val()}`);
    $(el).addClass('invalid');
  } else {
    LOG.greenText(`Valid input: ${$(el).val()}`);
    $(el).removeClass('invalid');
  }
  LOG.groupEnd();
  return el;
}
