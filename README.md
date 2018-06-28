# atlas-parallel

Run async functions in parallel with an onDone callback.

[![Travis](https://img.shields.io/travis/atlassubbed/atlas-parallel.svg)](https://travis-ci.org/atlassubbed/atlas-parallel)

---

## install

```
npm install --save atlas-parallel
```

## why

For a lot of applications, all I need is a simple parallel function runner and I don't wanna import something like async or q, because I rarely use any of the other functions. This package is literally just a parallel runner and nothing else. In other words, it will run N async functions in (roughly) the time it takes to run the one with the highest latency.

## examples

Usage is pretty simple -- just pass in a collection of jobs (which each take a `done` callback) and an `allDone` callback. The `allDone` callback is called after each of the `done` callbacks have been called.

#### dictionary of jobs

You can pass in a hash of name -> job pairs and the end result will be a hash of name -> err pairs and/or a hash of name -> result pairs:

```javascript
const parallel = require("atlas-parallel");
const jobs = {
  sendEmail: done => {
    email.send("atlassubbed@gmail.com", "hello", err => {
      err ? done(err) : done(null, "success")
    })
  },
  postPic: done => reddit.post("atlassubbed.png", "mildlyinteresting", err => {
    err ? done(err) : done(null, "success")
  })
}
parallel(jobs, (errs, res) => {
  // all done!
  // errs === {sendEmail: null, postPic: null}
  // res === {sendEmail: "success", postPic: "success"}
})
```

#### array of jobs

If you don't care that much about return values, it is much more concise to use an array of jobs:

```javascript
...
parallel([
  done => email.send("atlassubbed@gmail.com", "hello", done),
  done => reddit.post("atlassubbed.png", "mildlyinteresting", done)
], errs => {
  // all done!
  // errs === [] on success
  // errs === [err2] if job2 fails
  // errs === [err1, err2] if both fail
})
```

## caveats

If you need to keep track of specific errors and return values, use a dictionary of jobs instead of an array. If you forget to call `done` on one of your jobs, your `allDone` callback will never be called. I haven't implemented any timeout feature -- this could easily be implemented externally and is outside the scope of this package.