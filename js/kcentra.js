/**
 * Kcentra Lot/Exp Module
 * @module kcentra
 * @since v1.1.0
 */

// KCentra - Lot # and Expiration
// *** Vials to make ~ *** unit dose
// *** vials of *** units; Lot #: ***; Expiration date: ***
// *** vials of *** units; Lot #: ***; Expiration date: ***
// *** vials of *** units; Lot #: ***; Expiration date: ***
// (**Units documented are Factor IX units**)

$("#kcentra--start").on("click", () => { kcentra.processInput() });
$("#kcentra--btnAdd").on("click", () => { kcentra.addRow("","") });
$("#kcentra--btnSum").on("click", () => { kcentra.makeText() });
$("#card--kcentra").on( "click", ".kcentra--remove", this,  ev => kcentra.removeRow(ev) );
$("#card--kcentra").on( "change", "input", () => { kcentra.clearText() });
$("#btnReset").on('click', () => {
  kcentra.clearText();
  $(".kcentra--inputRow").remove();
});
/**
 * KCentra module
 * @namespace
 */
const kcentra = {
  /**
   * Removes the row when the remove button is clicked
   * @param {DOMEvent} ev Event triggering this method (clicking .kcentra--remove)
   * @returns {null}
   */
  removeRow(ev){
    const el = ev.target;
    const btn = $(`#${el.id}`)[0];
    const wrapper = btn.parentNode;
    const row = wrapper.parentNode;
    row.parentNode.removeChild(row);
    this.clearText();
  },
  /**
   * Clears output field, parses scancode input and creates an input row for each scan code.
   * @returns {null}
   */
  processInput(){
    let self = this;
    $("#kcentra--output").val("");
    let scancode = $("#kcentra--scancode").val();
    let allScans = "";
    if ( scancode.length % 54 === 0 ) {
      let trimmed = scancode.substring(1,scancode.length-1);
      allScans = trimmed.split(/\\\\/);
    } else if ( scancode.length % 52 === 0 ) {
      allScans = scancode.match(/.{52}/g);
    }
  
    allScans.forEach( ( scan, i ) => {
      const thisExp = `${scan.substring(36,38)}/${scan.substring(38,40)}/${scan.substring(34,36)}`;
      const thisLot = scan.substring(42,52);
      self.addRow(thisLot, thisExp);
    });
  },
  /**
   * Outputs text from input rows.  Blank inputs are converted to `***` wildcards. If no input rows exist, outputs default admin instructions
   * @returns {null}
   */
  makeText(){
    $("#kcentra--output").empty();
    let sumQty = 0;
    let sumUnits = 0;
    let ai = "";
    $(".kcentra--inputRow").each( (i, a) => {
      let myQty = parseFloat($(a).find(".qty")[0].value),
          myUnits = parseFloat($(a).find(".units")[0].value),
          myLot = $(a).find(".lotNumber")[0].value,
          myExp = $(a).find(".expiration")[0].value;
      if(!isNaN(myQty) && !isNaN(myUnits) && sumUnits != "***") {
        sumQty += myQty;
        sumUnits += (myQty * myUnits);
      } else {
        sumUnits = '***';
        sumQty = '***';
      }
      ai += `${!isNaN(myQty) ? myQty : '***'} vials of ${!isNaN(myUnits) ? myUnits : '***'} units; Lot #: ${myLot !== "" ? myLot : '***'}; Exp. date: ${myExp !== "" ? myExp : '***'}\n`;
    });
    ai = `KCentra - Lot # and Expiration\n${sumQty} vials to make ~ ${sumUnits} unit dose\n${ai}`;
    ai += "(**Units documented are Factor IX units**)";
    if ( document.getElementsByClassName('kcentra--inputRow').length === 0 ) {
      ai = `KCentra - Lot # and Expiration\n*** Vials to make ~ *** unit dose\n*** vials of *** units; Lot #: ***; Expiration date: ***\n*** vials of *** units; Lot #: ***; Expiration date: ***\n*** vials of *** units; Lot #: ***; Expiration date: ***\n(**Units documented are Factor IX units**)`
    }

    $("#kcentra--output").val(ai);
    // const scrollheight = document.getElementById("kcentra--output").scrollHeight + 2;
    // $("#kcentra--output").height(`${scrollheight}px`);
  },
  /**
   * Clears output field
   * @returns {null}
   */
  clearText(){
    $("#kcentra--output").val("");
  },
  /**
   * Creates an input row with the provided lot and expiration and adds to DOM before the "process text" button
   * @param {String} lot Lot number
   * @param {String} exp Expiration date
   * @returns {null}
   */
  addRow(lot, exp){
    let newDiv = document.createElement("div");
    $(newDiv).addClass("form-row kcentra--inputRow");
    $(newDiv).html(`<div class="col-4 input-group">
      <input type="text" class="form-control kcentra qty">
      <div class="input-group-append">
        <div class="input-group-text">vials</div>
      </div>
      <label>of</label>
      <input type="text" class="form-control input-kcentra kcentra units">
      <div class="input-group-append">
        <div class="input-group-text">units</div>
      </div>
    </div>
    <div class="col-3 input-group">
      <label>Lot #:</label>
      <input type="text" class="form-control input-kcentra kcentra lotNumber" value="${lot}">
    </div>
    <div class="col-3 input-group">
      <label>Exp:</label>
      <input type="text" class="form-control input-kcentra kcentra expiration" value="${exp}">
    </div>
    <div class="col-1 input-group">
      <button class="btn btn-light kcentra--remove" id="${Math.random().toString(36).substring(2, 9)}">Remove</button>
    </div>`);
    $("#kcentra--btnSum--wrapper").before(newDiv);
    $("#kcentra--btnSum--wrapper").removeClass('hidden');
  }
}