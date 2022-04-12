// https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
export function numberShortener(value) {
  let newValue = value;
  let calcValue = Math.round(value * 100) / 100;
  if (parseFloat(value) >= 1000) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const suffixNum = Math.floor(('' + calcValue).length / 3) - 1;
    let shortValue = '';
    for (let precision = 4; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum !== 0 ? calcValue / Math.pow(1000, suffixNum) : calcValue).toPrecision(precision),
      );
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
      if (dotLessShortValue.length <= 4) {
        break;
      }
    }
    if (shortValue % 1 !== 0) shortValue = shortValue.toFixed(2);
    newValue = shortValue + suffixes[suffixNum];
    return newValue;
  } else {
    return calcValue;
  }
}
