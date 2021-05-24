export function log() {
  // eslint-disable-next-line no-unused-expressions,no-undef,no-console
  !PRODUCTION && console.log.apply(null, arguments);
}

export function split(str, delimiter) {
  const pos = str.indexOf(delimiter);
  return [str.substr(0, pos), str.substr(pos + 1)];
}
