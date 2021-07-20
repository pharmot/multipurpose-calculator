/**
 * Copyright (c) 2021
 *
 * VMFH Pharmacy Multipurpose Calculator
 * Utilities module
 *
 * @author Andy Briggs <andrewbriggs@chifranciscan.org>
 * @since v0.1.1
 * Created at     : 2021-06-13
 * Last modified  : 2021-07-18
 */

/**
 * Convert date object to string formatted as 'MM/dd @ HHmm'
 *
 * @param   {Date}   d   date object to convert
 * @returns {String}
 */
export function displayDate(d) {
  let mm = ("0" + d.getMinutes()).slice(-2),
      hh = ("0" + d.getHours()).slice(-2),
      mo = d.getMonth() + 1,
      dd = d.getDate();
  return mo + "/" + dd + " @ " + hh + mm;
}

/**
 * Convert date and time raw input to a date object.
 *
 * @param   {String} d   date string from input field
 * @param   {String} t   time string from input field
 * @returns {Date}       date object (returns 0 if input is invalid)
 */
export function getDateTime(d, t) {
  t = checkTimeInput(t);
  if ( d === "" || t === "" ) return 0;
  let dy = +d.slice(0, 4),
      dm = +d.slice(5, 7),
      dd = +d.slice(8, 10),
      th = +t.slice(0, 2),
      tm = +t.slice(2, 4);
  return new Date(dy, dm - 1, dd, th, tm, 0, 0);
}

/**
 * Calculate the number of hours between two dates
 *
 * @param   {Date}   first   first Date object
 * @param   {Date}   second  second Date object
 * @returns {Number}         hours between first and second date
 */
export function getHoursBetweenDates(first, second){
  return (second - first)/ 1000 / 60 / 60;
}

/**
 * Rounds a number to a specified factor.
 *
 * @param   {Number} x  The number to round
 * @param   {Number} n  The rounding factor
 * @returns {Number}    The rounded number
 */
export function roundTo(x, n = 0) {
  if ( n <= 0 || isNaN(x) ) return x;
  let t = Math.round(x / n) * n;
  t = Math.floor(t * 1000);
  t = t / 1000;
  return t;
}


/**
 * Displays a number, rounded, with units in the specified input element.
 * If number is zero, clears input element instead.
 *
 * @param   {String|HTMLElement} el                        Valid jQuery selector for target element
 * @param   {Number}            [num = 0]                  The number to go in the input field
 * @param   {Number}            [round = -1]               The desired rounding factor
 * @param   {String}            [unit = ""]                Units to append to rounded value
 * @param   {String}            [pre = ""]                 Text to prepend to rounded value
 * @param   {Boolean}           [allowNegative = false]    Accept negative values as valid
 * @returns {HTMLElement}                                  The original DOM element, for chaining
 */
export function displayValue( el, num = 0, round = -1, unit = "", pre = "", allowNegative = false){
  let txt = '';
  let wasNeg = false;
  if ( num < 0 && allowNegative ) {
    num = 0 - num;
    wasNeg = true;
  }
  if( num > 0 ) {
    txt = roundTo(num, round);
  }

  if ( wasNeg ) {
    txt = 0 - txt;
  }

  if ( txt !== '' ) {
    txt = pre + txt + unit;
  }

  if ( el === '' ) return txt;
  $(el).html(txt);
  return el;
};

/**
 * Evaluates a number, returns if is valid, between optional minimum
 * and maximum, otherwise returns zero (or undefined if zero is allowed).
 *
 * @param   {(Number|String)}  x                  Value to check
 * @param   {Number}          [min=-Infinity]     Minimum of acceptable range
 * @param   {Number}          [max=Infinity]      Maximum of acceptable range
 * @param   {Boolean}         [zeroAllowed=false] Is zero acceptable?
 * @returns {Number}                              The input value if acceptable,
 *                                                zero if unacceptable, or undefined
 *                                                if unacceptable and zero is allowed
 */
export function checkValue(x, min = -Infinity, max = Infinity, zeroAllowed = false ) {
  if ( zeroAllowed ) {
    if ( x === "" ) return undefined;
  }
  x = parseFloat(x);
  if ( typeof x === 'string' || isNaN(x) || x < min || x > max ) return 0;
  return x;
}

export function checkTimeInput(x){
  x += "";
  if (/(^[0-1]{0,1}[0-9]{1}$)|(^2[0-3]{1}$)/.test(x)) {
    return ("0" + x + "00").slice(-4);
  }
  if ( /^(([0-1]{0,1}[0-9]{1})|2{1}[0-4]{1})[0-5]{1}[0-9]{1}$/.test(x) ) {
    return ("0"+ x.slice(0, -2) ).slice(-2) + x.slice(-2);
  }
  return "";
}
