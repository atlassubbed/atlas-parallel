const { describe, it } = require("mocha")
const { expect } = require("chai")
const { makeAsyncJob } = require("./util")
const parallel = require("../src/parallel")

// default placeholder test
describe("parallel", function(){

  const job1 = makeAsyncJob(20, "result1")
  const job2 = makeAsyncJob(200, "result2")
  const job3 = makeAsyncJob(0, "result3", true)

  it("throws an error if not passed an array or object literal", function(){
    const problemArgs = [true, 22/7, 5, done => {}, "str", /reg/, new Date()]
    problemArgs.forEach(arg => {
      expect(() => parallel(arg)).to.throw("requires []/{} of jobs")
    })
  })
  describe("works with a dictionary of functions (return values)", function(){
    it("should run each function in parallel", function(testDone){
      let numRunning = 0;
      parallel({
        job1: done => {
          expect(++numRunning).to.equal(1)
          job1(() => {
            done(null, numRunning--)
          })
        },
        job2: done => {
          expect(++numRunning).to.equal(2)
          job2(() => {
            done(null, numRunning--)
            testDone()
          })
        }
      })
    })
    it("should call the callback when all functions are done", function(testDone){
      let numRunning = 2;
      parallel({
        job1: done => {
          job1(() => {
            done(null, numRunning--)
          })
        },
        job2: done => {
          job2(() => {
            done(null, numRunning--)
          })
        }
      }, () => {
        expect(numRunning).to.equal(0)
        testDone()
      })
    })
    it("should run all functions regardless of errors", function(testDone){
      let numRan = 0, numErr = 0;
      parallel({
        job3: done => {
          numRan++, job3(err => {
            expect(err).to.be.an('error')
            expect(numRan).to.equal(2)
            numErr++
            done(err)
          })
        },
        job2: done => {
          numRan++, job2(err => {
            expect(err).to.be.null;
            expect(numRan).to.equal(2)
            expect(numErr).to.equal(1)
            done(err)
            testDone()
          })
        }
      })
    })
    it("should report the results or errors for each function", function(testDone){
      parallel({job1, job2, job3}, (errs, results) => {
        expect(errs.job1).to.be.undefined
        expect(errs.job2).to.be.undefined
        expect(errs.job3).to.be.an("error")
        expect(errs.job3.message).to.equal("result3")
        expect(results.job1).to.equal("result1")
        expect(results.job2).to.equal("result2")
        expect(results.job3).to.be.undefined
        testDone()
      })
    })
  })
  describe("works with an array of subroutines (no return values)", function(){
    it("should run each subroutine in parallel", function(testDone){
      let numRunning = 0;
      parallel([
        done => {
          expect(++numRunning).to.equal(1)
          job1(() => {
            done(null, numRunning--)
          })
        },
        done => {
          expect(++numRunning).to.equal(2)
          job2(() => {
            done(null, numRunning--)
            testDone()
          })
        }
      ])
    })
    it("should call the callback when all subroutines are done", function(testDone){
      let numRunning = 2;
      parallel([
        done => {
          job1(() => {
            done(null, numRunning--)
          })
        },
        done => {
          job2(() => {
            done(null, numRunning--)
          })
        }
      ], () => {
        expect(numRunning).to.equal(0)
        testDone()
      })
    })
    it("should run all subroutines regardless of errors", function(testDone){
      let numRan = 0, numErr = 0;
      parallel([
        done => {
          numRan++, job3(err => {
            expect(err).to.be.an('error')
            expect(numRan).to.equal(2)
            numErr++
            done(err)
          })
        },
        done => {
          numRan++, job2(err => {
            expect(err).to.be.null;
            expect(numRan).to.equal(2)
            expect(numErr).to.equal(1)
            done(err)
            testDone()
          })
        }
      ])
    })
    it("should not return any results for subroutines", function(testDone){
      parallel([job1, job2], (errs, results) => {
        expect(results).to.be.undefined
        testDone()
      })
    })
    it("should return empty list if there are no errors", function(testDone){
      parallel([job1, job2], (errs, results) => {
        expect(errs).to.be.an("array").which.is.empty
        testDone()
      })
    })
    it("should report a list of errors, if there are errors", function(testDone){
      parallel([job1, job2, job3], (errs, results) => {
        expect(errs).to.be.an("array").with.lengthOf(1)
        expect(errs[0]).to.be.an("error")
        expect(errs[0].message).to.equal("result3")
        testDone()
      })
    })
  })
})
