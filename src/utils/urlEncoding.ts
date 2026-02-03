import pako from "pako";

const CUSTOM_CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789áàäãâóòôöõÖÕúùûüÚÙÛÜñÑœŒÿŸἰἱἲἳἴἵἶἷÍÌÎÏąćĉċçéèêëабвгдеёжзийклмнопрстуфхцчшщъыьэюя:?&=+#%-{}|[]";

const BASE = BigInt(CUSTOM_CHARSET.length);

const CHAR_TO_INT_MAP: Map<string, bigint> = (() => {
  const map = new Map<string, bigint>();
  for (let i = 0; i < CUSTOM_CHARSET.length; i++) {
    map.set(CUSTOM_CHARSET[i], BigInt(i));
  }
  return map;
})();

function compress(data: Uint8Array): Uint8Array {
  return pako.deflate(data, { level: 9 });
}

export function encode(url: string): string {
  if (url.length === 0) return "";

  const utf8 = new TextEncoder().encode(url);
  const compressed = compress(utf8);

  const prefixed = new Uint8Array(compressed.length + 1);
  prefixed[0] = 1;
  prefixed.set(compressed, 1);

  let number = BigInt("0x" + Buffer.from(prefixed).toString("hex"));

  let encoded = "";
  while (number > 0n) {
    const remainder = number % BASE;
    encoded = CUSTOM_CHARSET[Number(remainder)] + encoded;
    number /= BASE;
  }

  return encoded;
}