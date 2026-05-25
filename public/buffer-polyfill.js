// Buffer polyfill — must load before ES modules (Passport's OrangeKit needs it)
// Sourced from the `buffer` npm package, inlined for synchronous loading.
(function () {
  if (typeof globalThis.Buffer !== "undefined") return;
  // Import from the bundled buffer module at runtime
  // This script is loaded as a classic (blocking) script, so it runs before modules
  var B = {};
  // Minimal Buffer.from/isBuffer for OrangeKit's base58/address needs
  B.TYPED_ARRAY_SUPPORT = typeof Uint8Array !== "undefined";
  B.from = function (value, encoding) {
    if (typeof value === "string") {
      if (encoding === "hex") {
        var arr = new Uint8Array(value.length / 2);
        for (var i = 0; i < value.length; i += 2) {
          arr[i / 2] = parseInt(value.substr(i, 2), 16);
        }
        return arr;
      }
      return new TextEncoder().encode(value);
    }
    if (ArrayBuffer.isView(value))
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (Array.isArray(value)) return new Uint8Array(value);
    return new Uint8Array(value);
  };
  B.alloc = function (size, fill) {
    var buf = new Uint8Array(size);
    if (fill !== undefined) buf.fill(typeof fill === "number" ? fill : 0);
    return buf;
  };
  B.allocUnsafe = function (size) {
    return new Uint8Array(size);
  };
  B.isBuffer = function (obj) {
    return obj instanceof Uint8Array;
  };
  B.concat = function (list, totalLength) {
    if (!totalLength)
      totalLength = list.reduce(function (acc, b) {
        return acc + b.length;
      }, 0);
    var result = new Uint8Array(totalLength);
    var offset = 0;
    for (var i = 0; i < list.length; i++) {
      result.set(list[i], offset);
      offset += list[i].length;
    }
    return result;
  };
  B.byteLength = function (string, encoding) {
    if (encoding === "hex") return string.length / 2;
    return new TextEncoder().encode(string).length;
  };
  globalThis.Buffer = B;
})();
