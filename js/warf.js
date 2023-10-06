/**
* Warfarin Average Dose Adjustment
* @module warf
* @requires module:util
* @since v1.2.0
*/
import { checkValue, roundTo, displayValue, colorScale } from './util.js';
import * as LOG from "./logger.js";

$('#warf-aod').on('change', aodChanged);
$('#warf-changePercent').on('keyup', calculate);
$('#warf-changeDose').on('keyup', calculate);
$('#btnReset').on('click', () => {
  doses.forEach( d => d.reset() );
  aod = -1;
});

const colorStops = [
  {
    stop: 0,
    hex: '#000000',
  },
  {
    stop: 20,
    hex: '#5a8ac6',
  },
  {
    stop: 50,
    hex: '#f8696b',
  },
];

$(() => {
  new Dose(1);
  new Dose(2);
  new Dose(3);
  new Dose(4);
  new Dose(5);
  new Dose(6);
  new Dose(7);
});

/** @type {Dose[]} */
const doses = [];

let aod = -1;

function aodChanged() {

  const input = +checkValue($('#warf-aod').val(), -Infinity, Infinity, true);
  
  aod = isNaN(input) ? -1 : input;

  LOG.logArgs(`%cAOD dose changed to ${input} --> %cset to ${aod}`, 'color:purple', 'color:orange');

  doses.forEach(d => {
    if ( d.assumed ) d.val = aod;
  });
  calculate();
  
}

function calculate() {
  const changePercent = +checkValue($('#warf-changePercent').val(), -Infinity, Infinity, true);
  const changeDose = +checkValue($('#warf-changeDose').val(), 0, Infinity, true);

  LOG.logArgs(`%cCalculating totals for ${changePercent}% change and ${changeDose} mg dose`, 'color:brown;font-weight:bold');

  const res3 = getTotals(3, changePercent, changeDose);
  const res5 = getTotals(5, changePercent, changeDose);
  const res7 = getTotals(7, changePercent, changeDose);
  

  displayValue('#warf-avg3', res3.avg, 0.1, ' mg');
  displayValue('#warf-avg5', res5.avg, 0.1, ' mg');
  displayValue('#warf-avg7', res7.avg, 0.1, ' mg');
  displayValue('#warf-changePercent3', res3.pct, 0.1, ' mg', '', false, true);
  displayValue('#warf-changePercent5', res5.pct, 0.1, ' mg', '', false, true);
  displayValue('#warf-changePercent7', res7.pct, 0.1, ' mg', '', false, true);
  displayPercentChange('#warf-changeDose3', res3.dose);
  displayPercentChange('#warf-changeDose5', res5.dose);
  displayPercentChange('#warf-changeDose7', res7.dose);

  LOG.log( { changePercent, changeDose, res3, res5, res7 }, 'Calculation Results');

  
}
function displayPercentChange(selector, val) {
  LOG.log(`Displaying percent change for ${selector}: ${val}`);
  const rounded = Math.abs(roundTo(val, 1));
  if ( val > 0 ) {
    $(selector).html(`<strong>&uarr;</strong>&nbsp;&nbsp;${rounded}&nbsp;&#37;`);
  }
  if ( val < 0 ) {
    $(selector).html(`<strong>&darr;</strong>&nbsp;&nbsp;${rounded}&nbsp;&#37;`);
  }
  if ( val === 0 ) {
    $(selector).html('&mdash;');
  }
  $(selector).css("color", colorScale(rounded, colorStops) );

}

/**
 * Calculate the average dose over the last x days
 *
 * @param   {Integer} days - Number of days to average
 * @returns {Number}       - Average dose, rounded to the nearest 0.1
 */
function getTotals(days, changePercent, changeDose) {
  const res = {
    avg: '',
    pct: '',
    dose: '',
  };
  if ( days < 1 || days > 7 ) {
    LOG.warn(`${days} is not a valid number of days`);
    return res;
  }
  LOG.groupCollapsed(`Getting average dose over ${days} days`);

  const totalDose = doses.reduce(( sum, d ) => {
    if ( sum < 0 ) return -1;
    if ( d.day <= days ) {
      if ( d.val >= 0 ) {
        LOG.log(`Adding dose ${d.day} to total (${sum} += ${d.val})`);
        return sum += d.val;
      }
      LOG.logArgs(`%cDose ${d.day} not set, cannot calculate average`, 'color:red');
      return -1;
    }
    LOG.logArgs(`%cDose ${d.day} beyond requested days`, 'color:red');
    return sum;
  }, 0);
  LOG.groupEnd();
  if ( totalDose < 0 ) {
    LOG.logArgs('%c...could not be calculated', 'color:red');
    return res;
  }
  res.avg = roundTo(totalDose / days, 0.1);
  LOG.logArgs(`%cTotal dose (${totalDose}) / days (${days}) = ${res.avg} mg`, 'color:green');

  if ( !isNaN(changePercent) ) {
    res.pct = res.avg + res.avg * changePercent / 100;
  }
  if ( !isNaN(changeDose) ) {
    res.dose =  ( changeDose - res.avg ) / res.avg  * 100;
  }
  return res;

}

/** Class representing a warfarin dose. */
class Dose {
  /**
   * Create a Dose.
   * @param {Integer} num - dose number
   */
  constructor(num) {
    this.ident = `#warf-dose${num}`;
    this.day = num;
    this.idx = num - 1;
    this.val = -1;
    this._val = -1;
    this.assumed = true;
    doses[this.idx] = this;
    $(this.ident).on('change', () => this.changed() );
  }
  reset() {
    this.val = -1;
    this._val = -1;
  }
  changed() {
    const input = $(this.ident).val();
    this._val = +checkValue($(this.ident).val(), -Infinity, Infinity, true);
    if ( isNaN(this._val) ) {
      this.val = aod;
      this.assumed = true;
    } else {
      this.val = this._val;
      this.assumed = false;
    }
    LOG.logArgs(`%cDose ${this.day} changed to ${input}, value = ${this.val}%c${this.assumed ? ' (assumed)' : '' }`, 'color:blue', 'color:orange');
    calculate();
  }
}