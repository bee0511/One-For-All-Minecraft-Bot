function rTextNoColor(jsonm) {
  let result = "";
  itrText(jsonm);
  function itrText(jsonms) {
    for (let i in jsonms) {
      if (Array.isArray(jsonms[i])) {
        itrText(jsonms[i]);
      } else {
        if (i == "text") {
          result += jsonms[i];
        } else {
          if (typeof jsonms[i] == "boolean") continue;
          else if (typeof jsonms[i] == "string") continue;
          itrText(jsonms[i]);
        }
      }
    }
  }
  return result;
}

module.exports = { rTextNoColor };
