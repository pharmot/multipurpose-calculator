/**
 * Module for spacing text output (in Arial font) to optimize formatting of
 * admin instructions to copy and paste to Epic.
 *
 * @author Andy Briggs <andrewbriggs@chifranciscan.org>
 * @since v0.2.0
 * Created at     : 2021-06-20
 * Last modified  : 2021-08-25
 */

 function test(target){
    const chars = ["I","R","T",".","a","e","f","o","s","t","u"];
    let txt = "";
    for ( let char of chars ) {
      txt += `<span style="white-space:nowrap">${char.repeat(100)}</span><br>`
    }
    document.getElementById(target).innerHTML = txt;
}

const charWidths = {
  // widths of character at 14.66667px (11pt)
    "/": 4.0731,
    " ": 4.0731,
    " ": 4.0731,
    "∙": 4.0731,
    "⋅": 4.1375,
    "-": 4.882,
    "–": 8.1533,
    "—": 14.66,
    ".": 4.0731,
    "+": 8.5613,
    ":": 4.0731,
    "'": 2.7989,
    "|": 3.8083,
    ",": 4.0731,
    ";": 4.0731,
    "[": 4.0731,
    "]": 4.0731,
    "`": 4.882,
    "(": 4.882,
    ")": 4.882,
    "{": 4.8963,
    "}": 4.8963,
    "*": 5.7052,
    "^": 6.8791,
    "?": 8.1533,
    "#": 8.1533,
    "$": 8.1533,
    "_": 8.1533,
    "~": 8.5613,
    "<": 8.5613,
    ">": 8.5613,
    "=": 8.5613,
    "&": 9.7781,
    "%": 13.0352,
    "@": 14.882,
    "A": 9.7781,
    "B": 9.7781,
    "C": 10.587,
    "D": 10.587,
    "E": 9.7781,
    "F": 8.955,
    "G": 11.4031,
    "H": 10.587,
    "I": 4.0731,
    "J": 7.33,
    "K": 9.7781,
    "L": 8.1478,
    "M": 12.212,
    "N": 10.587,
    "O": 11.4031,
    "P": 9.7781,
    "Q": 11.4031,
    "R": 10.587,
    "S": 9.7781,
    "T": 8.955,
    "U": 10.587,
    "V": 9.7781,
    "W": 13.8369,
    "X": 9.7781,
    "Y": 9.7781,
    "Z": 8.955,
    "1": 7.0761,
    "2": 8.1533,
    "3": 8.1533,
    "4": 8.1533,
    "5": 8.1533,
    "6": 8.1533,
    "7": 8.1533,
    "8": 8.1533,
    "9": 8.1533,
    "0": 8.1533,
    "a": 8.1533,
    "e": 8.1533,
    "f": 3.8109,
    "g": 8.1533,
    "h": 8.1533,
    "i": 3.257,
    "k": 7.33,
    "m": 12.212,
    "n": 8.1533,
    "o": 8.1533,
    "r": 4.882,
    "s": 7.33,
    "t": 4.0731,
    "u": 8.1533,
    "b": 8.1533,
    "c": 7.33,
    "d": 8.1533,
    "j": 3.257,
    "l": 3.257,
    "p": 8.1533,
    "q": 8.1533,
    "v": 7.33,
    "w": 10.587,
    "x": 7.33,
    "y": 7.33,
    "z": 7.33,
    "₀": 4.3952,
    "₁": 4.3952,
    "₂": 4.3952,
    "₃": 4.3952,
    "₄": 4.3952,
    "₅": 4.3952,
    "₆": 4.3952,
    "₇": 4.3952,
    "₈": 4.3952,
    "₉": 4.3952,
    "₊": 4.9608,
    "₋": 4.9608,
    "₌": 4.9608,
    "₍": 2.9278,
    "₎": 2.9278,
    "ₐ": 5.4547,
    "ₑ": 5.4475,
    "ₒ": 5.5333,
    "ₓ": 4.8103,
    "ₔ": 5.4475,
    "ₕ": 4.3952,
    "ₖ": 4.3952,
    "ₗ": 2.4409,
    "ₘ": 6.8433,
    "ₙ": 4.3952,
    "ₚ": 4.3952,
    "ₛ": 3.4217,
    "ₜ": 2.4409,
    "⁰": 4.882,
    "¹": 4.882,
    "²": 4.882,
    "³": 4.882,
    "⁴": 4.882,
    "⁵": 4.882,
    "⁶": 4.882,
    "⁷": 4.882,
    "⁸": 4.882,
    "⁹": 4.882,
    "⁺": 4.9608,
    "⁻": 4.9608,
    "⁼": 4.9608,
    "⁽": 2.9278,
    "⁾": 2.9278,
    "ⁿ": 5.3472,
    "ⁱ": 2.4409
};
function getWidth(str){
    str += "";
    const arr = str.split("");
    let w = 0;
    for ( let i=0;i<arr.length;i++ ){
      if( charWidths[arr[i]] === undefined ) {
        console.error(`No width defined for ${arr[i]}`);
      }
      w += parseFloat(charWidths[arr[i]]);
    }
    return w;
}
function padArray(rows, extra=4){
  const spaceWidth = charWidths[" "];
  const widths = rows.map( str => getWidth(str) );
  const max = Math.max(...widths);
  const pads = widths.map( width => {
    const padWidth = Math.round( (max - width)/spaceWidth) + extra;
    return ("&nbsp;").repeat(padWidth);
  });
  let result = [];
  for(let i=0;i<rows.length;i++){
    result.push(rows[i]+pads[i]);
  }
  return result;
}
/**
 * Returns a divider the length of a given string.
 * @since v0.2.3
 *
 * @param   {String}  str           The string to be underlined
 * @param   {String} [char = "-"]   The character to use as the divider
 * @param   {Number} [extra = 0]    Number of extra characters to add beyond the length of the string
 * @returns {String}                The 'char' repeated to be the same length as 'str' plus 'extra' extra times
 */
function underline(str, char="-", extra=0){
  const dividerWidth = getWidth(char);
  const titleWidth = getWidth(str);
  const dividers = Math.round(titleWidth/dividerWidth)+extra;
  return char.repeat(dividers);
}
export default { padArray, underline };
