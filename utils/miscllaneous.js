const secureGlobal = (name, obj) => {
    Object.defineProperty(global, name, {
      value: obj,
      writable: false
    });
}

const createResponse = (msg, data, error) => {
  return { error, data, msg, success: !error };
};

module.exports = {
    secureGlobal,
    createResponse
}