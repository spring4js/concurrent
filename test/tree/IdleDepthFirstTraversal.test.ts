import { TreeInfo } from '../../../src/concurrent/tree/TreeInfo'
import { NormalTree } from './data'
import IdleDepthFirstTraversal, { SkipType } from '../../../src/concurrent/tree/IdleDepthFirstTraversal'
import Future from '../../../src/concurrent/Future'
import { isArraySame } from '../../utils'

test('tree-traversal-all', async () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const feature = new Future()
  const traversal = new IdleDepthFirstTraversal<any>('test', treeInfo)
  const visitPath: string[] = []
  traversal.setTraversalOptions({
    visit: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    backtrace: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    finishedCb: (isAborted) => {
      isAborted ? feature.reject(new Error('aborted')) : feature.resolve()
    },
  })
  traversal.startTraversal()

  // 等待遍历完成
  await feature.get()
  const real = ['1', '2', '3', '5', '8', '9', '5', '6', '7', '10', '7', '3', '4', '1']
  const isSame = isArraySame(visitPath, real)
  expect(isSame).toBe(true)
})

test('tree-traversal-skip-subtree', async () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const feature = new Future()
  const traversal = new IdleDepthFirstTraversal<any>('test', treeInfo)
  const visitPath: string[] = []
  traversal.setTraversalOptions({
    visit: (node, nodeInfo) => {
      visitPath.push(node.id)
      if (node.id === '5') {
        return SkipType.SubTree
      }
    },
    backtrace: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    finishedCb: (isAborted) => {
      isAborted ? feature.reject(new Error('aborted')) : feature.resolve()
    },
  })
  traversal.startTraversal()
  // 等待遍历完成
  await feature.get()
  const real = ['1', '2', '3', '5', '6', '7', '10', '7', '3', '4', '1']
  const isSame = isArraySame(visitPath, real)
  expect(isSame).toBe(true)
})

test('tree-traversal-skip-left', async () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const feature = new Future()
  const traversal = new IdleDepthFirstTraversal<any>('test', treeInfo)
  const visitPath: string[] = []
  traversal.setTraversalOptions({
    visit: (node, nodeInfo) => {
      visitPath.push(node.id)
      if (node.id === '5') {
        return SkipType.Left
      }
    },
    backtrace: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    finishedCb: (isAborted) => {
      isAborted ? feature.reject(new Error('aborted')) : feature.resolve()
    },
  })
  traversal.startTraversal()
  // 等待遍历完成
  await feature.get()
  const real = ['1', '2', '3', '5', '3', '1']
  const isSame = isArraySame(visitPath, real)
  expect(isSame).toBe(true)
})

test('tree-traversal-skip-all', async () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const feature = new Future()
  const traversal = new IdleDepthFirstTraversal<any>('test', treeInfo)
  const visitPath: string[] = []
  traversal.setTraversalOptions({
    visit: (node, nodeInfo) => {
      visitPath.push(node.id)
      if (node.id === '5') {
        return SkipType.Terminate
      }
    },
    backtrace: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    finishedCb: (isAborted) => {
      isAborted ? feature.reject(new Error('aborted')) : feature.resolve()
    },
  })
  traversal.startTraversal()
  // 等待遍历完成
  await feature.get()
  const real = ['1', '2', '3', '5']
  const isSame = isArraySame(visitPath, real)
  expect(isSame).toBe(true)
})
test('tree-traversal-abort', async () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const feature = new Future()
  const traversal = new IdleDepthFirstTraversal<any>('test', treeInfo)
  const visitPath: string[] = []
  traversal.setTraversalOptions({
    visit: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    backtrace: (node, nodeInfo) => {
      visitPath.push(node.id)
    },
    finishedCb: (isAborted) => {
      isAborted ? feature.reject(new Error('aborted')) : feature.resolve()
    },
  })
  traversal.startTraversal()
  traversal.abort()
  // 等待遍历完成
  await expect(feature.get()).rejects.toThrow('aborted')
})
