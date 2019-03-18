module.exports = {
  resolveUrl(host, path) {
    return `${host}/${path}`.replace(/\/\//g, `/`);
  },
  resolveZipFileName(name) {
    return /\.zip$/.test(name) ? name : `${name}.zip`;
  },
  isEmpty(obj) {
    for(let i in obj) return false;
    return true;
  }
}