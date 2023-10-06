/**
 * Logger for debugging and calculation output
 * @module logger
 * @requires module:arial
 */

import * as arial from './arial.js';

/**
 * Status of logger, determines if console wrapper functions are executed
 */
export let enabled = false;

/**
 * Enables logging
 */
export function enable() { enabled = true;}
/**
 * Wrapper for console.log, dependent on whether logging has been enabled.
 * @param   {String|Object|Array}  msg     Message to log to console
 * @param   {String}               title   Title for message
 * @returns {undefined}
 */
export function log(msg = '', title = '') {
  if (!enabled) return;
  if ( (typeof msg === 'object' || Array.isArray(msg) ) && title !== '' ) {
    console.log(`==========${title}==========`);
    console.log(msg);
  } else {
    console.log(title === '' ? msg : `==${title}== ${msg}`);
  }
}
/**
 * Wrapper for console.log when using multiple arguments or colors
 * Used when behavior of the log() function is not desired.
 * @param   {} msg
 * @returns {undefined}
 */
export function logArgs(...msg) {
  if ( !enabled ) return;
  console.log(...msg);
}
/**
 * Wrapper for console.error, dependent on whether logging has been enabled
 * @param   {String}    msg     Error message to log to console
 * @param   {String}    title   Title for error message
 * @returns {undefined}
 */
export function error(msg = '', title = '') {
  if (!enabled) return;
  console.error(title === '' ? msg : `[${title}]   ${msg}`);
}
/**
 * Wrapper for console.warn, dependent on whether logging has been enabled
 * @param   {String}    msg     Warning message to log to console
 * @param   {String}    title   Title for warning message
 * @returns {undefined}
 */
export function warn(msg = '', title = '') {
  if (!enabled) return;
  console.warn(title === '' ? msg : `[${title}]   ${msg}`);
}
/**
 * Wrapper for console.group, dependent on whether logging has been enabled
 * @param   {String}    msg     Message to log to console
 * @returns {undefined}
 */
export function group(msg = "") {
  if (!enabled) return;
  console.group(msg);
}
/**
 * Wrapper for console.groupCollapsed, dependent on whether logging has been enabled
 * @param   {String}    msg     Message to log to console
 * @returns {undefined}
 */
export function groupCollapsed(msg = "") {
  if (!enabled) return;
  console.groupCollapsed(msg);
}
/**
 * Wrapper for console.groupEnd, dependent on whether logging has been enabled
 * @returns {undefined}
 */
export function groupEnd() {
  if (!enabled) return;
  console.groupEnd();
}
//TODO: document outputTape function
export function outputTape(parent, title = "") {
  let titleHtml = "";
  title = title.toUpperCase();
  const divider = arial.underline(title, "=");
  if ( title !== "" ) {
    titleHtml = `${title}<br>${divider}`;
  }
  let txt = "";
  const items = [];
  parent.forEach(child => {
    if ( !( child[1] instanceof Array ) ) {
      items.push(child);
    } else {
      if ( child[0] instanceof Array ) {
        txt += `<br>`;
        txt += printArray(child);
      } else {
        txt += `<br><u>${child[0]}</u><br>`;
        txt += printArray(child[1]);
      }
    }
  });
  return `${titleHtml}${printArray(items)}${txt}`;
}
/**
 * Takes an array of [label, value] arrays and converts to text/html with breaks
 * after each line, padded with nonbreaking spaces so values will be aligned.
 * Labels with an empty string as their value will not be included.
 * 
 * @example
 * printArray([
 *   ['Actual Body Weight', '70 kg'],
 *   ['Height', '180 cm'],
 * ]);
 * 
 * // resulting HTML will appear like this (in Arial):
 * Actual Body Weight:  70 kg
 * Height:              180 cm
 * 
 * @param   {String[][]} arr Array of any length, each member must be an array of 2 strings
 * @returns {String}
 */
function printArray(arr) {
  let labels = [];
  const values = [];
  let txt = "";
  arr.forEach(el => {
    if ( el[1] !== "" ) {
      labels.push(`${el[0]}:`);
      values.push(el[1]);
    }
  });
  labels = arial.padArray(labels);
  for ( let i = 0; i < labels.length; i++ ) {
    txt += `${labels[i] + values[i]  }<br>`;
  }
  return txt;
}
