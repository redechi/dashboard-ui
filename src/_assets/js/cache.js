exports.setItem = function(key, value, persist) {
  if(typeof value === 'object') {
    value = JSON.stringify(value);
  }
  if(persist) {
    localStorage.setItem(key, value);
  } else {
    sessionStorage.setItem(key, value);
  }

};

exports.getItem = function(key) {
  let value = localStorage.getItem(key) || sessionStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch(e) {
    return value;
  }
};

exports.clear = function() {
  localStorage.clear();
  sessionStorage.clear();
};
