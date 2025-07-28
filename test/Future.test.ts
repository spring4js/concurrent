import Future from '../../src/concurrent/Future'

test('Future-正常', async () => {
  const future = new Future<any>('正常')
  const test = expect(future.get()).resolves.toBe(1)
  future.resolve(1)
  await test
})
test('Future-异常', async () => {
  const future = new Future<any>('异常')
  const test = expect(future.get()).rejects.toThrow('异常结果')
  future.reject(new Error('异常结果'))
  await test
})

test('Future-超时报错', async () => {
  const future = new Future<any>('超时').setTaskTimeout(500)
  const test = expect(future.get()).rejects.toThrow('Future超时: 超时')
  await test
})
test('Future-串联', async () => {
  const future1 = new Future<any>('串联1')
  const future2 = new Future<any>('串联2')
  const last = Future.all([future1, future2]).then(([r1, r2]) => {
    return `final: ${r1} ${r2}`
  })
  const test = expect(last).resolves.toBe('final: 1 2')
  future1.resolve(1)
  future2.resolve(2)
  await test
})
