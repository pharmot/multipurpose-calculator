/**
* Phenytoin Module
* @module phenytoin
* @requires module:util
* @since v1.4.1
*/
import { checkValue, displayValue } from './util.js';
import * as LOG from './logger.js';
import { default as setupValidation } from './formValidation.js';
let validatedFields;
$( () => {
  validatedFields = setupValidation([
    { selector: '#dph-albumin', min: 0, max: 7 },
    { selector: '#dph-total',   min: 0, max: 100 },
  ]);
});

$('#btnReset').on('click', () => {
  $(validatedFields).removeClass('invalid');
  $('.checkbox-dph').prop('checked', false);
});

$('.input-dph').on('keyup', ev => {
  LOG.yellow(`[phenytoin] input received (#${ev.target.id})`);
  calculatePhenytoin();
});
$('.checkbox-dph').on('change', ev => {
  LOG.yellow(`[phenytoin] checkbox changed (#${ev.target.id})`);
  if ( ev.target.id === 'dph-icu' ) {
    $('#dph-neuro').prop('checked', false);
  } else if ( ev.target.id === 'dph-neuro' ) {
    $('#dph-icu').prop('checked', false);
  }
  calculatePhenytoin();
});

function calculatePhenytoin() {
  LOG.beginFunction('[phenytoin] calculatePhenytoin');
  const neuro = $('#dph-neuro').prop('checked');
  const icu = $('#dph-icu').prop('checked');
  const renal = $('#dph-esrd').prop('checked');
  const vpa = $('#dph-vpa').prop('checked');
  const dph = checkValue(+$('#dph-total').val(), 0, 100);
  const alb = checkValue(+$('#dph-albumin').val(), 0, 7);
  LOG.log({ neuro, icu, renal, vpa, alb, dph }, 'Inputs');

  let coeff = 0;
  let res = 0;
  let recFree = false;
  $('#dph-info').html('');
  if ( vpa ) {
    $('#dph-info').html('Valproic acid changes the protein binding of phenytoin. There is an equation that corrects phenytoin levels due to concurrent valproic acid but it does not adjust for low albumin. <b>A free phenytoin level should be obtained.</b>');
  } else if ( alb > 3.2 ) {
    $('#dph-info').html('Correction is not needed in patients with albumin &gt; 3.2');
  } else {
    if ( renal ) {
      coeff = 0.2;
      recFree = true;
    } else if ( neuro ) {
      coeff = 0.29;
      recFree = true;
    } else if ( icu ) {
      coeff = 0.25;
      recFree = true;
    } else {
      coeff = 0.25;
    }
    if ( alb > 0 && dph > 0 && coeff > 0 ) {
      res = dph / ( coeff * alb + 0.1 );
    } else {
      recFree = false;
    }
  }
  displayValue('#dph-result', res, 0.1, ' mcg/mL');
  if ( recFree ) {
    $('#dph-info').html('Free phenytoin level highly recommended');
  }
  LOG.endResult({ recFree, coeff, res });
}