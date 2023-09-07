/**
 * Common utility methods
 * @module util
 * @since v0.1.1
 */

/**
 * Convert date object to string formatted as 'M/d/yyyy HH:mm'
 * Returns empty string if input is not a valid date
 *
 * @param   {Date}   d   date object to convert
 * @returns {String}
 */
export function displayDate(d) {
  try {
    const mm = ("0" + d.getMinutes()).slice(-2),
      hh = ("0" + d.getHours()).slice(-2),
      mo = d.getMonth() + 1,
      dd = d.getDate(),
      yyyy = d.getFullYear();
      return `${mo}/${dd}/${yyyy} ${hh}:${mm}`;
  } catch {
    return '';
  }  
}
/**
 * Convert a date object to string formatted as 'HH:mm'
 * Returns empty string if input is not a valid date
 * @since v1.1.1
 * @param {Date} d   date object to convert
 * @returns {String}
 */
export function displayTime(d){
  try {
    const mm = ("0" + d.getMinutes()).slice(-2);
    const hh = ("0" + d.getHours()).slice(-2);
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
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
 * @param   {Number|Number[]}   [num = 0]                  The number or range to go in the input field. Range must be array with length of 2.
 * @param   {Number}            [round = -1]               The desired rounding factor
 * @param   {String}            [unit = ""]                Units to append to rounded value
 * @param   {String}            [pre = ""]                 Text to prepend to rounded value
 * @param   {Boolean}           [allowNegative = false]    Accept negative values as valid
 * @returns {HTMLElement}                                  The original DOM element, for chaining
 */
export function displayValue( el, num = 0, round = -1, unit = "", pre = "", allowNegative = false){
  let txt = '';
  let wasNeg = false;
  let wasNeg2 = false;

  if ( Array.isArray(num) ) {

    if ( num.length === 2 ) {

      let num1 = num[0];
      let num2 = num[1];
      let num1Rounded;
      let num2Rounded;

      if ( num1 < 0 && allowNegative ) {
        num1 = 0-num1;
        wasNeg = true;
      }

      if ( num2 < 0 && allowNegative ) {
        num2 = 0-num2;
        wasNeg2 = true;
      }

      if ( num1 > 0 ) num1Rounded = roundTo(num1, round);

      if ( num2 > 0 ) num2Rounded = roundTo(num2, round);

      if ( wasNeg ) num1Rounded = 0 - num1Rounded;

      if ( wasNeg2 ) num2Rounded = 0 - num2Rounded;

      if ( num1 == num2 ) {
        txt = num1;
      } else {
        txt = `${num1Rounded} - ${num2Rounded}`;
      }
    }
  } else {
    if ( num !== Infinity && num !== -Infinity ) {

      if ( num < 0 && allowNegative ) {
        num = 0 - num;
        wasNeg = true;
      }

      if( num > 0 ) txt = roundTo(num, round);

      if ( wasNeg ) txt = 0 - txt;

    }
  }
  if ( txt !== '' ) {
    txt = pre + txt + unit;
  }

  if ( el === '' ) return txt;
  $(el).html(txt);
  return el;
};

/**
 * Parses age input in years, months, days, or months+days and returns in years.
 *
 * @param   {String} x     Age input
 * @returns {Number}       Age in years (or undefined if invalid input)
 */
export function parseAge(x){
  let yearsOld = 0;
  if ( /^\d+ *[Dd]$/.test(x) ) {
    const days = +x.replace(/ *d */gi, '');
    return days/365.25;
  }
  if ( /^\d+ *[Mm]$/.test(x) ) {
    const months = +x.replace(/ *m */gi, '');
    return months/12;
  }
  if ( /^\d+ *[Mm]\d+ *[Dd]$/.test(x) ) {
    let arrAge = x.split('m');
    arrAge[1] = arrAge[1].replace('d', '');
    return arrAge[0]/12 + arrAge[1]/365.25;
  }
  if ( isNaN(+x) ) return undefined;
  return +x;
}

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
//TODO: document checkTimeInput
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
