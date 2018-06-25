const { isArr, isObj } = require("./util")

module.exports = (jobs, cb) => {
  const isA = isArr(jobs)
  if (!isA && !isObj(jobs)) throw new Error("requires []/{} of jobs");
  let n = isA ? jobs.length : Object.keys(jobs).length;
  let errs = isA ? [] : {}, results = isA ? undefined : {};
  for (let k in jobs) jobs[k]((err, res) => {
    if (err) isA ? errs.push(err) : (errs[k] = err);
    else if (!isA) results[k] = res;
    if (!--n) cb && cb(errs, results)
  })
}
