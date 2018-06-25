const makeAsyncJob = (timeout, result, hasError) => done => {
  setTimeout(() => {
    done(hasError ? new Error(result) : null, hasError ? undefined : result)
  }, timeout)
}

module.exports = { makeAsyncJob }
