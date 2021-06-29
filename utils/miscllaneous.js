const secureGlobal = (name, obj) => {
    Object.defineProperty(global, name, {
      value: obj,
      writable: false
    });
}

module.exports = {
    secureGlobal,
}