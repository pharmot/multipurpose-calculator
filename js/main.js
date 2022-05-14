/*!
  * VMFH Pharmacy Multipurpose Calculator v1.0.0
  * Copyright 2020-2021 Andy Briggs (https://github.com/pharmot)
  * Licensed under MIT (https://github.com/pharmot/multipurpose-calculator/LICENSE)
  */

$ = require('jquery');
import 'bootstrap';
import "../scss/main.scss";
import { displayDate, displayValue, checkValue, roundTo, getDateTime, getHoursBetweenDates, checkTimeInput } from './util.js'
import { default as ivig } from './ivig.js';
import { childIsObese } from './growthCharts.js';
import { getSecondDose } from './seconddose.js';
import * as arial from './arial.js';
import { default as setupValidation } from './formValidation.js';
import * as vanco from './vanco.js';
import * as LOG from './logger.js'

let debug = true;
let debugDefaultTab = "auc";
let tape = {};
let validatedFields;
$(()=>{
  $('[data-toggle="popover"]').popover({html: true});
  $('[data-toggle="tooltip"]').tooltip()

  if ( /debug/.test(location.search) ) {
    debug = true;
  } else if ( /log/.test(location.search) ) {
    LOG.enable();
  }

  if ( debug ){
    $("#ptage").val(60);
    $("#sex").val('M');
    $("#height").val(170.2);
    $("#weight").val(123.1);
    $("#scr").val(0.9);
    $("#vancoAUCPeakTime").val(5);
    $("#vancoAUCTroughTime").val(11.5);

    $("#auc-curPeak").val(20);
    $("#auc-curTrough").val(11);
    $("#auc-curDose").val(1000);
    $("#auc-curFreq").val(12);

    $("#twolevelDate1").val("2021-01-16");
    $("#twolevelDate2").val("2021-01-16");
    $("#twolevelTime1").val("0000");
    $("#twolevelTime2").val("1500");
    $("#twolevelLevel1").val(20);
    $("#twolevelLevel2").val(12);

    $("#revision-curDose").val(1000);
    $("#revision-curFreq").val(12);
    $("#revision-curTrough").val(11);
    $("#revision-curTroughTime").val(0.5);
    LOG.enable();
    const triggerElement = document.querySelector(`#nav-${debugDefaultTab}-tab`);
    // const tab = new bootstrap.Tab(triggerElement)
    // tab.show();
    calculate.syncCurrentDFT("revision");
    calculate.patientData();
    calculate.vancoInitial();
    calculate.vancoRevision();
    calculate.vancoAUC();
  } else {
    resetDates();
  }

  validatedFields = setupValidation([
    { selector: "#ptage", inputType: 'age', min: pt.config.check.ageMin, max: pt.config.check.ageMax },
    { selector: "#sex", match: /^[MmFf]$/ },
    { selector: "#height", min: pt.config.check.htMin, max: pt.config.check.htMax, },
    { selector: "#weight", min: pt.config.check.wtMin, max: pt.config.check.wtMax },
    { selector: "#scr", min: pt.config.check.scrMin, max: pt.config.check.scrMax },
    { selector: ".validate-dose", min: vanco.config.check.doseMin, max: vanco.config.check.doseMax },
    { selector: ".validate-freq", min: vanco.config.check.freqMin, max: vanco.config.check.freqMax },
    { selector: ".validate-level", min: vanco.config.check.levelMin, max: vanco.config.check.levelMax },
    { selector: ".validate-time", inputType: 'time' }
  ]);
  $('#ptage').get(0).focus();
});

$(".input-patient").on('keyup', () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});
$('#ptage').on('keyup', () => {
  setTimeout(()=> {
    $("#top-container").removeClass('age-adult age-child age-infant');
    $("#top-container").addClass(`age-${pt.ageContext}`);
  }, 1000);
});

$("#vancoIndication").on('change', () => {
  calculate.patientData();
  calculate.vancoInitial();
});
$("#hd").on("change", (e) => {
  const hd = e.target.selectedIndex;
  $("#top-container").removeClass('hd-0 hd-1 hd-2 hd-3 hd-4');
  $("#top-container").addClass(`hd-${hd}`);

  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
})

$(".input-initialPK").on('keyup', () => {
  calculate.vancoInitial();
});

$(".input-auc").on('keyup', () => {
  calculate.syncCurrentDFT("auc");
  calculate.vancoAUC();
  calculate.vancoRevision();
});

$(".input-auc-interval").on('keyup', () => {
  calculate.vancoAUC(false);
});

$("#auc-reset").on('click', () => {
  calculate.vancoAUC();
});

$('#btnShowInitialPk').on('click', () => {
  $('#row--initialPkAlert').hide(50, "linear");
  $('#row--initialPkCalc').addClass('show');
});

$(".input-revision").on('keyup', () => {
  calculate.syncCurrentDFT("revision");
  calculate.vancoRevision();
  calculate.vancoAUC();
});

$(".input-aucDates").on('keyup', () => calculate.vancoAUCDates() );
$(".input-twolevel").on('keyup', () => calculate.vancoTwolevel() );
$(".input-twolevel-interval").on('keyup', () => calculate.vancoTwolevel(false) );
$("#twolevel-reset").on('click', () => calculate.vancoTwolevel() );

$("#revision-goalTrough").on("change", () => calculate.vancoRevision() );

$("#schwartz-k-infant").on('change', () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});

$(".input-steadystate").on('keyup', () => calculate.vancoSteadyStateCheck() );
$("#seconddose-time1").on("keyup", () => calculate.secondDose() );
$("[name='seconddose-freq']").on("change", () => calculate.secondDose() );

$("#btnReset").on('click', () => {
  $("input").val("");
  calculate.syncCurrentDFT('revision');
  resetDates();
  $("#aucDates-apply").removeClass('datesApplied');
  ($("#hd")[0]).selectedIndex = 0;
  ($("#vancoIndication")[0]).selectedIndex = 0;
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
  calculate.vancoTwolevel();
  calculate.secondDose();
  calculate.ivig();
  $("#top-container").removeClass('age-adult age-child age-infant');
  $("#top-container").addClass('age-adult');
  $(validatedFields).removeClass('invalid');
  $('#ptage').get(0).focus();

});

$("#ivig-product").on("change", () => calculate.ivig() );
$("#weight").on("keyup", () => calculate.ivig() );
$("#ivig-dose").on("keyup", () => calculate.ivig() );

$("#aucDates-sameInterval").on("change", e => {
  const tr = document.getElementById('aucDates-row--trough');
  const pk = document.getElementById('aucDates-row--peak');
  const spacer = document.getElementById('aucDates-row--spacer');
  const last = document.getElementById('aucDates-row--last');
  const par = tr.parentNode;
  if ( e.target.checked ){
    $("#aucDates-label--dose1").html("Dose prior to levels");
    par.insertBefore(pk, tr);
    par.insertBefore(tr, spacer);
    $("#aucDates-row--dose2").hide();
  } else {
    $("#aucDates-label--dose1").html("Dose before trough");
    $("#aucDates-row--dose2").show();
    par.insertBefore(tr, pk);
    par.insertBefore(pk, spacer);
  }
  calculate.vancoAUCDates();
});

$("#aucDates-apply").on('click', e => {
  $(e.target).addClass('datesApplied');
  console.log(e);
  $('#vancoAUCPeakTime').val($('#aucDates-peakResult').html());
  $('#vancoAUCTroughTime').val($('#aucDates-troughResult').html());
  $('#aucDatesModal').modal('hide');
  calculate.vancoAUC();
});

/**
 * Resets date input fields to today's date.
 */
function resetDates(){
  const today = new Date();
  $(".dt-date").val(`${today.getFullYear()}-${('0' + (today.getMonth()+1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}`);
}

// TODO: doc: pt requires module:util
/**
 * Object representing the patient.
 *
 * @namespace
 * @property {string|number} _sex  patient's sex, or 0 if invalid input
 * @property {number}        _age  petiant's age in years, or 0 if invalid input
 * @property {number}        _wt   patient's weight in kg, or 0 if invalid input
 * @property {number}        _ht   petiant's height in cm, or 0 if invalid input
 * @property {number}        _scr  patient's serum creatinine, or 0 if invalid input
 */
let pt = {
  /**
   * Contains the min and max values for input validation
   * @const
   * @readonly
   */
  config: {
    check: {
      wtMin: 1,
      wtMax: 300,
      htMin: 60,
      htMax: 250,
      ageMin: 0.25, // minimum 3 months old
      ageMax: 120,
      scrMin: 0.1,
      scrMax: 20
    }
  },
  /**
   * Gets/sets the sex of the patient.  Accepts a single letter - m or f - and
   * stores as uppercase.  If invalid, stores 0.
   * @function
   * @param {any} [x] Patient's sex
   * @returns {string|number} Patient's sex as `M`, `F`, or 0 if invalid
   */
  set sex(x){
    this._sex = /^[MmFf]$/.test(x) ? x.toUpperCase() : 0;
  },
  get sex(){ return this._sex || 0; },
  /**
   * Gets/sets the weight of the patient.
   * @requires module:util
   * @param {number} [x] Patient's weight
   * @function
   * @returns {number} Patient's weight in kg, or 0 if invalid
   */
  set wt(x){ this._wt = checkValue(x, this.config.check.wtMin, this.config.check.wtMax); },
  get wt(){ return this._wt || 0; },
  /**
   * Gets/sets the height of the patient.
   * @function
   * @requires module:util
   * @param {number} [x] Patient's height
   * @returns {number} Patient's height in cm, or 0 if invalid
   */
  set ht(x){ this._ht = checkValue(x, this.config.check.htMin, this.config.check.htMax); },
  get ht(){ return this._ht || 0; },
  /**
   * Gets/sets the age of the patient.
   * Accepts in years, months, days, or months/days.
   * @example
   * pt.age("50");    // sets patient's age to 50 years
   * pt.age("23m");   // sets patient's age to 23 months (getter returns in years)
   * pt.age("16m3d"); // sets patient's age to 16 months, 3 days (getter returns in years)
   * pt.age("300d");  // sets patient's age to 300 days (getter returns in years)
   * @function
   * @requires module:util
   * @param {string|number} [x] Patient's age in days, months, or years
   * @returns {number} Patient's height in cm, or 0 if invalid
   */
  set age(x){
    if ( /^\d+ *[Dd]$/.test(x) ) {
      const days = +x.replace(/ *d */gi, '');
      this._age = days/365.25;
    } else if ( /^\d+ *[Mm]$/.test(x) ) {
      const months = +x.replace(/ *m */gi, '');
      this._age = months/12;
    } else if ( /^\d+ *[Mm]\d+ *[Dd]$/.test(x) ) {
      let arrAge = x.split('m');
      arrAge[1] = arrAge[1].replace('d', '');
      this._age = arrAge[0]/12 + arrAge[1]/365.25;
    } else {
      this._age = checkValue(x, this.config.check.ageMin, this.config.check.ageMax);
    }
  },
  get age(){ return this._age || 0; },
  /**
   * Gets the age context of the patient
   *
   * Possible values:
   * - `adult` (default)
   * - `child`
   * - `infant`
   * @function
   * @returns {string} Patient's age context (adult, child, or infant)
   */
  get ageContext(){
    if ( this.age < 1 && this.age > 0 ) return 'infant';
    if ( this.age < 18 && this.age !== 0 ) return 'child';
    return 'adult';
  },
  /**
   * Gets/sets the patient's serum creatinine.
   * @function
   * @requires module:util
   * @param {number} [x] Patient's SCr
   * @returns {number} Patient's SCr in mg/dL, or 0 if invalid
   */
  set scr(x){
    this._scr = checkValue(x, this.config.check.scrMin, this.config.check.scrMax);
  },
  get scr(){ return this._scr || 0; },
  /**
   * Gets the patient's body mass index
   * @see [equations.md](/docs/equations.md/#body-mass-index)
   * @function
   * @returns {number} Patient's BMI in kg/m^2, or 0 if insufficient input
   */
  get bmi() {
    if ( this.wt > 0 && this.ht > 0 ) {
      return this.wt / (( this.ht / 100 )**2);
    }
    return 0;
  },
  /**
   * Gets the patient's ideal body weight.  Returns 0 if age < 18.
   * @see [equations.md](/docs/equations.md/#ideal-body-weight)
   * @function
   * @returns {number} Patient's ideal body weight BMI in kg/m^2, or 0 if insufficient input
   */
  get ibw(){
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      return ( this.sex === "M" ? 50 : 45.5 ) + 2.3 * ( this.ht / 2.54 - 60 );
    }
    return 0;
  },
  /**
   * Gets the patient's adjusted body weight, using a factor of 0.4.  Returns 0 if age < 18.
   * @see [equations.md](/docs/equations.md/#adjusted-body-weight)
   * @function
   * @returns {number} Patient's ideal body weight BMI in kg/m^2, or 0 if insufficient input
   */
  get adjBW(){
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      if ( this.wt <= this.ibw ) return this.wt;
      return 0.4 * (this.wt - this.ibw) + this.ibw;
    }
    return 0;
  },
  /**
   * Gets the percent the patient is over or under ideal body weight.  Returns 0 if age < 18.
   * @see [equations.md](/docs/equations.md#percent-over-or-under-ibw)
   * @example
   * If patient is 30% above their IBW, returns `30`
   * @function
   * @returns {number} Percent over or under ideal body weight, or 0 if insufficient input
   */
  get overUnder(){
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex && this.adjBW > 0 ) {
      return (this.wt / this.ibw - 1) * 100
    }
    return 0;
  },
  /**
   * Gets the patient's lean body weight.  Returns 0 if age < 18.
   * @see [equations.md](/docs/equations.md#lean-body-weight)
   * @function
   * @returns {number} Patient's lean body weight in kg, or 0 if insufficient input
   */
  get lbw(){
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      if ( this.sex === "F" ) {
        return 9270 * this.wt / ( 8780 + 244 * this.bmi )
      }
      return 9270 * this.wt / ( 6680 + 216 * this.bmi )
    }
    return 0;
  },
  /**
   * Gets the patient's Cockroft-Gault creatinine clearance using actual body weight.
   * @see [equations.md](/docs/equations.md#cockroft-gault)
   * @function
   * @returns {number} Patient's CrCl (C-G ABW) in mL/min, or 0 if insufficient input
   */
  get cgActual(){
    if ( this.wt > 0 && this.age > 0 && this.scr > 0 && this._sex ) {
      return this.cg(this.wt);
    }
    return 0;
  },
  /**
   * Gets the patient's Cockroft-Gault creatinine clearance using adjusted body weight.
   * @see [equations.md](/docs/equations.md#cockroft-gault)
   * @function
   * @returns {number} Patient's CrCl (C-G AdjBW) in mL/min, or 0 if insufficient input
   */
  get cgAdjusted(){
    if ( this.adjBW > 0 && this.age > 0 && this.scr > 0 ) {
      return this.cg(this.adjBW);
    }
    return 0;
  },
  /**
   * Gets the patient's Cockroft-Gault creatinine clearance using ideal body weight.
   * @see [equations.md](/docs/equations.md#cockroft-gault)
   * @function
   * @returns {number} Patient's CrCl (C-G IBW) in mL/min, or 0 if insufficient input
   */
  get cgIdeal(){
    if ( this.ibw > 0 && this.age > 0 && this.scr > 0 ) {
      return this.cg(this.ibw);
    }
    return 0;
  },
  /**
   * Gets the patient's Protocol CrCl (equation and weight depend on age and percent over/under IBW.
   * @see [equations.md](/docs/equations.md#protocol-crcl)
   * @function
   * @returns {number} Patient's Protocol CrCl in mL/min, or 0 if insufficient input
   */
  get crcl(){
    if ( this.age < 18 ) return this.schwartz;
    if ( this.ibw === 0 || this.age === 0 || this.scr === 0 ) return 0;
    if ( this.wt < this.ibw ) return this.cgActual;
    if ( this.overUnder > 30 ) return this.cgAdjusted;
    return this.cgIdeal;
  },
  /**
   * Calculates the patient's Cockroft-Gault creatinine clearance
   * @function
   * @param {number} weight   weight in kg to use for calculation
   * @returns {number} Calculated CrCl in mL/min, or 0 if insufficient input
   */
  cg(weight){
    return (140 - this.age) * weight / (this.scr * 72) * (pt.sex === "F" ? 0.85 : 1);
  },
  /**
   * Gets/sets the k value for the Schwartz CrCl equation.
   * @function
   * @see [equations.md](/docs/equations.md#schwartz)
   * @param {number}  [x] selectedIndex of k value input element where 0 is "term infant" and 1 is "LBW infant"
   * @returns {number} k value, or 0 if age > 18 or insufficient input
   */
  set schwartzK(term){
    if ( this.age === 0 || this.age >= 18 || ( this.age >= 13 && this.sex === 0 ) ) {
      this._schwartzK = 0;
    } else if ( this.age <= 1 ) {
      this._schwartzK = term === 0 ? 0.45 : 0.33;
    } else if ( this.age >= 13 && this.sex === "M" ) {
      this._schwartzK = 0.7;
    } else {
      this._schwartzK = 0.55
    }
    return this._schwartzK;
  },
  get schwartzK(){
    return this._schwartzK || 0;
  },
  /**
   * Gets the patient's Schwartz CrCl
   * @see [equations.md](/docs/equations.md#schwartz)
   * @function
   * @returns {number} Patient's CrCl in mL/min using the Schwartz equation, or 0 if insufficient input
   */
  get schwartz(){
    const k = this.schwartzK;
    if ( k === 0 || this.ht === 0 || this.scr === 0 ) return 0;
    return ( k * this.ht ) / this.scr;
  }
};
/**
 * Functions called by event listeners to calculate and display results
 * @namespace
 */
const calculate = {
  /**
   * Input and output for patient parameters including CrCl, weights, etc.
   * @requires module:util
   * @returns  {undefined}
   */
  patientData(){
    // Remove highlighting on CrCls
    $(".outCrCl").removeClass("use-this");

    // Set pt properties from inputs
    pt.age = +$("#ptage").val();
    pt.sex = $("#sex").val();
    pt.ht = +$("#height").val();
    pt.wt = +$("#weight").val();
    pt.scr = +$("#scr").val();
    pt.schwartzK = $("#schwartz-k-infant")[0].selectedIndex;

    displayValue("#schwartz-crcl", pt.schwartz, 0.1, " mL/min");
    // Display weights and CrCl
    displayValue("#ibw", pt.ibw, 0.1, " kg");
    displayValue("#overUnder", pt.overUnder, 0.1, "%", '', true);
    displayValue("#adjBW", pt.adjBW, 0.1, " kg");
    displayValue("#lbw", pt.lbw, 0.1, " kg");
    displayValue("#bmi", pt.bmi, 0.1, " kg/m²");
    // Use Bayesian calculator instead of weight-based dosing if BMI > 30
    if ( pt.bmi > 30 ) {
      $("#alert--bayesian").removeClass("alert-secondary").addClass("alert-warning");
      $("#bmi").addClass("text-danger font-weight-bold");
      $("#row--vanco-md-default").hide();
      $("#row--vanco-md-bayesian").show();
    } else {
      $("#alert--bayesian").removeClass("alert-warning").addClass("alert-secondary");
      $("#bmi").removeClass("text-danger font-weight-bold");
      $("#row--vanco-md-default").show();
      $("#row--vanco-md-bayesian").hide();
    }
    displayValue("#cgIdeal", pt.cgIdeal, 0.1, " mL/min");
    displayValue("#cgActual", pt.cgActual, 0.1, " mL/min");
    displayValue("#cgAdjusted", pt.cgAdjusted, 0.1, " mL/min");
    // Highlight CrCl to use per protocol
    if ( pt.cgAdjusted > 0 ) {
      if ( pt.wt < pt.ibw ) {
        $("#cgActual").addClass("use-this");
      } else if ( pt.overUnder > 30 ) {
        $("#cgAdjusted").addClass("use-this");
      } else {
        $("#cgIdeal").addClass("use-this");
      }
    }

    let cboHD = $("#hd")[0];
    let cboIndication = $("#vancoIndication")[0];
    pt.hd = cboHD.selectedIndex;
    pt.vancoIndication = cboIndication.selectedIndex;
    tape.pt = [[
      ["Age", displayValue('', pt.age, 0.01, " years")],
      ["Sex", pt.sex === 0 ? "" : pt.sex],
      ["Weight", displayValue('', pt.wt, 0.0001, " kg")],
      ["Height", displayValue('', pt.ht, 0.0001, " cm")],
      ["SCr", displayValue('', pt.scr, 0.0001, " mg/dL")],
      ["Dialysis", cboHD.options[pt.hd].innerHTML]
    ]];
    if ( pt.ageContext === "adult" ){
      tape.pt.push([
        ["Ideal body weight", displayValue('', pt.ibw, 0.1, ' kg')],
        ["Over/Under IBW", displayValue('', pt.overUnder, 0.1, "%", '', true)],
        ["Adjusted body weight", displayValue('', pt.adjBW, 0.1, " kg")],
        ["Lean body weight", displayValue('', pt.lbw, 0.1, " kg")],
        ["Body mass index", displayValue('', pt.bmi, 0.1, " kg/m²")]
      ]);
      tape.pt.push([
        ["CrCl (C-G Actual)", displayValue('', pt.cgActual, 0.1, " mL/min")],
        ["CrCl (C-G Ideal)", displayValue('', pt.cgIdeal, 0.1, " mL/min")],
        ["CrCl (C-G Adjusted)", displayValue('', pt.cgAdjusted, 0.1, " mL/min")],
        ["CrCl (Protocol)", displayValue('', pt.crcl, 0.1, " mL/min")]
      ]);
    } else {
      tape.pt.push([
        ["Body mass index", displayValue('', pt.bmi, 0.1, " kg/m^2")],
        ["CrCl (Schwartz)", displayValue('', pt.schwartz, 0.1, " mL/min")]
      ]);
    }
    $("#tape--pt").html(LOG.outputTape(tape.pt, "Patient Info"));
  },
  /**
   * Sync dose, frequency, and trough inputs between tabs
   * @requires module:util
   * @param    {String}     src  id prefix of element to use as the source
   * @returns  {undefined}
   */
  syncCurrentDFT(src){
    pt.curDose = checkValue(+$(`#${src}-curDose`).val(), vanco.config.check.doseMin, vanco.config.check.doseMax);
    pt.curFreq = checkValue(+$(`#${src}-curFreq`).val(), vanco.config.check.freqMin, vanco.config.check.freqMax);
    pt.curTrough = checkValue(+$(`#${src}-curTrough`).val(), vanco.config.check.levelMin, vanco.config.check.levelMax);
    $(".current-dose").filter($(`:not(.input-${src})`)).val(pt.curDose > 0 ? pt.curDose : "");
    $(".current-freq").filter($(`:not(.input-${src})`)).val(pt.curFreq > 0 ? pt.curFreq : "");
    $(".current-trough").filter($(`:not(.input-${src})`)).val(pt.curTrough > 0 ? pt.curTrough : "");
  },
  /**
   * Input and output for initial protocol dosing and initial PK dosing
   * @requires module:util
   * @requires module:vanco
   * @returns  {undefined}
   */
  vancoInitial(){
    $("#vancoInitialLoad").html(vanco.loadingDose({
      ht: pt.ht,
      wt: pt.wt,
      age: pt.age,
      sex: pt.sex,
      bmi: pt.bmi,
      hd: pt.hd,
      vancoIndication: pt.vancoIndication
    }));
    const { doseMin, doseMax, freqMin, freqMax } = vanco.config.check;
    const { maintText, freq } = vanco.getMaintenanceDose({
      age: pt.age,
      wt: pt.wt,
      ibw: pt.ibw,
      scr: pt.scr,
      hd: pt.hd,
      indication: pt.vancoIndication,
      crcl: pt.crcl
    });
    $("#vancoInitialMaintenance").html(maintText);
    const { monitoring, targetLevelText, pkParam, targetMin, targetMax, goalTroughIndex } = vanco.getMonitoringRecommendation({
      freq: freq,
      hd: pt.hd,
      crcl: pt.crcl,
      scr: pt.scr,
      bmi: pt.bmi,
      indication: pt.vancoIndication,
      age: pt.age
    });

    $("#vancoInitialMonitoring").html(monitoring);
    $("#vancoInitialTargetLevel").html(targetLevelText);

    // Set goal trough selection on the single level tab
    if( goalTroughIndex >= 0 ) {
      $("#revision-goalTrough")[0].selectedIndex = goalTroughIndex;
    }

    const selectedDose = checkValue(+$("#vancoInitialPK-dose").val(), doseMin, doseMax);
    const selectedFrequency = checkValue(+$("#vancoInitialPK-interval").val(), freqMin, freqMax);

    let {
      arrDose, arrViable, arrLevel, vd, ke, pkLevel, pkRecLevel, pkRecDose,
      pkFreq, pkRecFreq, pkHalflife, pkLevelRowHeading, pkLevelUnits, pkLevelLabel
    } = vanco.getInitialDosing({
      method: pkParam,
      crcl: pt.crcl,
      age: pt.age,
      scr: pt.scr,
      sex: pt.sex,
      wt: pt.wt,
      bmi: pt.bmi,
      goalMin: targetMin,
      goalMax: targetMax,
      selDose: selectedDose,
      selFreq: selectedFrequency
    });

    displayValue("#vancoInitialPK-halflife", pkHalflife, 0.1, " hrs");
    displayValue("#vancoInitialPK-recDose", pkRecDose, 1, " mg");
    displayValue("#vancoInitialPK-recFreq", pkRecFreq, 0.1, " hrs");
    $("#vancoInitialPK-recLevel-label").html(pkLevelLabel);
    $("#vancoInitialPK-level-label").html(pkLevelLabel);
    displayValue("#vancoInitialPK-recLevel", pkRecLevel, 0.1, pkLevelUnits);
    displayValue("#vancoInitialPK-level", pkLevel, 0.1, pkLevelUnits);
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Dose", data: arrDose, roundTo: 1, units: " mg"},
      { title: "Frequency", data: pkFreq, units: " hrs"},
      { title: pkLevelRowHeading, data: arrLevel, roundTo: 0.1 }],
      highlightColumns: arrViable
    });
    $("#vancoInitialPK-table").html(tableHtml);

    let tableText = [[pkLevelLabel, []]];
    for ( let i = 0; i < arrDose.length; i++ ){
      tableText[0][1].push(
        [
          `${arrDose[i]} mg q${pkFreq}h`,
          arial.padArray(["9999.99", displayValue('', arrLevel[i], 0.1, pkLevelUnits)], 0)[1]
        ]
      )
    }
  },
  /**
   * Input and output for linear and kinetic single-level dose adjustments
   * @requires module:vanco
   * @requires module:util
   * @returns {undefined}
   */
  vancoRevision(){
    const cboGoal = $("#revision-goalTrough")[0];
    const { goalmin, goalmax, goaltrough } = cboGoal.options[cboGoal.selectedIndex].dataset;
    const { doseMin, doseMax, freqMin, freqMax } = vanco.config.check;
    const selectedLinearDose = checkValue(+$("#revision-linearTestDose").val(), doseMin, doseMax);
    const selectedLinearInterval = checkValue(+$("#revision-linearTestFreq").val(), freqMin, freqMax);
    const selectedDose = checkValue(+$("#revision-pkTestDose").val(), doseMin, doseMax);
    const selectedInterval = checkValue(+$("#revision-pkTestFreq").val(), freqMin, freqMax);
    const troughTime = checkValue($("#revision-curTroughTime").val(), 0, freqMax, true);
    const { linearDose, linearFreq, linearTrough, testLinearDose, testLinearFreq, testLinearTrough } = vanco.getLinearAdjustment({
      curDose: pt.curDose,
      curFreq: pt.curFreq,
      curTrough: pt.curTrough,
      testDose: selectedLinearDose,
      testFreq: selectedLinearInterval,
      goalTrough: goaltrough
    });

    $("#revision-linearDose").html( linearDose === 0 ? "" : `${roundTo(linearDose, 1)} mg q ${linearFreq} h`);
    displayChange("#revision-linearDoseChange", linearDose, linearFreq);
    displayValue("#revision-linearTrough", linearTrough, 0.1, " mcg/mL");

    displayChange("#revision-testLinearDoseChange", testLinearDose, testLinearFreq);
    displayValue("#revision-testLinearTrough", testLinearTrough, 0.1, " mcg/mL");

    const { halflife, newDose, newFreq, newTrough, newViable, recDose, recTrough, recFreq, selTrough, selDose, selFreq } = vanco.getSingleLevelAdjustment({
      bmi: pt.bmi,
      wt: pt.wt,
      curDose: pt.curDose,
      curFreq: pt.curFreq,
      curTrough: pt.curTrough,
      troughTime: troughTime,
      goalTrough: goaltrough,
      goalMin: goalmin,
      goalMax: goalmax,
      goalPeak: 35,
      selFreq: selectedInterval,
      selDose: selectedDose
    });
    pt.adjHalflife = halflife;
    displayValue("#revision-halflife", halflife, 0.1, " hours");

    $("#revision-pkDose").html( recDose === 0 ? "" : `${roundTo(recDose, 1)} mg q ${roundTo(recFreq, 0.1)} h`);
    displayChange("#revision-pkDoseChange", recDose, recFreq);
    displayValue("#revision-pkTrough", recTrough, 0.1, " mcg/mL");

    displayChange("#revision-pkTestDoseChange", selDose, selFreq)
    displayValue("#revision-pkTestTrough", selTrough, 0.1, " mcg/mL");

    this.vancoSteadyStateCheck();

    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, roundTo: 1, units: " mg"},
      { title: "Interval", data: newFreq, units: " hrs"},
      { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable
    });
    $("#revision-pkTable").html(tableHtml);

    $("#vancoHdAdj").html(vanco.hdRevision({wt: pt.wt, trough: pt.curTrough}));
  },
  /**
   * Input and output for Steady State Check on single-level tab
   * @requires module:vanco
   * @returns {undefined}
   */
  vancoSteadyStateCheck(){
    const firstDT = getDateTime($("#steadystate-dateFirst").val(), $("#steadystate-timeFirst").val());
    const troughDT = getDateTime($("#steadystate-dateTrough").val(), $("#steadystate-timeTrough").val());
    if ( firstDT !== 0 && troughDT !== 0 && pt.adjHalflife > 0 ) {
      const timeDiff = getHoursBetweenDates(firstDT, troughDT);
      const halflives = roundTo(timeDiff / pt.adjHalflife, 0.1);
      $("#steadystate-timeDiff").html(`${roundTo(timeDiff, 0.1)} hrs&nbsp;&nbsp;&nbsp;(${halflives} ${halflives === 1 ? 'half-life' : 'half-lives'})`);
      $("#steadystate-atSS").html(`${halflives < 4 ? "Not at" : "At"} steady state.`);
    } else {
      $("#steadystate-atSS").html("");
      $("#steadystate-timeDiff").html("");
    }
  },
  /**
   * Input and output for AUC date/time calculation modal
   * @requires module:vanco
   * @returns {undefined}
   */
  vancoAUCDates(){
    const sameInterval = $('#aucDates-sameInterval').is(':checked');
    const dose1 = getDateTime($('#aucDates-doseDate-1').val(), $('#aucDates-doseTime-1').val());
    const dose2 = sameInterval ? dose1 : getDateTime($('#aucDates-doseDate-2').val(), $('#aucDates-doseTime-2').val());
    const trough = getDateTime($('#aucDates-troughDate').val(), $('#aucDates-troughTime').val());
    const peak = getDateTime($('#aucDates-peakDate').val(), $('#aucDates-peakTime').val());

    const troughHrs = roundTo(checkValue(getHoursBetweenDates(dose1, trough), 0, 48), 0.1);
    const peakHrs = roundTo(checkValue(getHoursBetweenDates(dose2, peak), 0, 48), 0.1);

    displayValue("#aucDates-troughResult", troughHrs, 0.1);
    displayValue("#aucDates-peakResult", peakHrs, 0.1);
  },
  /**
   * Input and output for AUC calculation
   * @requires module:vanco
   * @param   {Boolean} [resetInterval=true]  whether recommended interval should override user input
   * @returns {undefined}
   */
  vancoAUC(resetInterval = true){
    let params = {
      dose: pt.curDose,
      interval: pt.curFreq,
      peak: checkValue(+$("#auc-curPeak").val(), vanco.config.check.levelMin, vanco.config.check.levelMax),
      peakTime: checkValue(+$("#vancoAUCPeakTime").val(), vanco.config.check.timeMin, vanco.config.check.timeMax),
      troughTime: checkValue(+$("#vancoAUCTroughTime").val(), vanco.config.check.timeMin, vanco.config.check.timeMax),
      trough: pt.curTrough
    };
    const aucCurrent = vanco.calculateAUC(params);
    const auc24 = aucCurrent === undefined ? 0 : aucCurrent.auc24;
    const oldInterval = aucCurrent === undefined ? 0 : aucCurrent.oldInterval;
    const goalTroughLow = aucCurrent === undefined ? 0 : aucCurrent.goalTroughLow;
    const goalTroughHigh = aucCurrent === undefined ? 0 : aucCurrent.goalTroughHigh;
    displayValue("#vancoAUC24", auc24 || 0, 0.1);
    const goalTrough = aucCurrent === undefined ? "" : `${roundTo(goalTroughLow, 0.1)} &ndash; ${roundTo(goalTroughHigh, 0.1)} mcg/mL`;
    $("#vancoAUCTroughGoal").html(goalTrough);
    if( $("#vancoAUC24").html() !== "" ) {
      $("#vancoAUC24").append(` (${aucCurrent.therapeutic})`);
    }
    if( resetInterval && $("#vancoCurrentInterval") !== "" && aucCurrent !== undefined ) {
      $("#vancoAUCNewInterval").val(aucCurrent.oldInterval);
    }
    // done with first step here, have outputted new interval, auc24
    const newInterval = checkValue(+$("#vancoAUCNewInterval").val(), vanco.config.check.freqMin, vanco.config.check.freqMax);
    const aucNew = vanco.calculateAUCNew(aucCurrent, newInterval);

    // create AUC table
    const tableHtml = this.createVancoTable({
      rows: [
        { title: "Maint. dose", data: aucNew.dose, units: " mg" },
        { title: "Predicted AUC", data: aucNew.auc, roundTo: 0.1 },
        { title: "Est. Trough (mcg/mL)", data: aucNew.trough, roundTo: 0.1}
      ],
      highlightColumns: aucNew.therapeutic
    });
    $("#aucTable").html(tableHtml);
    let tableText = [["Predicted AUC (est. trough) for New Dose", []]];
    for ( let i = 0; i < aucNew.dose.length; i++ ){
      tableText[0][1].push(
        [
          `${aucNew.dose[i]} mg q${newInterval}h`,
          `${arial.padArray(["9999.99", roundTo(aucNew.auc[i], 0.1)], 0)[1]} (${roundTo(aucNew.trough[i],0.1)} mcg/mL)`
        ]
      )
    }

    if ( aucCurrent !== undefined ) {
      // was the date-time calculator modal used?
      const usedDateTimeCalculator = $("#aucDates-apply").hasClass('datesApplied')
      tape.auc = [
        [
          ["Current dose", `${params.dose} mg q${params.interval}h`],
          ["Peak level", displayValue('', params.peak, 0.1, " mcg/mL")],
          ["Trough level", displayValue('', params.trough, 0.1, " mcg/mL")],
          ["Time to peak", displayValue('', params.peakTime, 0.01, " hrs")],
          ["Time to trough", displayValue('', params.troughTime, 0.01, " hrs")],
        ],
        [
          ["Vd", displayValue('', aucCurrent.vd, 0.01, " L")],
          ["Infusion time", displayValue('', 60 * aucCurrent.tInf, 1, ' min')],
          ["ke", displayValue('', aucCurrent.ke, 0.0001, ` hr^-1`)],
          ["True peak", displayValue('', aucCurrent.truePeak, 0.1, ' mcg/mL')],
          ["True trough", displayValue('', aucCurrent.trueTrough, 0.1, ' mcg/mL')],
          ["AUC (inf)", displayValue('', aucCurrent.aucInf, 0.1)],
          ["AUC (elim)", displayValue('', aucCurrent.aucElim, 0.1)],
        ],
        [
          ["AUC24", `${displayValue('', aucCurrent.auc24, 0.1)} (${aucCurrent.therapeutic})`],
          [
            `Trough goal`,
            `${roundTo(aucCurrent.goalTroughLow, 0.1)} &ndash; ${roundTo(aucCurrent.goalTroughHigh, 0.1)} mcg/mL`],
          ],
        ]
        if ( usedDateTimeCalculator ) {
          const sameInterval = $('#aucDates-sameInterval').is(':checked');
          tape.auc.unshift([
            [
              "Drawn in same interval?",
              sameInterval ? "Yes" : "No"
            ],
            [
              "Dose before trough",
              displayDate( getDateTime( $('#aucDates-doseDate-1').val(), $('#aucDates-doseTime-1').val() ) )
            ],
            [
              "Trough time",
              displayDate( getDateTime($('#aucDates-troughDate').val(), $('#aucDates-troughTime').val() ) )
            ],
            [
              "Dose before peak",
              displayDate( sameInterval ? dateTimeInputs.troughDose : getDateTime($('#aucDates-doseDate-2').val(), $('#aucDates-doseTime-2').val() ) )
            ],
            [
              "Peak time",
              displayDate( getDateTime($('#aucDates-peakDate').val(), $('#aucDates-peakTime').val() ) )
            ]
          ]);
        }

        $("#tape--auc").html(LOG.outputTape(tape.auc, "AUC Dosing Calculation"));
        $("#tape--auc").append(LOG.outputTape(tableText));
      } else {
        tape.auc = [];
        $("#tape--auc").html('');
      }
    },
  /**
   * Input and output for Two-Level kinetic calculation
   * @requires module:util
   * @requires module:vanco
   * @param   {Boolean} [resetInterval=true]  whether recommended interval should override user input
   * @returns {undefined}
   */
  vancoTwolevel(resetInterval = true){
    const { levelMin, levelMax, freqMin, freqMax, doseMin, doseMax } = vanco.config.check;
    const time1 = getDateTime($("#twolevelDate1").val(), $("#twolevelTime1").val());
    const time2 = getDateTime($("#twolevelDate2").val(), $("#twolevelTime2").val());
    const level1 = checkValue(+$("#twolevelLevel1").val(), levelMin, levelMax);
    const level2 = checkValue(+$("#twolevelLevel2").val(), levelMin, levelMax);
    let ke = -1;
    if ( time1 !== 0 && time2 !== 0 && level1 > 0 && level2 > 0 ) {
      const timeDiff = getHoursBetweenDates(time1, time2);
      ke = Math.log(level1 / level2) / timeDiff;
    }
    const selectedInterval = resetInterval ? 0 : checkValue(+$("#twolevelInterval").val(), freqMin, freqMax);
    const { pkDose, pkFreq, pkTrough, halflife, newPeak, newTrough, newViable, newDose } = vanco.calculateTwoLevelPK({
      wt: pt.wt,
      bmi: pt.bmi,
      ke: ke,
      selectedInterval: selectedInterval
    });
    displayValue("#twolevelHalflife", halflife, 0.1, " hours");
    displayValue("#twolevelNewDose", pkDose, 1, " mg");
    if ( resetInterval ) {
      $("#twolevelInterval").val(pkFreq === 0 ? "" : pkFreq);
    }
    displayValue("#twolevelNewTrough", pkTrough, 0.1, " mcg/mL");
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, units: " mg"},
      { title: "Interval", data: pkFreq, units: " hrs"},
      { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable
    });
    $("#twolevelTable").html(tableHtml);
  },
  /**
   * Generate HTML for a table of dosing options.  Data can be provided as an
   * array to display different values in each column, or as a number to repeat
   * the same number in each column.
   * @requires module:util
   * @requires module:vanco
   * @param   {Object}             obj                   Input parameters
   * @param   {Object[]}           obj.rows              Table row parameters
   * @param   {String}            [obj.rows.title]       Row header
   * @param   {String}            [obj.rows.units]       Units for values
   * @param   {Number}            [obj.rows.roundTo]     Rounding factor if values are to be rounded
   * @param   {Number|Number[]}   [obj.rows.data]        Data for cells
   * @param   {Boolean[]}         [obj.highlightColumns] Whether column is to be highlighted
   * @returns {String}                                   HTML tbody tag with class 'isTherapeutic' on highlighted columns
   */
  createVancoTable({rows, highlightColumns} = {}){
    let rowHtml = "";
    if ( rows[0].data.length === 0 ) return "";
    for( let row of rows ) {
      rowHtml += `<tr><th scope="row">${row.title}</th>`;
      if ( row.units === undefined ) { row.units = ""; }
      if ( row.roundTo === undefined ) { row.roundTo = -1; }
      for ( let i=0; i<vanco.config.doses.length; i++ ){
        let value = "";
        if ( Array.isArray(row.data) ) {
          if ( row.data.length > 0 ) { value = row.data[i] };
        } else {
          value = row.data;
        }
        let rowClass = "";
        if ( Array.isArray(highlightColumns) && highlightColumns.length > 0 ) {
          if ( highlightColumns[i] ) {
            rowClass = "isTherapeutic";
          }
        }
        rowHtml += `<td class="${rowClass}">${displayValue("", value, row.roundTo, row.units)}</td>`

      }
      rowHtml += `</tr>`
    }
    return `<tbody>${rowHtml}</tbody>`;
  },
  /**
   * Input and output for Second Dose tab
   * @requires module:util
   * @requires module:seconddose
   * @returns {undefined}
   */
  secondDose(){
    const fd = checkTimeInput($("#seconddose-time1").val());
    let freqId = $("[name='seconddose-freq']:checked")[0].id;
    freqId = freqId.replace("seconddose-","");
    const sd = getSecondDose({fd: fd, freqId: freqId});
    if ( sd === undefined ) {
      $(".output[id^='seconddose']").html("");
      $("#seconddose-row-1").show();
    } else {
      sd.forEach( (me, i) => {
        $(`#seconddose-text-${i}`).html(`${me.hours} hours (${me.diff} hours ${me.direction})`);
        me.times.forEach( (time, j) => {
          $(`#seconddose-${i}-${j}`).html(time);
        });
      });
      if ( sd.length === 1 ) {
        $("#seconddose-row-1").hide();
      } else {
        $("#seconddose-row-1").show();
      }
    }
  },
  /**
   * Input and output for IVIG calculation
   * @requires module:util
   * @requires module:ivig
   * @returns {undefined}
   */
  ivig(){
    const dose = checkValue(+$("#ivig-dose").val());
    const selected = $("#ivig-product")[0].selectedIndex;
    $("#ivig-text").html(ivig.getText(selected, pt.wt, dose));
  }
}

/**
 * Provides a color to highlight the percent change of total daily vancomycin dose.
 * Color stops are fixed at : red at 35%, yellow at 30%, and green at 20%
 * Values in between color stops are scaled using R, G, and B values
 * @param   {Number} x  percent change (from -100 to 100)
 * @returns {String}    color as rgb(__, __, __)
 */
function colorScale(x) {
  let arr = [];
  x = Math.abs(x);
  if (x >= 35) {
    arr = [248, 105, 107];
  } else if (x < 20) {
    arr = [100, 221, 67];
  } else if (x <= 30) {
    arr = [
      Math.floor(100 + 155 * ((x - 20) / 10)),
      Math.floor(221 + 14 * ((x - 20) / 10)),
      Math.floor(67 + 65 * ((x - 20) / 10))
    ];
  } else {
    arr = [
      Math.ceil(255 - 7 * ((x - 30) / 5)),
      Math.ceil(235 - 130 * ((x - 30) / 5)),
      Math.ceil(132 - 25 * ((x - 30) / 5))
    ];
  }
  return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}

/**
 * Calculate halflife from ke
 * @param   {Number} ke    elimination rate constant
 * @returns {Number}       halflife in hours
 */
function getHalflife(ke){
  return Math.log(2) / ke;
}

/**
 * From a proposed dose and frequency, calculate and display
 * the percent change from the patient's current total daily dose.
 * @requires module:util
 * @param    {(String|HTMLElement)} el  jQuery selector for element that will display result
 * @param    {(Number|String)}      d   the dose in mg
 * @param    {(Number|String)}      f   the frequency (every __ hours)
 * @returns  {HTMLElement}              The original DOM element, for chaining
 */
function displayChange(el, d = 0, f = 0) {
  let newDose = checkValue(d),
  newFreq = checkValue(f),
  oldTdd = 24 / pt.curFreq * pt.curDose,
  arrow = "";

  if ( newDose > 0 && newFreq > 0 && pt.curDose > 0 && pt.curFreq > 0 ) {
    let newTdd = 24 / newFreq * newDose;
    let change = (newTdd - oldTdd) / oldTdd;
    if (change === 0) {
      arrow = "&nbsp;&nbsp;&nbsp;";
    } else if (change < 0) {
      arrow = "&darr;&nbsp;&nbsp;";
    } else {
      arrow = "&uarr;&nbsp;&nbsp;";
    }
    $(el).html(arrow + roundTo(Math.abs(change * 100), 0.1) + "%");
    $(el).css("background-color", colorScale(Math.abs(change * 100)));
  } else {
    $(el).html("");
    $(el).css("background-color", "#f2f7fa");
  }
  return el;
}
