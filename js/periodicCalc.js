/**
 * Periodic Table Calculation Module
 * @module periodicCalc
 * @since v1.4.1
 */
//TODO: typedef for periodic table
const periodicTable = require('../lib/periodicTable.json');

/**
 * Looks up the valence of an element or compound
 * 
 * @param {String} molecule element or compound
 * @returns {Number} valence of the provided element or compound
 */
export function getValence(molecule) {
  if ( Object.keys(periodicTable.elements).includes(molecule) ) {
    return periodicTable.elements[molecule].valence;
  }
  if ( Object.keys(periodicTable.compounds).includes(molecule) ) {
    return periodicTable.compounds[molecule].valence;
  }
  return undefined;
}

/**
 * Converts from mg to mmol
 * 
 * @param  {number} mg     Milligrams
 * @param  {number} mass   Molar mass of compound
 * @return The amount of the compound in mmol
 */
export function mg2mmol(mg, mass) {
  if ( mg === undefined || mass === undefined || mg === 0 || mass === 0 ) return undefined;
  return mg / mass;
}

/**
 * Converts from mg to mEq
 * 
 * @param  {number} mg      Milligrams
 * @param  {number} mass    Molar mass of compound
 * @param  {number} valence Valence of compound
 * @return The amount of the compound in mEq
 */
export function mg2meq(mg, mass, valence) {
  if ( mg === undefined || mass === undefined || valence === undefined ||
        mg === 0 || mass === 0 || valence === 0 ) return undefined;
  return mg / mass * valence;
}


/**
 * Calculates the elemental percent of a given element in a given molecule.
 *
 * @param {string} molecule   The molecular formula of the whole molecule.
 * @param {string} primary    The element in question.
 * @return The elemental percent of the given element in the given molecule.
 */
export function elemental(molecule, primary) {

  if ( molecule === "" || molecule === undefined || primary === "" || primary === undefined  ) return undefined;

  const mass = getAtomicMass(molecule);
  const elemMass = getAtomicMass(molecule, primary);
 
  return elemMass / mass;

}

/**
 * Calculates the atomic mass of a molecule
 *
 * @param {string}  molecule    The molecular formula.
 * @param {string} [element]    Optional - Only get the mass of this element
 * @return The atomic mass.
 */

export function getAtomicMass(molecule, element) {
    
  let myMass = 0;
  let addWater = 0;
  if (/\.(\d*)H2O/.test(molecule)) {
    addWater = molecule.match(/\.(\d*)H2O/)[1];
    molecule = `${molecule.replace(/\.\d*H2O/, '')  }(H2O)${  addWater}`;
  }
  let expanded = molecule.replace(/\(\w+\)\d*/g, '');
  if ( /\(\w+\)\d*/.test(molecule) ) {
    const arrMolecule1 = [...molecule.match(/\(\w+\)\d*/g)];
    arrMolecule1.forEach( mol => {
      const atoms = mol.match(/\((\w+)\)/)[1];
      let qty = 1;
      if ( /\)(\d+)/.test(mol) ) {
        qty = mol.match(/\)(\d*)/)[1];
      }
      for (let i = 0; i < qty; i++ ) {
        expanded += atoms;
      }
    });
  }
  const arrMolecule = [...expanded.match(/[A-Z]{1}[a-z]{0,1}\d*/g)];
  arrMolecule.forEach(atom => {
    const sym = atom.match(/[A-Za-z]{1,2}/)[0];
    let qty = atom.match(/\d+/);
    if ( qty === null ) {
      qty = 1;
    } else {
      qty = +qty[0];
    }
    if ( element === undefined || sym === element ) {
      myMass += periodicTable.elements[sym].mass * qty;
    }
  });
  return myMass;
}