exports.setItem = function setItem(key, value, persist) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  if (persist) {
    localStorage.setItem(key, value);
  } else {
    sessionStorage.setItem(key, value);
  }
};

exports.getItem = function getItem(key) {
  const value = localStorage.getItem(key) || sessionStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

exports.clear = function clear() {
  localStorage.clear();
  sessionStorage.clear();
};
