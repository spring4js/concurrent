import ResourceConcurrentEliminator from '../../src/concurrent/ResourceConcurrentEliminator'
import delay from '../../src/utils/delay'


test('并发请求顺序处理', async () => {
  const eliminator = new ResourceConcurrentEliminator()
  let first = 0
  let second = 0
  let third = 0
  const p = Promise.all([
    eliminator.schedule('1', async () => {
      first = Date.now()
      await delay(1500)
    }),
    eliminator.schedule('1', async () => {
      second = Date.now()
      await delay(1000)
    }),
    eliminator.schedule('2', async () => {
      third = Date.now()
      await delay(1000)
    })])
  expect(Object.keys(eliminator.semaphoreMap).length).toBe(2)
  await p
  expect(second - first > 1400).toBe(true)
  expect(third - first < 10).toBe(true)
  // 请求处理结束后，信号量被清理
  expect(Object.keys(eliminator.semaphoreMap).length).toBe(0)
})

