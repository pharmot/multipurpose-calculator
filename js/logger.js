/**
 * Logger for debugging and calculation output
 * @module logger
 * @requires module:arial
 */

import * as arial from './arial.js';

const colors = {
  black:               "#2F2F2F",
  brightBlack:         "#5A6374",
  white:               "#D3D7CF",
  brightWhite:         "#ffffff",
  red:                 "#DC322F",
  brightRed:           "#EF2929",
  yellow:              "#C4A000",
  brightYellow:        "#FCE94F",
  green:               "#4E9A06",
  brightGreen:         "#8AE234",
  cyan:                "#06989A",
  brightCyan:          "#34E2E2",
  blue:                "#3465A4",
  brightBlue:          "#729FCF",
  purple:              "#A626A4",
  brightPurple:        "#C577DD",
}


/**
 * Status of logger, determines if console wrapper functions are executed
 */
export let enabled = false;

/**
 * Status of debugging, exported to allow modules to pre-fill their own test values
 */
export let debugEnabled = false;

/**
 * Enables logging
*/
export function enable() {
  enabled = true;
  black('               Logging enabled               ');
}

/**
 * Enables debugger
 */
export function presetValues() {
  debugEnabled = true;
  gray('        Debug mode, values pre-filled        ');
}
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
export function blue(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.blue};color: ${colors.brightWhite}`);
}
export function red(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.red};color: ${colors.brightWhite}`);
}
export function yellow(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.brightYellow};color: ${colors.black}`);
}
export function cyan(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.cyan};color: ${colors.brightWhite}`);
}
export function purple(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.purple};color: ${colors.brightWhite}`);
}
export function green(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.green};color: ${colors.brightWhite}`);
}
export function black(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.black};color: ${colors.brightWhite}`);
}
export function gray(msg) {
  if ( !enabled ) return;
  console.log(`%c ${msg} `, `background: ${colors.brightBlack};color: ${colors.brightWhite}`);
}
export function blueGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.blue};color: ${colors.brightWhite}`);
}
export function redGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.red};color: ${colors.brightWhite}`);
}
export function yellowGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.brightYellow};color: ${colors.black}`);
}
export function cyanGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.cyan};color: ${colors.brightWhite}`);
}
export function purpleGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.purple};color: ${colors.brightWhite}`);
}
export function greenGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.green};color: ${colors.brightWhite}`);
}
export function blackGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.black};color: ${colors.brightWhite}`);
}
export function grayGroup(msg) {
  if ( !enabled ) return;
  console.group(`%c ${msg} `, `background: ${colors.brightBlack};color: ${colors.brightWhite}`);
}
export function blueGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.blue};color: ${colors.brightWhite}`);
}
export function redGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.red};color: ${colors.brightWhite}`);
}
export function yellowGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.brightYellow};color: ${colors.black}`);
}
export function cyanGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.cyan};color: ${colors.brightWhite}`);
}
export function purpleGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.purple};color: ${colors.brightWhite}`);
}
export function greenGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.green};color: ${colors.brightWhite}`);
}
export function blackGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.black};color: ${colors.brightWhite}`);
}
export function grayGroupCollapsed(msg) {
  if ( !enabled ) return;
  console.groupCollapsed(`%c ${msg} `, `background: ${colors.brightBlack};color: ${colors.brightWhite}`);
}
export function blueText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.blue}`);
}
export function redText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.red}`);
}
export function yellowText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.yellow}`);
}
export function cyanText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.cyan}`);
}
export function purpleText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.purple}`);
}
export function greenText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.green}`);
}
export function grayText(msg) {
  if ( !enabled ) return;
  console.log(`%c${msg}`, `color: ${colors.brightBlack}`);
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
/**
 * Shortcut to start a group with the name of a function and its arguments
 * @example   LOG.beginFunction('myFunctionName', arguments);
 *
 * @param   {String} functionName - Name of the function, to serve as the group caption
 * @param   {Any[]}  [args]       - The function's arguments object
 * @returns {undefined}
 */
export function beginFunction(functionName, args){
  if (!enabled) return;
  console.groupCollapsed(`%c ${functionName} `, `color:${colors.brightYellow};background:${colors.blue}` );
  if ( args ) {
    console.group('%c Input ', `background: ${colors.brightBlue};color:${colors.brightWhite}`);
    for ( let i = 0; i < args.length; i++ ) {
      log(JSON.parse(JSON.stringify(args[i])));
    }
    groupEnd();
  }  
}
/**
 * Use when exiting a function due to missing or invalid input(s)
 *
 * @param   {Any} [res] Result of the function
 * @returns {undefined}
 */
export function exitFunction(res){
  if (!enabled) return;
  console.log('%c Required value(s) are missing or invalid ', `background: ${colors.red};color: ${colors.brightYellow}`);
  
  if ( res ) {
    console.group('%c Result ', `background: ${colors.brightBlue};color:${colors.brightWhite}`);
    log(JSON.parse(JSON.stringify(res)));
    groupEnd();
  }
  groupEnd();
}
/**
 * Shortcut for LOG.log({result: res});LOG.groupEnd()
 * @param {Any} res result of function
 */
export function endResult(res){
  if (!enabled) return;
  console.group('%c Result             ', `background: ${colors.brightBlue};color:${colors.brightWhite}`);
  if ( res ) log(JSON.parse(JSON.stringify(res)));
  groupEnd();
  console.log('%c                          ', `background: ${colors.blue}`);
  groupEnd();
}

/**
 * Log an object to the console as a deep copy
 * @param {any} obj
 */
export function deep(obj){
  if ( !enabled ) return;
  console.log(JSON.parse(JSON.stringify(obj)));
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
    if ( Array.isArray( el ) && el.length > 1 ) {
      if ( el[1] !== "" ) {
        if ( el[0].length > 0 ) {
          labels.push(`${el[0]}:`);
        } else {
          labels.push(' ');
        }
        values.push(el[1]);
      }
    }
  });
  labels = arial.padArray(labels);
  for ( let i = 0; i < labels.length; i++ ) {
    txt += `${labels[i] + values[i]  }<br>`;
  }
  return txt;
}
