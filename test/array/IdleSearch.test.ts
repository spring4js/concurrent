import IdleSearch from '../../../src/concurrent/array/IdleSearch'
import { isArraySame } from '../../utils'

test('array-search-1', async () => {
  const idleSearch = new IdleSearch<any>('search')
  idleSearch.init([1, 2, 3, 4, 5], (item) => {
    return [2, 4].includes(item)
  })
  const result = await idleSearch.search()
  const isSame = isArraySame(result, [2, 4])
  expect(isSame).toBe(true)
  expect(idleSearch.getSchedulingTimes()).toBe(1)
})

test('array-search-2', async () => {
  const idleSearch = new IdleSearch<any>('search')
  idleSearch.init([1, 2, 3, 4, 5], (item) => {
    if (item === 1) {
      const start = Date.now()
      while (Date.now() - start < 50) {
        // 循环  出发 requestIdle 再次调用
      }
    }
    return [2, 4].includes(item)
  })
  const result = await idleSearch.search()
  const isSame = isArraySame(result, [2, 4])
  expect(isSame).toBe(true)
  expect(idleSearch.getSchedulingTimes()).toBe(2)
})

test('array-search-abort', async () => {
  const idleSearch = new IdleSearch<any>('search')
  idleSearch.init([1, 2, 3, 4, 5], (item) => {
    return [2, 4].includes(item)
  })
  idleSearch.abort()
  await expect(idleSearch.search()).rejects.toThrow('abort')
})
