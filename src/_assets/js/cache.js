exports.setItem= function(key, value) {
  if(typeof value === 'object') {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
};

exports.getItem= function(key) {
  let value = localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch(e) {
    return value;
  }
};

exports.clear = function() {
  localStorage.clear();
};
