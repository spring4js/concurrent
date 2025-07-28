import { TreeInfo } from '../../../src/concurrent/tree/TreeInfo'
import { NormalTree } from './data'
import { FilterResult, IdleTreeSearch } from '../../../src/concurrent/tree/IdleTreeSearch'
import { getTreeDeepFirst, isArraySame } from '../../utils'

test('tree-search-all-1', async () => {
  const treeInfo = new TreeInfo<any>({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })

  const treeSearch = new IdleTreeSearch<any>('search')
  treeSearch.init({
    treeInfo,
    filterFn: (item, nodeInfo) => {
      if (item.id === '5') {
        return FilterResult.SubTreeMatch
      }
      if (item.id === '10') {
        return FilterResult.CurrentMatch
      }
      return FilterResult.NotMatch
    },
    childrenKey: 'children',
  })
  const resultTree = await treeSearch.search()
  const search = getTreeDeepFirst(resultTree)
  const reals = ['1', '3', '5', '8', '9', '7', '10']
  expect(isArraySame(search, reals)).toBe(true)
  expect(treeSearch.getSchedulingTimes()).toBe(1)
})
// request idle调度多次
test('tree-search-all-2', async () => {
  const treeInfo = new TreeInfo<any>({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })

  const treeSearch = new IdleTreeSearch<any>('search')
  treeSearch.init({
    treeInfo,
    filterFn: (item, nodeInfo) => {
      if (item.id === '1' || item.id === '7') {
        const start = Date.now()
        while (Date.now() - start < 50) {
          // 循环  出发 requestIdle 再次调用
        }
      }
      if (item.id === '5') {
        return FilterResult.SubTreeMatch
      }
      if (item.id === '10') {
        return FilterResult.CurrentMatch
      }
      return FilterResult.NotMatch
    },
    childrenKey: 'children',
  })
  const resultTree = await treeSearch.search()
  const search = getTreeDeepFirst(resultTree)
  const reals = ['1', '3', '5', '8', '9', '7', '10']
  expect(isArraySame(search, reals)).toBe(true)
  expect(treeSearch.getSchedulingTimes()).toBe(3)
})

test('tree-search-max-cnt', async () => {
  const treeInfo = new TreeInfo<any>({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })

  const treeSearch = new IdleTreeSearch<any>('search')
  treeSearch.init({
    treeInfo,
    filterFn: (item, nodeInfo) => {
      if (item.id == '2') {
        return FilterResult.CurrentMatch
      }
      if (item.id === '5') {
        return FilterResult.SubTreeMatch
      }
      if (item.id === '10') {
        return FilterResult.CurrentMatch
      }
      return FilterResult.NotMatch
    },
    childrenKey: 'children',
    maxCount: 3,
  })
  const resultTree = await treeSearch.search()
  const search = getTreeDeepFirst(resultTree)
  const reals = ['1', '2', '3', '5', '8']
  expect(isArraySame(search, reals)).toBe(true)
})

test('tree-search-abort', async () => {
  const treeInfo = new TreeInfo<any>({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })

  const treeSearch = new IdleTreeSearch<any>('search')
  treeSearch.init({
    treeInfo,
    filterFn: (item, nodeInfo) => {
      if (item.id === '5') {
        return FilterResult.SubTreeMatch
      }
      if (item.id === '10') {
        return FilterResult.CurrentMatch
      }
      return FilterResult.NotMatch
    },
    childrenKey: 'children',
  })
  treeSearch.abort()
  await expect(treeSearch.searchFuture).rejects.toThrow('search search abort')
})
