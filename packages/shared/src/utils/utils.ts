const sizeUnits = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"] as const;

export function humanReadableSize(bytes: number) {
  if (bytes == 0) return "0 " + sizeUnits[0];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizeUnits.length - 1);
  const size = (bytes / Math.pow(1024, exponent)).toFixed(2);
  return `${size} ${sizeUnits[exponent]}`;
}
