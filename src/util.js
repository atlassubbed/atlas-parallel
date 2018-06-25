const isArr = Array.isArray
const isObj = obj => obj && typeof obj === "object" && toString.call(obj) === "[object Object]"

module.exports = { isArr, isObj }
