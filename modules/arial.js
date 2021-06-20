function test(target){
    const chars = ["I","R","T",".","a","e","f","o","s","t","u"];
    let txt = "";
    for ( let char of chars ) {
      txt += `<span style="white-space:nowrap">${char.repeat(100)}</span><br>`
    }
    document.getElementById(target).innerHTML = txt;
}

const charWidths = {
  "L": 8.1478,
  "I": 4.0731,
  "R": 10.587,
  "T": 8.955,
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
  "/": 4.0731,
  " ": 4.0731,
  " ": 4.0731,
  "-": 4.882,
  ".": 4.0731,
  "+": 8.5613,
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
  "u": 8.1533
};
function getWidth(str){
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
export default { padArray };
