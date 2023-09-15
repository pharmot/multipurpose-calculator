/*!
  * VMFH Pharmacy Multipurpose Calculator v1.2.0
  * Copyright 2020-2023 Andy Briggs (https://github.com/pharmot)
  * Licensed under MIT (https://github.com/pharmot/multipurpose-calculator/LICENSE)
  */

// eslint-disable-next-line no-global-assign
$ = require("jquery");
import "bootstrap";
import "../scss/main.scss";
import { displayDate, displayValue, checkValue, roundTo, getDateTime, getHoursBetweenDates, checkTimeInput, parseAge, displayTime } from "./util.js";
import { default as ivig } from "./ivig.js";
import { getSecondDose } from "./seconddose.js";
import * as arial from "./arial.js";
import { default as setupValidation } from "./formValidation.js";
import * as vanco from "./vanco.js";
import * as amg from "./amg.js";
import * as LOG from "./logger.js";
require("./heparin.js");
require("./kcentra.js");
require("./pca.js");
require("./nextdose.js");
require("./qtc.js");
require("./alligation.js");

let debug = false;
// let debugDefaultTab = "more";
// let debugDefaultMoreTab = "amg";
const tape = {};
let validatedFields;

//---------------------------------------------------------------
// ON PAGE LOAD

$(() => {
  $("[data-toggle=\"popover\"]").popover({ html: true });
  $("[data-toggle=\"tooltip\"]").tooltip();
  $(".hidden").hide();
  $("#amg-warning").hide();


  if ( /debug/.test(location.search) ) {
    debug = true;
  } else if ( /log/.test(location.search) ) {
    LOG.enable();
  }

  if ( debug ) {
    $("#ptage").val(60);
    $("#sex").val("M");
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

    $("#amg-goalPeak").val(20);
    $("#amg-currentDose").val(500);
    $("#amg-doseDate").val("2023-05-27");
    $("#amg-doseTime").val("2100");
    $("#amg-level1").val(17);
    $("#amg-level1Date").val("2023-05-28");
    $("#amg-level1Time").val("0000");
    $("#amg-level2").val(7);
    $("#amg-level2Date").val("2023-05-28");
    $("#amg-level2Time").val("1200");
    $("#amg-customDate").val("2023-05-29");
    $("#amg-customTime").val("0200");
    LOG.enable();


    // $(".nav-item.nav-link.active").removeClass("active");
    // $(".tab-pane.fade.show.active").removeClass("show active");
    // $(`#nav-${debugDefaultTab}-tab`).addClass("active");
    // $(`#nav-${debugDefaultTab}`).addClass("show active");
    // $(`#nav-${debugDefaultMoreTab}-tab`).addClass("active");
    // $(`#nav-${debugDefaultMoreTab}`).addClass("show active");
    // $(`#nav-${debugDefaultMoreTab}`, `#nav-${debugDefaultTab}`).show();
    $("#amg-warning").hide();
    calculate.syncCurrentDFT("revision");
    calculate.patientData();
    calculate.vancoInitial();
    calculate.vancoRevision();
    calculate.vancoAUC();
    calculate.amgWeight();
    calculate.amg();

  } else {
    resetDates();
  }

  validatedFields = setupValidation([
    { selector: "#ptage", inputType: "age", min: pt.config.check.ageMin, max: pt.config.check.ageMax },
    { selector: "#sex", match: /^[MmFf]$/ },
    { selector: "#height", min: pt.config.check.htMin, max: pt.config.check.htMax },
    { selector: "#weight", min: pt.config.check.wtMin, max: pt.config.check.wtMax },
    { selector: "#scr", min: pt.config.check.scrMin, max: pt.config.check.scrMax },
    { selector: ".validate-dose", min: vanco.config.check.doseMin, max: vanco.config.check.doseMax },
    { selector: ".validate-freq", min: vanco.config.check.freqMin, max: vanco.config.check.freqMax },
    { selector: ".validate-level", min: vanco.config.check.levelMin, max: vanco.config.check.levelMax },
    { selector: ".validate-time", inputType: "time" },
  ]);
  $("#ptage").get(0).focus();
});
//---------------------------------------------------------------
// EVENT LISTENERS

// Reset Button
$("#btnReset").on("click", () => {
  $("input").val("");
  calculate.syncCurrentDFT("revision");
  resetDates();
  $("#aucDates-apply").removeClass("datesApplied");
  $("#hd")[0].selectedIndex = 0;
  $("#vancoIndication")[0].selectedIndex = 0;
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
  calculate.vancoTwolevel();
  calculate.secondDose();
  calculate.ivig();
  calculate.amgWeight();
  calculate.amg();

  $("#top-container").removeClass("age-adult age-child age-infant");
  $("#top-container").addClass("age-adult");
  $(validatedFields).removeClass("invalid");

  // Remove from manually marked invalid fields
  $(".invalid").removeClass("invalid");

  $("#amg-Cf").prop( "checked", false );
  $("#amg-PrePostpartum").prop( "checked", false );
  changedAmgMethod();
  $("#amg-postAbxEffect")[0].selectedIndex = 4;

  $(".hidden").hide();
  $(".output").html("");
  $("#ptage").get(0).focus();


  // PCA
  $("#pca-drug")[0].selectedIndex = 0;
  $("#pca-orderset")[0].selectedIndex = 0;
  $("#pca-continuous")[0].selectedIndex = 0;
  $(".pca-bg-warning").removeClass("pca-bg-warning");
  $(".pca-bg-danger").removeClass("pca-bg-danger");
  $(".pca-bg-error").removeClass("pca-bg-error");

});

// Patient
$(".input-patient").on("keyup", () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
  calculate.amgWeight();
  calculate.amg();
});
$("#ptage").on("keyup", () => {
  setTimeout(() => {
    $("#top-container").removeClass("age-adult age-child age-infant");
    $("#top-container").addClass(`age-${pt.ageContext}`);
  }, 1000);
});
$("#hd").on("change", (e) => {
  const hd = e.target.selectedIndex;
  $("#top-container").removeClass("hd-0 hd-1 hd-2 hd-3 hd-4");
  $("#top-container").addClass(`hd-${hd}`);

  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});
$("#schwartz-k-infant").on("change", () => {
  calculate.patientData();
  calculate.vancoInitial();
  calculate.vancoRevision();
  calculate.vancoAUC();
});

// Vancomycin
$("#vancoIndication").on("change", () => {
  calculate.patientData();
  calculate.vancoInitial();
});

$(".input-initialPK").on("keyup", () => {
  calculate.vancoInitial();
});

$("#peakTiming-dose").on("keyup", () => calculate.peakTimingDuration() );

$(".input-peakTiming").on("keyup", () => calculate.peakTiming() );

$(".input-auc").on("keyup", () => {
  calculate.syncCurrentDFT("auc");
  calculate.vancoAUC();
  calculate.vancoRevision();
});

$(".input-auc-interval").on("keyup", () => {
  calculate.vancoAUC(false);
});

$("#auc-reset").on("click", () => {
  calculate.vancoAUC();
});

$("#btnShowInitialPk").on("click", () => {
  $("#row--initialPkAlert").hide(50, "linear");
  $("#row--initialPkCalc").addClass("show");
});

$(".input-revision").on("keyup", () => {
  calculate.syncCurrentDFT("revision");
  calculate.vancoRevision();
  calculate.vancoAUC();
});

$(".input-aucDates").on("keyup", () => calculate.vancoAUCDates() );
$(".input-twolevel").on("keyup", () => calculate.vancoTwolevel() );
$(".input-twolevel-interval").on("keyup", () => calculate.vancoTwolevel(false) );
$("#twolevel-reset").on("click", () => calculate.vancoTwolevel() );

$("#revision-goalTrough").on("change", () => calculate.vancoRevision() );

$(".input-steadystate").on("keyup", () => calculate.vancoSteadyStateCheck() );
$("#seconddose-time1").on("keyup", () => calculate.secondDose() );
$("[name='seconddose-freq']").on("change", () => calculate.secondDose() );

// Aminoglycosides
$(".input-amg").on("keyup", () => calculate.amg() );
$("#amg-medication").on("change", () => calculate.amg() );
$("#amg-postAbxEffect").on("change", () => calculate.amg() );
$("#amg-Cf").on("change", () => {
  changedAmgMethod();
  calculate.amgWeight();
  calculate.amg();
});

/**
 * Check CF box status and show/hide DOM elements based on dosing method
 */
function changedAmgMethod() {
  if ( $("#amg-Cf").is(":checked") ) {
    $("#row--amgTab").removeClass("amg-ext").addClass("amg-cf");
    $("#label--amg-currentDose").html("Current Dose");
    /* Change to tobramycin if gentamicin is selected */
    if ( $("#amg-medication option:selected").val() === "G" ) {
      $("#amg-medication").val("T");
    }
  } else {
    $("#row--amgTab").removeClass("amg-cf").addClass("amg-ext");
    $("#label--amg-currentDose").html("Dose Administered");
  }
}

$("#amg-PrePostpartum").on("change", () => {
  calculate.amgWeight();
  calculate.amg();
});

// IVIG module
$("#ivig-product").on("change", () => calculate.ivig() );
$("#weight").on("keyup", () => calculate.ivig() );
$("#ivig-dose").on("keyup", () => calculate.ivig() );

// Vancomycin AUC Dates Modal
$("#aucDates-sameInterval").on("change", e => {
  const tr = document.getElementById("aucDates-row--trough");
  const pk = document.getElementById("aucDates-row--peak");
  const spacer = document.getElementById("aucDates-row--spacer");
  // const last = document.getElementById("aucDates-row--last");
  const par = tr.parentNode;
  if ( e.target.checked ) {
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

$("#aucDates-apply").on("click", e => {
  $(e.target).addClass("datesApplied");
  $("#vancoAUCPeakTime").val($("#aucDates-peakResult").html());
  $("#vancoAUCTroughTime").val($("#aucDates-troughResult").html());
  $("#aucDatesModal").modal("hide");
  calculate.vancoAUC();
});

/**
 * Resets date input fields to today's date.
 */
function resetDates() {
  const today = new Date();
  $(".dt-date").val(`${today.getFullYear()}-${`0${  today.getMonth() + 1}`.slice(-2)}-${`0${  today.getDate()}`.slice(-2)}`);
}

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
const pt = {
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
      scrMax: 20,
    },
  },
  /**
   * Gets/sets the sex of the patient.  Accepts a single letter - m or f - and
   * stores as uppercase.  If invalid, stores 0.
   * @function
   * @param {any} [x] Patient's sex
   * @returns {string|number} Patient's sex as `M`, `F`, or 0 if invalid
   */
  set sex(x) {
    this._sex = /^[MmFf]$/.test(x) ? x.toUpperCase() : 0;
  },
  get sex() { return this._sex || 0; },
  /**
   * Gets/sets the weight of the patient.
   * @function
   * @requires module:util
   * @param {number} [x] Patient's weight
   * @returns {number} Patient's weight in kg, or 0 if invalid
   */
  set wt(x) { this._wt = checkValue(x, this.config.check.wtMin, this.config.check.wtMax); },
  get wt() { return this._wt || 0; },
  /**
   * Gets/sets the height of the patient.
   * @function
   * @requires  module:util
   * @param    {number}     [x] Patient's height
   * @returns  {number}         Patient's height in cm, or 0 if invalid
   */
  set ht(x) { this._ht = checkValue(x, this.config.check.htMin, this.config.check.htMax); },
  get ht() { return this._ht || 0; },
  /**
   * Gets/sets the age of the patient.
   * Accepts in years, months, days, or months/days.
   * @function
   * @requires   module:util
   * @param     {string|number} [x] Patient's age in days, months, or years
   * @returns   {number}            Patient's height in cm, or 0 if invalid
   * @example
   * pt.age("50");    // sets patient's age to 50 years
   * pt.age("23m");   // sets patient's age to 23 months (getter returns in years)
   * pt.age("16m3d"); // sets patient's age to 16 months, 3 days (getter returns in years)
   * pt.age("300d");  // sets patient's age to 300 days (getter returns in years)
   */
  set age(x) {
    const ageInYears = parseAge(x);
    if ( ageInYears ) {
      this._age = checkValue(ageInYears, this.config.check.ageMin, this.config.check.ageMax);
    } else {
      this._age = undefined;
    }

  },
  get age() { return this._age || 0; },
  /**
   * Gets the age context of the patient. 
   * Possible values are `adult` (default), `child`, and `infant`
   * @function
   * @returns {string} Patient's age context (adult, child, or infant)
   */
  get ageContext() {
    if ( this.age < 1 && this.age > 0 ) return "infant";
    if ( this.age < 18 && this.age !== 0 ) return "child";
    return "adult";
  },
  /**
   * Gets/sets the patient's serum creatinine.
   * @function
   * @requires   module:util
   * @param     {number}    [x]   Patient's SCr
   * @returns   {number}          Patient's SCr in mg/dL, or 0 if invalid
   */
  set scr(x) {
    this._scr = checkValue(x, this.config.check.scrMin, this.config.check.scrMax);
  },
  get scr() { return this._scr || 0; },
  /**
   * Gets the patient's body mass index
   * @function
   * @returns {number} Patient's BMI in kg/m^2, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md/#body-mass-index)
   */
  get bmi() {
    if ( this.wt > 0 && this.ht > 0 ) {
      return this.wt / ( this.ht / 100  * ( this.ht / 100 ));
    }
    return 0;
  },
  /**
   * Gets the patient's ideal body weight.  Returns 0 if age < 18.
   * @function
   * @returns {number} Patient's ideal body weight BMI in kg/m^2, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md/#ideal-body-weight)
   */
  get ibw() {
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      return ( this.sex === "M" ? 50 : 45.5 ) + 2.3 * ( this.ht / 2.54 - 60 );
    }
    return 0;
  },
  /**
   * Gets the patient's adjusted body weight, using a factor of 0.4.  Returns 0 if age < 18.
   * @function
   * @returns {number} Patient's ideal body weight BMI in kg/m^2, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md/#adjusted-body-weight)
   */
  get adjBW() {
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      if ( this.wt <= this.ibw ) return this.wt;
      return 0.4 * (this.wt - this.ibw) + this.ibw;
    }
    return 0;
  },
  /**
   * Gets the percent the patient is over or under ideal body weight.  Returns 0 if age < 18.
   * @function
   * @returns {number} Percent over or under ideal body weight, or 0 if insufficient input
   * @example
   * If patient is 30% above their IBW, returns `30`
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#percent-over-or-under-ibw)
   */
  get overUnder() {
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex && this.adjBW > 0 ) {
      return (this.wt / this.ibw - 1) * 100;
    }
    return 0;
  },
  /**
   * Gets the patient's lean body weight.  Returns 0 if age < 18.
   * @function
   * @returns {number} Patient's lean body weight in kg, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#lean-body-weight)
   */
  get lbw() {
    if ( this.age < 18 ) return 0;
    if ( this.ht > 0 && this.wt > 0 && this._sex ) {
      if ( this.sex === "F" ) {
        return 9270 * this.wt / ( 8780 + 244 * this.bmi );
      }
      return 9270 * this.wt / ( 6680 + 216 * this.bmi );
    }
    return 0;
  },
  /**
   * Gets the patient's Cockroft-Gault creatinine clearance using actual body weight.
   * @function
   * @returns {number} Patient's CrCl (C-G ABW) in mL/min, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#cockroft-gault)
   */
  get cgActual() {
    if ( this.wt > 0 && this.age > 0 && this.scr > 0 && this._sex ) {
      return this.cg(this.wt);
    }
    return 0;
  },
  /**
   * Gets the patient's Cockroft-Gault creatinine clearance using adjusted body weight.
   * @function
   * @returns {number} Patient's CrCl (C-G AdjBW) in mL/min, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#cockroft-gault)
   */
  get cgAdjusted() {
    if ( this.adjBW > 0 && this.age > 0 && this.scr > 0 ) {
      return this.cg(this.adjBW);
    }
    return 0;
  },
  /**
   * Gets the patient's Cockroft-Gault creatinine clearance using ideal body weight.
   * @function
   * @returns {number} Patient's CrCl (C-G IBW) in mL/min, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#cockroft-gault)
   */
  get cgIdeal() {
    if ( this.ibw > 0 && this.age > 0 && this.scr > 0 ) {
      return this.cg(this.ibw);
    }
    return 0;
  },
  /**
   * Gets the patient's Protocol CrCl (equation and weight depend on age and percent over/under IBW.
   * @function
   * @returns {number} Patient's Protocol CrCl in mL/min, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#protocol-crcl)
   */
  get crcl() {
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
  cg(weight) {
    return (140 - this.age) * weight / (this.scr * 72) * (pt.sex === "F" ? 0.85 : 1);
  },
  /**
   * Gets/sets the k value for the Schwartz CrCl equation.
   * @function
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#schwartz)
   * @param {number}  [x] selectedIndex of k value input element where 0 is "term infant" and 1 is "LBW infant"
   * @returns {number} k value, or 0 if age > 18 or insufficient input
   */
  set schwartzK(term) {
    if ( this.age === 0 || this.age >= 18 ||  this.age >= 13 && this.sex === 0  ) {
      this._schwartzK = 0;
    } else if ( this.age <= 1 ) {
      this._schwartzK = term === 0 ? 0.45 : 0.33;
    } else if ( this.age >= 13 && this.sex === "M" ) {
      this._schwartzK = 0.7;
    } else {
      this._schwartzK = 0.55;
    }
    // return this._schwartzK;
  },
  get schwartzK() {
    return this._schwartzK || 0;
  },
  /**
   * Gets the patient's Schwartz CrCl
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md#schwartz)
   * @function
   * @returns {number} Patient's CrCl in mL/min using the Schwartz equation, or 0 if insufficient input
   */
  get schwartz() {
    const k = this.schwartzK;
    if ( k === 0 || this.ht === 0 || this.scr === 0 ) return 0;
    return  k * this.ht  / this.scr;
  },
  /**
   * Gets the patient's body surface area using the Mosteller formula if patient
   * is 14 years of age or older.
   *
   * @function
   * @returns {number} Patient's BSA in m^2, or 0 if insufficient input
   * @see [equations.md](https://pharmot.github.io/multipurpose-calculator/docs/equations.md/#body-surface-area)
   */
  get bsa() {
    if ( this.age < 14 ) return 0;
    if ( this.ht > 0 && this.wt > 0 ) {
      return Math.sqrt(  this.wt * this.ht  / 3600 );
    }
    return 0;
  },
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
  patientData() {
    // Remove highlighting on CrCls
    $(".outCrCl").removeClass("use-this");

    // Set pt properties from inputs
    pt.age = $("#ptage").val();
    pt.sex = $("#sex").val();
    pt.ht = +$("#height").val();
    pt.wt = +$("#weight").val();
    pt.scr = +$("#scr").val();
    pt.schwartzK = $("#schwartz-k-infant")[0].selectedIndex;

    displayValue("#schwartz-crcl", pt.schwartz, 0.1, " mL/min");
    // Display weights and CrCl
    displayValue("#ibw", pt.ibw, 0.1, " kg");
    displayValue("#overUnder", pt.overUnder, 0.1, "%", "", true);
    displayValue("#adjBW", pt.adjBW, 0.1, " kg");
    displayValue("#lbw", pt.lbw, 0.1, " kg");
    displayValue("#bmi", pt.bmi, 0.1, " kg/m²");
    displayValue("#bsa", pt.bsa, 0.01, " m²");
    // Use Bayesian calculator instead of weight-based dosing if BMI > 30
    if ( pt.bmi > 30 ) {
      $("#alert--bayesian").removeClass("alert-secondary").addClass("alert-warning");
      $("#bmi").addClass("text-danger font-weight-bold");
    } else {
      $("#alert--bayesian").removeClass("alert-warning").addClass("alert-secondary");
      $("#bmi").removeClass("text-danger font-weight-bold");
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

    const cboHD = $("#hd")[0];
    const cboIndication = $("#vancoIndication")[0];
    pt.hd = cboHD.selectedIndex;
    pt.vancoIndication = cboIndication.selectedIndex;
    tape.pt = [[
      ["Age", displayValue("", pt.age, 0.01, " years")],
      ["Sex", pt.sex === 0 ? "" : pt.sex],
      ["Weight", displayValue("", pt.wt, 0.0001, " kg")],
      ["Height", displayValue("", pt.ht, 0.0001, " cm")],
      ["SCr", displayValue("", pt.scr, 0.0001, " mg/dL")],
      ["Dialysis", cboHD.options[pt.hd].innerHTML],
    ]];
    if ( pt.ageContext === "adult" ) {
      tape.pt.push([
        ["Ideal body weight", displayValue("", pt.ibw, 0.1, " kg")],
        ["Over/Under IBW", displayValue("", pt.overUnder, 0.1, "%", "", true)],
        ["Adjusted body weight", displayValue("", pt.adjBW, 0.1, " kg")],
        ["Lean body weight", displayValue("", pt.lbw, 0.1, " kg")],
        ["Body mass index", displayValue("", pt.bmi, 0.1, " kg/m²")],
      ]);
      tape.pt.push([
        ["CrCl (C-G Actual)", displayValue("", pt.cgActual, 0.1, " mL/min")],
        ["CrCl (C-G Ideal)", displayValue("", pt.cgIdeal, 0.1, " mL/min")],
        ["CrCl (C-G Adjusted)", displayValue("", pt.cgAdjusted, 0.1, " mL/min")],
        ["CrCl (Protocol)", displayValue("", pt.crcl, 0.1, " mL/min")],
      ]);
    } else {
      tape.pt.push([
        ["Body mass index", displayValue("", pt.bmi, 0.1, " kg/m^2")],
        ["CrCl (Schwartz)", displayValue("", pt.schwartz, 0.1, " mL/min")],
      ]);
    }
    $("#tape--pt").html(LOG.outputTape(tape.pt, "Patient Info"));
    $("#tapeAmg--pt").html(LOG.outputTape(tape.pt, "Patient Info"));
  },
  /**
   * Sync dose, frequency, and trough inputs between tabs
   * @requires module:util
   * @param    {String}     src  id prefix of element to use as the source
   * @returns  {undefined}
   */
  syncCurrentDFT(src) {
    pt.curDose = checkValue(+$(`#${src}-curDose`).val(), vanco.config.check.doseMin, vanco.config.check.doseMax);
    pt.curFreq = checkValue(+$(`#${src}-curFreq`).val(), vanco.config.check.freqMin, vanco.config.check.freqMax);
    pt.curTrough = checkValue(+$(`#${src}-curTrough`).val(), vanco.config.check.levelMin, vanco.config.check.levelMax);
    $(".current-dose").filter($(`:not(.input-${src})`)).val(pt.curDose > 0 ? pt.curDose : "");
    $(".current-freq").filter($(`:not(.input-${src})`)).val(pt.curFreq > 0 ? pt.curFreq : "");
    $(".current-trough").filter($(`:not(.input-${src})`)).val(pt.curTrough > 0 ? pt.curTrough : "");
  },
  /**
   * Input and output for aminoglycoside dosing
   * @requires module:amg
   */
  amgWeight() {
    /* Get dosing weight */
    const { dosingWeightString } = amg.getDosingWeight({
      age: pt.age,
      wt: pt.wt,
      ibw: pt.ibw,
      adjBW: pt.adjBW,
      overUnder: pt.overUnder,
      alt:  $("#amg-Cf").is(":checked") || $("#amg-PrePostpartum").is(":checked"),
    });
    $("#amg-dosingWeight").html(dosingWeightString);

  },
  amg() {

    /* Get limits for input checking */
    const { goalPeakMin, goalPeakMax, freqMin, freqMax, doseMin, doseMax } = amg.config.check;

    /* Determine whether CF calculation method should be used */
    const cf = $("#amg-Cf").is(":checked");

    /* Get dosing weight */
    const { dosingWeight, dosingWeightType, dosingWeightReason } = amg.getDosingWeight({
      age: pt.age,
      wt: pt.wt,
      ibw: pt.ibw,
      adjBW: pt.adjBW,
      overUnder: pt.overUnder,
      alt:  cf || $("#amg-PrePostpartum").is(":checked"),
    });

    /* First letter (uppercase) of selected drug */
    const selectedDrug = $("#amg-medication option:selected").val();

    /* Selected post-antibiotic effect time */
    const pae = +$("#amg-postAbxEffect option:selected").text();

    /* Get input values */
    const params = {
      cf: cf,
      prePostpartum: $("#amg-prePostpartum").is(":checked"),
      drug: selectedDrug,
      goalPeak: checkValue(+$("#amg-goalPeak").val(), goalPeakMin, goalPeakMax),
      dose: checkValue(+$("#amg-currentDose").val(), doseMin, doseMax),
      freq: checkValue(+$("#amg-currentFreq").val(), freqMin, freqMax),
      doseTime: getDateTime($("#amg-doseDate").val(), $("#amg-doseTime").val()),
      postAbxEffect: pae,
      level1: checkValue(+$("#amg-level1").val(), 0),
      level1Time: getDateTime($("#amg-level1Date").val(), $("#amg-level1Time").val()),
      level2: checkValue(+$("#amg-level2").val(), 0),
      level2Time: getDateTime($("#amg-level2Date").val(), $("#amg-level2Time").val()),
      customTime: getDateTime($("#amg-customDate").val(), $("#amg-customTime").val()),
    };
    //TODO: add input validation for amg-currentDose, amg-goalPeak, amg-currentFreq

    const wtBasedDose = dosingWeight > 0 && params.dose > 0  ? params.dose / dosingWeight : 0;

    displayValue("#amg-currentWtBasedDose", wtBasedDose, 0.1, " mg/kg");

    /* Check to make sure timing of dose/levels are in the correct sequence and highlight if not */
    params.valid = true;
    if ( params.level1Time > 0 && params.doseTime > 0 && params.level1Time <= params.doseTime ) {
      $("#amg-level1DateTime").addClass("invalid");
      params.valid = false;
    } else {
      $("#amg-level1DateTime").removeClass("invalid");
    }
    if ( params.level2Time > 0 && (  params.level1Time > 0 && params.level2Time <= params.level1Time  ||   params.doseTime > 0 && params.level2Time <= params.doseTime  ) ) {
      $("#amg-level2DateTime").addClass("invalid");
      params.valid = false;
    } else {
      $("#amg-level2DateTime").removeClass("invalid");
    }
    if ( params.customTime > 0 && params.doseTime > 0 && params.customTime <= params.doseTime ) {
      $("#amg-customLevelDateTime").addClass("invalid");
    } else {
      $("#amg-customLevelDateTime").removeClass("invalid");
    }
    const wtTape = dosingWeight > 0 ? `${displayValue("", dosingWeight, 0.1, " kg")} (${dosingWeightType} weight)` : "";

    /* Save common items to tape */
    tape.amg = [
      [
        ["Dosing Weight", wtTape],
        ["Used because", dosingWeightReason],
      ],
      [
        ["Drug", $("#amg-medication option:selected").text()],
        ["Cystic Fibrosis?", params.cf ? "Yes" : "No"],
        ["Pre-/Postpartum?", params.prePostpartum ? "Yes" : "No"],
        ["Dose administered", displayValue("", params.dose, 0.1, " mg")],
        ["Weight-based", displayValue("", wtBasedDose, 0.1, " mg/kg")],
        ["Time of dose", displayDate(params.doseTime)],
        ["First level", displayValue("", params.level1, 0.01, " mcg/mL")],
        ["First level time", displayDate(params.level1Time)],
        ["Second level", displayValue("", params.level2, 0.01, " mcg/mL")],
        ["Second level time", displayDate(params.level2Time)],
      ],
    ];


    if ( cf ) {
      /* Reset non-cf items */
      $("#amg-recDose").html("");
      $("#amg-recDoseStart").html("");
      $("#amg-customLevel").html("");
      $("#amg-goalTrough").html("");
      $("#amg-warning").hide();

      const { goalTrough, goalPeak, goalAuc, ke, predPeak, predTrough, auc, halflife } = amg.cf(params);

      displayValue("#amg-predTrough", predTrough, 0.1, " mcg/mL");
      displayValue("#amg-predPeak", predPeak, 0.1, " mcg/mL");
      displayValue("#amg-auc", auc, 1, " mg&middot;hr/L");

      $("#amg-goalTroughOutput").html(goalTrough);
      $("#amg-goalPeakOutput").html(goalPeak);
      $("#amg-goalAuc").html(goalAuc);
      if ( ke > 0 ) {
        tape.amg.push([
          ["Goal trough", goalTrough],
          ["Goal peak", goalPeak],
          ["Goal AUC", goalAuc],
          ["Calculated ke", displayValue("", ke, 0.001, "/hr")],
          ["Halflife", displayValue("", halflife, 0.1, " hr")],
          ["Predicted trough", displayValue("", predTrough, 0.001, " mcg/mL")],
          ["Predicted peak", displayValue("", predPeak, 0.01, " mcg/mL")],
          ["Calculated AUC", displayValue("", auc, 0.1, " mg&middot;hr/L")],
        ]);
      }
    } else {
      /* Reset cf-only items */
      $("#amg-goalPeakOutput").html("");
      $("#amg-goalAuc").html("");
      $("#amg-predTrough").html("");
      $("#amg-predPeak").html("");
      $("#amg-auc").html("");


      const { goalTrough, ke, truePeak, troughDT, redoseDT, redoseLevel, newDoseToRedoseTime, vd, recDose, recDoseRounded, recFreq, levelAtCustom, warn } = amg.extended(params);

      /* Show warning if indicated */
      if ( warn ) {
        $("#amg-warning").show();
      } else {
        $("#amg-warning").hide();
      }
      displayValue("#amg-goalTrough", goalTrough, 1, " mcg/mL");
      const recDoseAndFreq = `${displayValue("", recDoseRounded, 0.1, " mg" )} ${displayValue("", recFreq, 1, "h", "q")}`;
      $("#amg-recDose").html(recDoseAndFreq);
      $("#amg-recDoseStart").html(displayDate(redoseDT));
      displayValue("#amg-customLevel", levelAtCustom, 0.1, " mcg/mL");

      if ( truePeak > 0 ) {
        tape.amg.push([
          ["Goal peak", displayValue("", params.goalPeak, 0.1, " mcg/mL")],
          ["Goal trough", displayValue("", goalTrough, 1, " mcg/mL")],
          ["Post-antibiotic effect", displayValue("", pae, 1, " hours", "", false, true)],
          ["Calculated ke", displayValue("", ke, 0.001, "/hr")],
          ["Estimated Vd", displayValue("", vd, 0.01, " L")],
          ["Calculated (true) Peak", displayValue("", truePeak, 0.01, " mcg/mL")],
          ["Time to goal trough (MIC)", displayDate(troughDT)],
          ["Redose point", displayDate(redoseDT)],
          ["Level at redose point", displayValue("", redoseLevel, 0.01, " mcg/mL", "", false, true)],
          ["Time to redose point", displayValue("", newDoseToRedoseTime, 0.01, " hrs", "", true)],
        ],
        [
          ["Recommended dose", displayValue("", recDose, 0.1, " mg")],
          ["Recommended frequency", displayValue("", recFreq, 1, "h", "q")],
        ]);
        if ( levelAtCustom > 0 ) {
          tape.amg.push([
            ["Point level estimate at", displayDate(params.customTime)],
            ["Estimated level", displayValue("", levelAtCustom, 0.01, " mcg/mL", false, true)],
          ]);
        }
      }
    } // end non-CF

    if ( tape.amg.length > 0 ) {
      $("#tapeAmg--calc").html(LOG.outputTape(tape.amg, "Aminoglycoside Extended Interval Dosing"));
    } else {
      $("#tapeAmg--calc").html("");
    }
  },

  /**
   * Input and output for initial protocol dosing and initial PK dosing
   * @requires module:util
   * @requires module:vanco
   * @returns  {undefined}
   */
  vancoInitial() {
    $("#vancoInitialLoad").html(vanco.loadingDose({
      ht: pt.ht,
      wt: pt.wt,
      age: pt.age,
      sex: pt.sex,
      bmi: pt.bmi,
      hd: pt.hd,
      vancoIndication: pt.vancoIndication,
    }));
    const { doseMin, doseMax, freqMin, freqMax } = vanco.config.check;
    const { maintText, freq } = vanco.getMaintenanceDose({
      age: pt.age,
      wt: pt.wt,
      ibw: pt.ibw,
      scr: pt.scr,
      hd: pt.hd,
      indication: pt.vancoIndication,
      crcl: pt.crcl,
    });
    $("#vancoInitialMaintenance").html(maintText);
    let maintTextTooltip = "";

    if ( maintText.length > 0 ) {
      if ( /^Must order/.test(maintText) ) {
        maintTextTooltip = maintText;
      } else {
        maintTextTooltip = `<b>Calculated weight-based dose is</b> <br>${maintText}<br><b>but Bayesian calculator should be used instead for obese patients.</b>`;
      }
    }
    $("#tooltip--vanco-md-bayesian").attr("data-original-title", maintTextTooltip);
    if ( maintText.length > 0 && pt.bmi > 30 && pt.hd === 0 ) {
      $("#row--vanco-md-default").css("display", "none");
      $("#row--vanco-md-bayesian").css("display", "flex");
    } else {
      $("#row--vanco-md-default").css("display", "flex");
      $("#row--vanco-md-bayesian").css("display", "none");
    }
    const { monitoring, targetLevelText, pkParam, targetMin, targetMax, goalTroughIndex } = vanco.getMonitoringRecommendation({
      freq: freq,
      hd: pt.hd,
      crcl: pt.crcl,
      scr: pt.scr,
      bmi: pt.bmi,
      indication: pt.vancoIndication,
      age: pt.age,
    });

    $("#vancoInitialMonitoring").html(monitoring);
    $("#vancoInitialTargetLevel").html(targetLevelText);

    // Set goal trough selection on the single level tab
    if ( goalTroughIndex >= 0 ) {
      $("#revision-goalTrough")[0].selectedIndex = goalTroughIndex;
    }

    const selectedDose = checkValue(+$("#vancoInitialPK-dose").val(), doseMin, doseMax);
    const selectedFrequency = checkValue(+$("#vancoInitialPK-interval").val(), freqMin, freqMax);

    const {
      arrDose, arrViable, arrLevel, pkLevel, pkRecLevel, pkRecDose,
      // vd, ke, 
      pkFreq, pkRecFreq, pkHalflife, pkLevelRowHeading, pkLevelUnits, pkLevelLabel,
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
      selFreq: selectedFrequency,
    });

    displayValue("#vancoInitialPK-halflife", pkHalflife, 0.1, " hrs");
    displayValue("#vancoInitialPK-recDose", pkRecDose, 1, " mg");
    displayValue("#vancoInitialPK-recFreq", pkRecFreq, 0.1, " hrs");
    $("#vancoInitialPK-recLevel-label").html(pkLevelLabel);
    $("#vancoInitialPK-level-label").html(pkLevelLabel);
    displayValue("#vancoInitialPK-recLevel", pkRecLevel, 0.1, pkLevelUnits);
    displayValue("#vancoInitialPK-level", pkLevel, 0.1, pkLevelUnits);
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Dose", data: arrDose, roundTo: 1, units: " mg" },
        { title: "Frequency", data: pkFreq, units: " hrs" },
        { title: pkLevelRowHeading, data: arrLevel, roundTo: 0.1 }],
      highlightColumns: arrViable,
    });
    $("#vancoInitialPK-table").html(tableHtml);

    const tableText = [[pkLevelLabel, []]];
    for ( let i = 0; i < arrDose.length; i++ ) {
      tableText[0][1].push(
        [
          `${arrDose[i]} mg q${pkFreq}h`,
          arial.padArray(["9999.99", displayValue("", arrLevel[i], 0.1, pkLevelUnits)], 0)[1],
        ]
      );
    }
  },
  /**
   * Input and output for linear and kinetic single-level dose adjustments
   * @requires module:vanco
   * @requires module:util
   * @returns {undefined}
   */
  vancoRevision() {
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
      goalTrough: goaltrough,
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
      selDose: selectedDose,
    });
    pt.adjHalflife = halflife;
    displayValue("#revision-halflife", halflife, 0.1, " hours");

    $("#revision-pkDose").html( recDose === 0 ? "" : `${roundTo(recDose, 1)} mg q ${roundTo(recFreq, 0.1)} h`);
    displayChange("#revision-pkDoseChange", recDose, recFreq);
    displayValue("#revision-pkTrough", recTrough, 0.1, " mcg/mL");

    displayChange("#revision-pkTestDoseChange", selDose, selFreq);
    displayValue("#revision-pkTestTrough", selTrough, 0.1, " mcg/mL");

    this.vancoSteadyStateCheck();

    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, roundTo: 1, units: " mg" },
        { title: "Interval", data: newFreq, units: " hrs" },
        { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable,
    });
    $("#revision-pkTable").html(tableHtml);

    $("#vancoHdAdj").html(vanco.hdRevision({ wt: pt.wt, trough: pt.curTrough }));
  },
  /**
   * Input and output for Steady State Check on single-level tab
   * @requires module:vanco
   * @returns {undefined}
   */
  vancoSteadyStateCheck() {
    const firstDT = getDateTime($("#steadystate-dateFirst").val(), $("#steadystate-timeFirst").val());
    const troughDT = getDateTime($("#steadystate-dateTrough").val(), $("#steadystate-timeTrough").val());
    if ( firstDT !== 0 && troughDT !== 0 && pt.adjHalflife > 0 ) {
      const timeDiff = getHoursBetweenDates(firstDT, troughDT);
      const halflives = roundTo(timeDiff / pt.adjHalflife, 0.1);
      $("#steadystate-timeDiff").html(`${roundTo(timeDiff, 0.1)} hrs&nbsp;&nbsp;&nbsp;(${halflives} ${halflives === 1 ? "half-life" : "half-lives"})`);
      $("#steadystate-atSS").html(`${halflives < 4 ? "Not at" : "At"} steady state.`);
    } else {
      $("#steadystate-atSS").html("");
      $("#steadystate-timeDiff").html("");
    }
  },

  /**
   * For peak level timing, calculate and output infusion time for the selected dose
   * @requires module:vanco
   * 
   * @since v1.1.1
   */
  peakTimingDuration() {
    const dose = checkValue(+$("#peakTiming-dose").val(), vanco.config.check.doseMin, vanco.config.check.doseMax);
    const infTime = dose > 0 ? vanco.getInfusionTime(dose) * 60 : "";
    $("#peakTiming-infTime").val(infTime);
    this.peakTiming();

  },

  /**
   * For peak level timing, calculate and output time to draw peak
   * @requires module:vanco
   * @requires module:util
   * 
   * @since v1.1.1
   */
  peakTiming() {
    const infTime = checkValue(+$("#peakTiming-infTime").val(), vanco.config.check.infTimeMin, vanco.config.check.infTimeMax);
    const startTime = getDateTime("1900-01-01", $("#peakTiming-startTime").val());
    if ( startTime instanceof Date ) {
      startTime.setMinutes(startTime.getMinutes() + 60 + infTime );
      const time1 = displayTime(startTime);
      startTime.setMinutes(startTime.getMinutes() + 60 );
      const time2 = displayTime(startTime);
      if ( infTime > 0 && startTime instanceof Date) {
        $("#peakTiming-peak").html(`Draw peak between ${time1} and ${time2}.`);
      } else {
        $("#peakTiming-peak").html("");
      }
    }
  },

  /**
   * Input and output for AUC date/time calculation modal
   * @requires module:vanco
   * @returns {undefined}
   */
  vancoAUCDates() {
    const sameInterval = $("#aucDates-sameInterval").is(":checked");
    const dose1 = getDateTime($("#aucDates-doseDate-1").val(), $("#aucDates-doseTime-1").val());
    const dose2 = sameInterval ? dose1 : getDateTime($("#aucDates-doseDate-2").val(), $("#aucDates-doseTime-2").val());
    const trough = getDateTime($("#aucDates-troughDate").val(), $("#aucDates-troughTime").val());
    const peak = getDateTime($("#aucDates-peakDate").val(), $("#aucDates-peakTime").val());

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
  vancoAUC(resetInterval = true) {
    const params = {
      dose: pt.curDose,
      interval: pt.curFreq,
      peak: checkValue(+$("#auc-curPeak").val(), vanco.config.check.levelMin, vanco.config.check.levelMax),
      peakTime: checkValue(+$("#vancoAUCPeakTime").val(), vanco.config.check.timeMin, vanco.config.check.timeMax),
      troughTime: checkValue(+$("#vancoAUCTroughTime").val(), vanco.config.check.timeMin, vanco.config.check.timeMax),
      trough: pt.curTrough,
    };
    const aucCurrent = vanco.calculateAUC(params);
    const auc24 = aucCurrent === undefined ? 0 : aucCurrent.auc24;
    // const oldInterval = aucCurrent === undefined ? 0 : aucCurrent.oldInterval;
    const goalTroughLow = aucCurrent === undefined ? 0 : aucCurrent.goalTroughLow;
    const goalTroughHigh = aucCurrent === undefined ? 0 : aucCurrent.goalTroughHigh;
    displayValue("#vancoAUC24", auc24 || 0, 0.1);
    const goalTrough = aucCurrent === undefined ? "" : `${roundTo(goalTroughLow, 0.1)} &ndash; ${roundTo(goalTroughHigh, 0.1)} mcg/mL`;
    $("#vancoAUCTroughGoal").html(goalTrough);
    if ( $("#vancoAUC24").html() !== "" ) {
      $("#vancoAUC24").append(` (${aucCurrent.therapeutic})`);
    }
    if ( resetInterval && $("#vancoCurrentInterval") !== "" && aucCurrent !== undefined ) {
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
        { title: "Est. Trough (mcg/mL)", data: aucNew.trough, roundTo: 0.1 },
      ],
      highlightColumns: aucNew.therapeutic,
    });
    $("#aucTable").html(tableHtml);
    const tableText = [["Predicted AUC (est. trough) for New Dose", []]];
    for ( let i = 0; i < aucNew.dose.length; i++ ) {
      tableText[0][1].push(
        [
          `${aucNew.dose[i]} mg q${newInterval}h`,
          `${arial.padArray(["9999.99", roundTo(aucNew.auc[i], 0.1)], 0)[1]} (${roundTo(aucNew.trough[i], 0.1)} mcg/mL)`,
        ]
      );
    }

    if ( aucCurrent !== undefined ) {
      // was the date-time calculator modal used?
      const usedDateTimeCalculator = $("#aucDates-apply").hasClass("datesApplied");
      tape.auc = [
        [
          ["Current dose", `${params.dose} mg q${params.interval}h`],
          ["Peak level", displayValue("", params.peak, 0.1, " mcg/mL")],
          ["Trough level", displayValue("", params.trough, 0.1, " mcg/mL")],
          ["Time to peak", displayValue("", params.peakTime, 0.01, " hrs")],
          ["Time to trough", displayValue("", params.troughTime, 0.01, " hrs")],
        ],
        [
          ["Vd", displayValue("", aucCurrent.vd, 0.01, " L")],
          ["Infusion time", displayValue("", 60 * aucCurrent.tInf, 1, " min")],
          ["ke", displayValue("", aucCurrent.ke, 0.0001, ` hr^-1`)],
          ["Halflife", displayValue("", aucCurrent.halflife, 0.1, " hr")],
          ["True peak", displayValue("", aucCurrent.truePeak, 0.1, " mcg/mL")],
          ["True trough", displayValue("", aucCurrent.trueTrough, 0.1, " mcg/mL")],
          ["AUC (inf)", displayValue("", aucCurrent.aucInf, 0.1)],
          ["AUC (elim)", displayValue("", aucCurrent.aucElim, 0.1)],
        ],
        [
          ["AUC24", `${displayValue("", aucCurrent.auc24, 0.1)} (${aucCurrent.therapeutic})`],
          [
            `Trough goal`,
            `${roundTo(aucCurrent.goalTroughLow, 0.1)} &ndash; ${roundTo(aucCurrent.goalTroughHigh, 0.1)} mcg/mL`,
          ],
        ],
      ];
      if ( usedDateTimeCalculator ) {
        const sameInterval = $("#aucDates-sameInterval").is(":checked");
        const addToTape = [];
        addToTape.push([
          "Drawn in same interval?",
          sameInterval ? "Yes" : "No",
        ]);
        addToTape.push([
          sameInterval ? "Dose before levels" : "Dose before trough",
          displayDate( getDateTime( $("#aucDates-doseDate-1").val(), $("#aucDates-doseTime-1").val() ) ),
        ]);
        addToTape.push([
          "Trough time",
          displayDate( getDateTime($("#aucDates-troughDate").val(), $("#aucDates-troughTime").val() ) ),
        ]);
        if ( !sameInterval ) {
          addToTape.push([
            "Dose before peak",
            displayDate( getDateTime($("#aucDates-doseDate-2").val(), $("#aucDates-doseTime-2").val() ) ),
          ]);
        }
        addToTape.push([
          "Peak time",
          displayDate( getDateTime($("#aucDates-peakDate").val(), $("#aucDates-peakTime").val() ) ),
        ]);
        tape.auc.unshift(addToTape);
      }
      $("#tape--auc").html(LOG.outputTape(tape.auc, "AUC Dosing Calculation"));
      $("#tape--auc").append(LOG.outputTape(tableText));
    } else {
      tape.auc = [];
      $("#tape--auc").html("");
    }
  },
  /**
   * Input and output for Two-Level kinetic calculation
   * @requires module:util
   * @requires module:vanco
   * @param   {Boolean} [resetInterval=true]  whether recommended interval should override user input
   * @returns {undefined}
   */
  vancoTwolevel(resetInterval = true) {
    const {
      levelMin,
      levelMax,
      // doseMin,
      // doseMax,
      freqMin,
      freqMax,
    } = vanco.config.check;
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
    const {
      pkDose,
      pkFreq,
      pkTrough,
      halflife,
      // newPeak,
      newTrough,
      newViable,
      newDose,
    } = vanco.calculateTwoLevelPK({
      wt: pt.wt,
      bmi: pt.bmi,
      ke: ke,
      selectedInterval: selectedInterval,
    });
    displayValue("#twolevelHalflife", halflife, 0.1, " hours");
    displayValue("#twolevelNewDose", pkDose, 1, " mg");
    if ( resetInterval ) {
      $("#twolevelInterval").val(pkFreq === 0 ? "" : pkFreq);
    }
    displayValue("#twolevelNewTrough", pkTrough, 0.1, " mcg/mL");
    const tableHtml = this.createVancoTable({
      rows: [{ title: "Maint. dose", data: newDose, units: " mg" },
        { title: "Interval", data: pkFreq, units: " hrs" },
        { title: "Est. Trough (mcg/mL)", data: newTrough, roundTo: 0.1 }],
      highlightColumns: newViable,
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
  createVancoTable({ rows, highlightColumns } = {}) {
    let rowHtml = "";
    if ( rows[0].data.length === 0 ) return "";
    for ( const row of rows ) {
      rowHtml += `<tr><th scope="row">${row.title}</th>`;
      if ( row.units === undefined ) { row.units = ""; }
      if ( row.roundTo === undefined ) { row.roundTo = -1; }
      for ( let i = 0; i < vanco.config.doses.length; i++ ) {
        let value = "";
        if ( Array.isArray(row.data) ) {
          if ( row.data.length > 0 ) { value = row.data[i]; }
        } else {
          value = row.data;
        }
        let rowClass = "";
        if ( Array.isArray(highlightColumns) && highlightColumns.length > 0 ) {
          if ( highlightColumns[i] ) {
            rowClass = "isTherapeutic";
          }
        }
        rowHtml += `<td class="${rowClass}">${displayValue("", value, row.roundTo, row.units)}</td>`;

      }
      rowHtml += `</tr>`;
    }
    return `<tbody>${rowHtml}</tbody>`;
  },
  /**
   * Input and output for Second Dose tab
   * @requires module:util
   * @requires module:seconddose
   * @returns {undefined}
   */
  secondDose() {
    const fd = checkTimeInput($("#seconddose-time1").val());
    let freqId = $("[name='seconddose-freq']:checked")[0].id;
    freqId = freqId.replace("seconddose-", "");
    const sd = getSecondDose({ fd: fd, freqId: freqId });
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
  ivig() {
    const dose = checkValue(+$("#ivig-dose").val());
    const selected = $("#ivig-product")[0].selectedIndex;
    $("#ivig-text").html(ivig.getText(selected, pt.wt, dose));
  },
};

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
      Math.floor(67 + 65 * ((x - 20) / 10)),
    ];
  } else {
    arr = [
      Math.ceil(255 - 7 * ((x - 30) / 5)),
      Math.ceil(235 - 130 * ((x - 30) / 5)),
      Math.ceil(132 - 25 * ((x - 30) / 5)),
    ];
  }
  return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}

/**
 * Calculate halflife from ke
 * @param   {Number} ke    elimination rate constant
 * @returns {Number}       halflife in hours
 */
// function getHalflife(ke) {
//   return Math.log(2) / ke;
// }

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
  const newDose = checkValue(d);
  const newFreq = checkValue(f);
  const oldTdd = 24 / pt.curFreq * pt.curDose;
  let arrow = "";

  if ( newDose > 0 && newFreq > 0 && pt.curDose > 0 && pt.curFreq > 0 ) {
    const newTdd = 24 / newFreq * newDose;
    const change = (newTdd - oldTdd) / oldTdd;
    if (change === 0) {
      arrow = "&nbsp;&nbsp;&nbsp;";
    } else if (change < 0) {
      arrow = "&darr;&nbsp;&nbsp;";
    } else {
      arrow = "&uarr;&nbsp;&nbsp;";
    }
    $(el).html(`${arrow + roundTo(Math.abs(change * 100), 0.1)  }%`);
    $(el).css("background-color", colorScale(Math.abs(change * 100)));
  } else {
    $(el).html("");
    $(el).css("background-color", "#f2f7fa");
  }
  return el;
}
