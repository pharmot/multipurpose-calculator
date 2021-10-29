/**
 * Logger for debugging and calculation output
 * @module logger
 * @requires module:arial
 */

import * as arial from './arial.js';
/** Status of logger */
export let enabled = false;
/** Enable logging */
export function enable(){ enabled = true;}

export function log(msg = '', title = ''){
  if (!enabled) return;
  if( (typeof msg === 'object' || typeof msg === 'array') && title !== '' ) {
    console.log(`==========${title}==========`);
    console.log(msg);
  } else {
    console.log(title === '' ? msg : `==${title}== ${msg}`);
  }
};
export function error(msg = '', title = ''){
  if (!enabled) return;
  console.error(title === '' ? msg : `[${title}]   ${msg}`);
};
export function warn(msg = '', title = ''){
  if (!enabled) return;
  console.warn(title === '' ? msg : `[${title}]   ${msg}`);
};
export function group(msg=""){
  if (!enabled) return;
  console.group(msg);
};
export function groupEnd(){
  if (!enabled) return;
  console.groupEnd();
};
export function outputTape(parent, title=""){
  let titleHtml = "";
  title = title.toUpperCase();
  const divider = arial.underline(title, "=");
  if ( title !== "" ) {
    titleHtml = `${title}<br>${divider}`
  }
  let txt = "";
  let items = [];
  parent.forEach(child => {
    if ( !( child[1] instanceof Array ) ) {
      items.push(child);
    } else {
      if ( child[0] instanceof Array ) {
        txt += `<br>` ;
        txt += printArray(child);
      } else {
        txt += `<br><u>${child[0]}</u><br>`;
        txt += printArray(child[1]);
      }
    }
  });
  return `${titleHtml}${printArray(items)}${txt}`
};
function printArray(arr){
  let labels = [];
  let values = [];
  let txt = "";
  arr.forEach(el => {
    if ( el[1] !== "" ){
      labels.push(el[0]+":");
      values.push(el[1]);
    }
  });
  labels = arial.padArray(labels);
  for ( let i = 0; i < labels.length; i++ ){
    txt += labels[i] + values[i] + "<br>";
  }
  return txt;
}
