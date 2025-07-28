import MutexLock from '../../src/concurrent/MutexLock'
import delay from '../../src/utils/delay'

test('mutex-lock-normal', async () => {
  const mutex = new MutexLock()
  let lock1GetTime = 0
  let lock2GetTime = 0
  const lock1 = mutex.lock()
  const lock2 = mutex.lock()
  lock1.then(() => (lock1GetTime = Date.now()))
  lock2.then(() => (lock2GetTime = Date.now()))

  await delay(100)
  const lock1ReleaseTime = Date.now()
  mutex.unlock()
  await lock1
  await lock2
  expect(lock2GetTime >= lock1ReleaseTime).toBe(true)
})

test('mutex-lock-try', async () => {
  const mutex = new MutexLock()

  const lock1 = mutex.tryLock()
  const lock2 = mutex.tryLock()

  expect(lock1).toBe(true)
  expect(lock2).toBe(false)
  mutex.unlock()
  expect(mutex.tryLock()).toBe(true)
})
