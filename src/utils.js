export function log() {
  // eslint-disable-next-line no-unused-expressions,no-undef,no-console
  !PRODUCTION && console.log.apply(null, arguments);
}

/**
 * Overwrites all the values in 'a' by values
 * in 'b' and returns a new object containing
 * new values.
 *
 * @param {Object} a Object in which overwrites will happen
 * @param {Object} b Object from which new values will be taken
 */
export function updateDefaults(a, b) {
  const temp = {};

  Object.keys(a).forEach((key) => {
    // eslint-disable-next-line no-prototype-builtins
    temp[key] = b.hasOwnProperty(key) ? b[key] : a[key];
  });
  return temp;
}

export function split(str, delimiter) {
  const pos = str.indexOf(delimiter);
  return [str.substr(0, pos), str.substr(pos + 1)];
}
