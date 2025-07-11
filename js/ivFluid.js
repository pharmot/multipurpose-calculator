/**
 * IV Fluid Module
 * @module ivFluid
 * @since v1.4.0
 */

const sumVolume = ( acc, cur ) => { return acc + cur.volume };

// const additives = [];
// const fluids = [];
// const macros = [];
// const lytes = [];
let qsFluid;

class IVFluidComponent {
  constructor(obj) {
    this.id = obj.id;
    this.unit = obj.unit;
    this.roundingFactor = obj.roundingFactor || 0.1;
    this.outputTotal = $(`#${obj.id}-total`);
    this.outputConc = $(`#${obj.id}-tConc`);
    
    if ( obj.mgPerUnit ) {
      this.outputPercent = $(`#${obj.id}-tPercent`);
      this.percentRoundingFactor = obj.percentRoundingFactor || 0.1;
      this.mgPerUnit = obj.mgPerUnit;
    }
    
  }
  get total() {
    const self = this;
    return everything.reduce((acc, cur) => { return acc + cur[self.id] }, 0);
  }
};
export default class IvFluid {
  constructor(obj) {
    const self = this;
    this.opts = {
      id: {
        pre:          obj.idPre,
        inputAmount:  obj.idInputAmount  || '-amount',
        outputVolume: obj.idOutputVolume || '-volume',
        qsCheckbox:   obj.idQsCheckbox   || '-qs',
        selectUnit:   obj.idSelectUnit   || '-units',
        outputConc:   obj.idOutputConc   || '-conc',
        outputAmount: obj.idOutputAmount || '-amt2',
      },
    };
    this.components = {
      dextrose: new IVFluidComponent({  opts: self.opts, id: 'dextrose',  unit: 'g',   mgPerUnit: 1000 }),
      sodium: new IVFluidComponent({    opts: self.opts, id: 'sodium',    unit: 'mEq', mgPerUnit: 58.44, percentRoundingFactor: 0.01 }),
      potassium: new IVFluidComponent({ opts: self.opts, id: 'potassium', unit: 'mEq'  }),
      phosphate: new IVFluidComponent({ opts: self.opts, id: 'phosphate', unit: 'mmol' }),
      calcium: new IVFluidComponent({   opts: self.opts, id: 'calcium',   unit: 'mEq'  }),
      magnesium: new IVFluidComponent({ opts: self.opts, id: 'magnesium', unit: 'g'    }),
      chloride: new IVFluidComponent({  opts: self.opts, id: 'chloride',  unit: 'mEq'  }),
      acetate: new IVFluidComponent({   opts: self.opts, id: 'acetate',   unit: 'mEq'  }),
      osmoles: new IVFluidComponent({   opts: self.opts, id: 'osmoles',   unit: 'mOsm' }),
      sw: new Fluid({    opts: self.opts, id: 'sw' }),
      d5w: new Fluid({   opts: self.opts, id: 'd5w',   osm: 0.252,    dextrose: 0.05 }),
      d10w: new Fluid({  opts: self.opts, id: 'd10w',  osm: 0.504,    dextrose: 0.1 }),
      d5ns: new Fluid({  opts: self.opts, id: 'd5ns',  osm: 0.56,    dextrose: 0.05,  sodium: 0.154, chloride: 0.154 }),
      d5hns: new Fluid({ opts: self.opts, id: 'd5hns', osm: 0.406,    dextrose: 0.05, sodium: 0.077, chloride: 0.077 }),
      d5qns: new Fluid({ opts: self.opts, id: 'd5qns', osm: 0.329,    dextrose: 0.05, sodium: 0.0385 }),
      ns: new Fluid({    opts: self.opts, id: 'ns',    osm: 0.308,    sodium: 0.154,  chloride: 0.154 }),
      hns: new Fluid({   opts: self.opts, id: 'hns',   osm: 0.154,    sodium: 0.077,  chloride: 0.077 }),
      lr: new Fluid({
        opts: self.opts,
        id: 'lr',
        osm: 0.273,
        sodium: 0.13,
        chloride: 0.109,
        acetate: 0.028,
        potassium: 0.004,
        calcium: 3 / 1000,
      }),
      d5lr: new Fluid({
        opts: self.opts,
        id: 'd5lr',
        osm: 525 / 1000,
        dextrose: 5 / 100,
        sodium: 130 / 1000,
        chloride: 109 / 1000,
        acetate: 28 / 1000,
        potassium: 4 / 1000,
        calcium: 2.7 / 1000,
      }),
      cacl: new Additive({
        opts: self.opts,
        id: 'cacl',
        name: 'calcium chloride',
        unit: ['mEq', 'g'],
        conc: [1.36, 0.1],
        osm: 2.04,
        calcium: 1.36,
        chloride: 1.36,
      }),
      cagluc: new Additive({
        opts: self.opts,
        id: 'cagluc',
        unit: ['mEq', 'g'],
        conc: [0.465, 0.1],
        osm: 0.68,
        calcium: 0.465,
      }),
      mg: new Additive({
        opts: self.opts,
        id: 'mg',
        unit: ['g', 'mEq'],
        conc: [0.5, 4.06],
        osm: 4.06,
        magnesium: 0.5,
      }),
      kacet: new Additive({
        id: 'kacet',
        unit: ['mEq'],
        conc: [2],
        osm: 4,
        potassium: 2,
        acetate: 2,
      }),
      kcl: new Additive({
        opts: self.opts,
        id: 'kcl',
        unit: ['mEq'],
        conc: [2],
        osm: 4,
        potassium: 2,
        chloride: 2,
      }),
      naacet: new Additive({
        opts: self.opts,
        id: 'naacet',
        unit: ['mEq'],
        conc: [2],
        osm: 4,
        sodium: 2,
        acetate: 2,
      }),
      nabicarb: new Additive({
        opts: self.opts,
        id: 'nabicarb',
        unit: ['mEq'],
        conc: [1],
        osm: 2,
        sodium: 1,
        acetate: 1,
      }),
      nacl: new Additive({
        id: 'nacl',
        unit: ['mEq'],
        conc: [4],
        osm: 8,
        sodium: 4,
        chloride: 4,
      }),
      kphos: new Additive({
        opts: self.opts,
        id: 'kphos',
        unit: ['mmol', 'mEq'],
        conc: [3, 4.4],
        osm: 7.4,
        potassium: 4.4,
        phosphate: 3,
      }),
      naphos: new Additive({
        opts: self.opts,
        id: 'naphos',
        unit: ['mmol', 'mEq'],
        conc: [3, 4],
        osm: 12,
        sodium: 4,
        phosphate: 3,
      }),
      mv: new Additive({
        opts: self.opts,
        id: 'mv',
        unit: ['dose'],
        conc: [0.1],
        osm: 4.11,
      }),
      thia: new Additive({
        opts: self.opts,
        id: 'thia',
        name: 'thiamine',
        unit: ['mg'],
        conc: [100],
        osm: 0.62,
      }),
      folic: new Additive({
        opts: self.opts,
        id: 'folic',
        unit: ['mg'],
        conc: [5],
        osm: 0.2,
      }),
      cyan: new Additive({
        opts: self.opts,
        id: 'cyan',
        name: 'cyanocobalamin',
        unit: ['mcg'],
        conc: [1000],
        osm: 0.45,
      }),
      d50w: new Additive({
        opts: self.opts,
        id: 'd50w',
        unit: ['g'],
        conc: [0.5],
        osm: 2.52,
        dextrose: 0.5,
      }),
      aa: new Macro({
        opts: self.opts,
        id: 'aa',
        unit: ['g', 'mL'],
        conc: [0.1, 0.15],
        osm: [0.95, 1.383],
        phosphate: [0.01, 0.015], //is this actually the same? for AA15?
        sodium: [0.01, 0.015], //is this actually the same? for AA15?
        acetate: [0.089, 0.151],
      }),
      dex: new Macro({
        opts: self.opts,
        id: 'dex',
        unit: ['g', 'mL'],
        conc: [0.2, 0.3, 0.5, 0.7],
        osm: [1.01, 1.514, 2.523, 3.53],
        dextrose: [0.2, 0.3, 0.5, 0.7],
      }),
    };
    this.lytes = [
      this.components.dextrose,
      this.components.sodium,
      this.components.potassium,
      this.components.phosphate,
      this.components.calcium,
      this.components.magnesium,
      this.components.chloride,
      this.components.acetate,
      this.components.osmoles,
    ];
    this.fluids = [
      this.components.sw,
      this.components.d5w,
      this.components.d10w,
      this.components.d5ns,
      this.components.d5hns,
      this.components.d5qns,
      this.components.ns,
      this.components.hns,
      this.components.lr,
      this.components.d5lr,
    ];
    this.additives = [
      this.components.cacl,
      this.components.cagluc,
      this.components.mg,
      this.components.kacet,
      this.components.kcl,
      this.components.naacet,
      this.components.nabicarb,
      this.components.nacl,
      this.components.kphos,
      this.components.naphos,
      this.components.mv,
      this.components.thia,
      this.components.folic,
      this.components.cyan,
      this.components.d50w,
    ];
    this.macros = [
      this.components.aa,
      this.components.dex,
    ];
  }
  
};

class Ingredient {
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this._unit = obj.unit || ['mL'];
    this._conc = obj.conc || [1];
    this.lytes = {
      na: obj.sodium || 0,
      k: obj.potassium || 0,
      ca: obj.calcium || 0,
      cl: obj.chloride || 0,
      mg: obj.magnesium || 0,
      phos: obj.phosphate || 0,
      acet: obj.acetate || 0,
      dex: obj.dextrose || 0,
      osm: obj.osm || 0,
    };
    this.inputAmount = $(`#${obj.opts.id.pre}${obj.id}${obj.opts.id.inputAmount}`);
    this.outputVolume = $(`#${obj.opts.id.pre}${obj.id}${obj.opts.id.outputVolume}`);
    this.volume = 0;
  }
  get conc() {
    if ( this._conc.length > 1 ) {
      return this._conc[this.selectUnit[0].selectedIndex];
    }
    return this._conc[0];
  }
  get unit() {
    if ( this._unit.length > 1 ) {
      return this._unit[this.selectUnit[0].selectedIndex];
    }
    return this._unit[0];
  }
  get unit2() {
    if (this._unit.length > 1 ) {
      return this._unit[Math.abs(this.selectUnit[0].selectedIndex - 1)];
    }
    return undefined;
  }
  get conc2() {
    if (this._unit.length > 1 ) {
      return this._conc[Math.abs(this.selectUnit[0].selectedIndex - 1)];
    }
    return undefined;
  }
  get sodium() { return this.lytes.na * this.volume}
  get potassium() { return this.lytes.k * this.volume}
  get calcium() { return this.lytes.ca * this.volume}
  get chloride() { return this.lytes.cl * this.volume}
  get magnesium() { return this.lytes.mg * this.volume}
  get phosphate() { return this.lytes.phos * this.volume}
  get acetate() { return this.lytes.acet * this.volume}
  get dextrose() { return this.lytes.dex * this.volume}
  get osmoles() { return this.lytes.osm * this.volume}
}
class Fluid extends Ingredient {
  constructor(obj) {
    super(obj);
    this.isQS = false;
    this.qsCheckbox = $(`#${obj.opts.id.pre}${obj.id}${obj.opts.id.qsCheckbox}`);
  }
}
class Additive extends Ingredient {
  constructor(obj) {
    super(obj);
    if (obj.unit.length > 1) {
      this.selectUnit =  $(`#${obj.opts.id.pre}${obj.id}${obj.opts.id.selectUnit}`);
      this.outputConc = $(`#${obj.opts.id.pre}${obj.id}${obj.opts.id.outputConc}`);
      this.outputAmount = $(`#${obj.opts.id.pre}${obj.id}${obj.opts.id.outputAmount}`);
    }
  }
}
class Macro extends Ingredient {
  constructor(obj) {
    super(obj);
    this.lytes = {
      na: obj.sodium || Array(obj.conc.length).fill(0),
      k: obj.potassium || Array(obj.conc.length).fill(0),
      ca: obj.calcium || Array(obj.conc.length).fill(0),
      cl: obj.chloride || Array(obj.conc.length).fill(0),
      mg: obj.magnesium || Array(obj.conc.length).fill(0),
      phos: obj.phosphate || Array(obj.conc.length).fill(0),
      acet: obj.acetate || Array(obj.conc.length).fill(0),
      dex: obj.dextrose || Array(obj.conc.length).fill(0),
      osm: obj.osm || Array(obj.conc.length).fill(0),
    };
    this.selectUnit = $(`#${obj.id}-units`);
    this.selectConc = $(`#${obj.id}-macroConc`);
  }
  get conc() {
    if ( this._conc.length > 1 ) {
      return this._conc[this.selectConc[0].selectedIndex];
    }
    return this._conc[0];
  }
  get sodium() { return this.lytes.na[this.selectConc[0].selectedIndex] * this.volume }
  get potassium() { return this.lytes.k[this.selectConc[0].selectedIndex] * this.volume }
  get calcium() { return this.lytes.ca[this.selectConc[0].selectedIndex] * this.volume }
  get chloride() { return this.lytes.cl[this.selectConc[0].selectedIndex] * this.volume }
  get magnesium() { return this.lytes.mg[this.selectConc[0].selectedIndex] * this.volume }
  get phosphate() { return this.lytes.phos[this.selectConc[0].selectedIndex] * this.volume }
  get acetate() { return this.lytes.acet[this.selectConc[0].selectedIndex] * this.volume }
  get dextrose() { return this.lytes.dex[this.selectConc[0].selectedIndex] * this.volume }
  get osmoles() { return this.lytes.osm[this.selectConc[0].selectedIndex] * this.volume }
}


const everything = macros.concat(fluids.concat(additives));

// when qs base is checked, uncheck others, setAmount with current and old (if applicable)
$('.check-qs').on('change', function(ev) {
  const fluidID = ev.target.id.split('-', 1)[0];
  const oldQsObj = fluids.find( ({ isQS }) => isQS === true );
  const nonQS = fluids.filter( ({ id }) => id !== fluidID);
  nonQS.forEach(fluid => { fluid.isQS = false });
  const fluidObj = fluids.find( ({ id }) => id === fluidID );
  if (ev.target.checked) {
    fluidObj.isQS = true;
    $(`.check-qs:not(#${ev.target.id})`).prop( 'checked', false );
  } else {
    fluidObj.isQS = false;
  }
  if (oldQsObj) {
    setAmount(oldQsObj.id);
  }
  setAmount(fluidID);
});

$('.select-macroConc').on('change', function(ev) {
  setAmount(ev.target.id.split('-', 1)[0]);
});

$('.input-amount').on('keyup', function(ev) {
  setAmount(ev.target.id.split('-', 1)[0]);
});

$('.select-unit').on('change', function(ev) {
  const additiveID = ev.target.id.split('-', 1)[0];
  const obj = additives.find( ({ id }) => id === additiveID);
  obj.outputConc.html(`${roundTo(obj.conc, 0.001)} ${obj.unit}/mL`);
  setAmount(additiveID);
});

function setAmount(curID) {
  const obj = everything.find( ({ id }) => id === curID );
  const amt = +$(obj.inputAmount).val();
  const vol = roundTo(amt / obj.conc, 0.00000000001);
  if ( obj.outputAmount ) {
    obj.outputAmount.html(vol > 0 ? `${roundTo(vol * obj.conc2, 0.001)} ${obj.unit2}` : '');
  }
  // calculate volume if this is the qs base
  if ( !obj.isQS ) {
    obj.volume = vol;
  } else {
    const others = everything.filter(({ id }) => id !== curID);
    const otherVolume = others.reduce(sumVolume, 0);
    obj.volume = otherVolume >= vol ? 0 : vol - otherVolume;
  }
  // output the volume
  obj.outputVolume.html(amt > 0 ? `${roundTo(obj.volume, 0.1)} mL` : '');
  
  // if there is a qs base, recalculate its amounts
  const qsBase = fluids.find( ({ isQS }) => isQS === true );
  if ( qsBase ) {
    if ( qsBase.id !== curID ) {
      setAmount(qsBase.id);
    }
  }
  getTotals();
}

function getTotals() {
  const totalVolume = everything.reduce(sumVolume, 0);
  $('#total-volume').html(totalVolume > 0 ? `${roundTo(totalVolume, 0.1)} mL` : '');
  lytes.forEach(lyte => {
    const amt = lyte.total;
    if ( amt > 0 ) {
      lyte.outputTotal.html(`${roundTo(amt, lyte.roundingFactor)} ${lyte.unit}`);
      lyte.outputConc.html(`${roundTo(amt / (totalVolume / 1000), 0.1)} ${lyte.unit}/L`);
      if (lyte.mgPerUnit) {
        const conc = amt / totalVolume * (lyte.mgPerUnit / 10);
        lyte.outputPercent.html(`${roundTo(conc, lyte.percentRoundingFactor)}%`);
      }
    } else {
      lyte.outputTotal.html('');
      lyte.outputConc.html('');
      if (lyte.mgPerUnit) {
        lyte.outputPercent.html('');
      }
    }
  });

  // move the osmolarity indicator and highlight the osmolarity category
  const finOsm = osmoles.total / (totalVolume / 1000);
  if ( finOsm > 0 ) {
    const pos = `${roundTo(  finOsm / 1000  * 100, 0.0001 )  }%`;
    $('.marker-current').css({ 'left': pos, 'display': 'block' });
    if (finOsm > 1000) {
      $('.marker-current').css({ 'transform': 'translateX(-5px) rotate(-45deg)' });
    } else {
      $('.marker-current').css({ 'transform': 'translateX(-5px) rotate(45deg)' });
    }
  } else {
    $('.marker-current').css({ 'display': 'none' });
  }
  $('.osm-flag').removeClass('active');
  let highlightClass = '.osm-flag--';
  highlightClass += finOsm > 900 ? 'hyper2' :
    finOsm > 500 ? 'hyper1' :
      finOsm > 280 ? 'iso'    :
        finOsm > 154 ? 'hypo2'  :
          finOsm > 0 ? 'hypo1' : '';
  if ( finOsm > 0 ) {
    $(highlightClass).addClass('active');
  }

  // Calcium-Phosphate Solubility
  const volLiters = totalVolume / 1000;
  const caAmt = cacl.volume * 1.36 + cagluc.volume * 0.47; //mEq
  const phosAmt1 = kphos.volume * 4.4 + naphos.volume * 4; //mEq
  const freamine = aa.volume * aa.conc * 0.13;
  const solubility1 = caAmt / volLiters * ( (phosAmt1 + freamine) / volLiters );
  const phosAmt2 = (kphos.volume + naphos.volume) * 3 + aa.phosphate * aa.volume; //mmol
  const solubility2 = (caAmt + phosAmt2) / volLiters;
  $('#solu-value-1').html(solubility1 > 0 ? roundTo(solubility1, 1) : '');
  $('#solu-value-2').html(solubility2 > 0 ? roundTo(solubility2, 1) : '');
  $('#solu-slider-1').val(solubility1 > 0 ? solubility1 : 0);
  $('#solu-slider-2').val(solubility2 > 0 ? solubility2 : 0);

  if (solubility1 === 0) {
    $('#solu-slider-2').val(0);
  }
  
  $('.solu-wrapper').removeClass('warning danger');
  // solu-wrapper-1, 2 addClass warning/danger
  
  if ( solubility1 >= 1200 ) {
    $('.solu-wrapper-1').addClass('danger');
  } else if ( solubility1 >= 300 ) {
    $('.solu-wrapper-1').addClass('warning');
  }
  
  if ( solubility2 >= 60 && solubility1 > 0 ) {
    $('.solu-wrapper-2').addClass('danger');
  } else if ( solubility2 >= 30 && solubility1 > 0) {
    $('.solu-wrapper-2').addClass('warning');
  }
}

function roundTo(x, n) {
  let t = Math.round(x / n) * n;
  t = Math.floor(t * 1000);
  t = t / 1000;
  return t;
}
/*

//-------------------------------------------------------------
function resetAll() {

  slideSolu1.value = 0;
  slideSolu2.value = 0;
  document.documentElement.style.setProperty('--slide-2-color', 'darkgreen');
  var ins = document.getElementsByTagName('input');
  var outs = document.getElementsByClassName('output');
  var combos = document.getElementsByTagName('select');
  currentMarker.style.display = "none";

  for(i=0;i<outs.length;i++){
    outs[i].innerHTML = "";
  }

  for(i=0;i<combos.length;i++){
    combos[i].selectedIndex = 0;
  }

  for(i=0;i<ins.length;i++){
    if(ins[i].type == "text") {
      ins[i].value = "";
    } else if (ins[i].type == "checkbox") {
      ins[i].checked = false;
    }
  }
  setColor('z');
  aa.inputAmount.focus();
}
*/