export function makeString(len: number): string {
  let outString: string = "";
  let inOptions: string = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  return outString;
}

export function makeRandomMAC(): string {
  let out = "";
  let opts = "0123456789ABCDEF";

  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += ":";
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += ":";
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += ":";
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += ":";
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += ":";
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  out += opts.charAt(Math.floor(Math.random() * opts.length));
  return out;
}
