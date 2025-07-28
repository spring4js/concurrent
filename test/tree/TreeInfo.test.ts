import { NextNodeInfo, VisitSkipType, TreeInfo } from '../../../src/concurrent/tree/TreeInfo'
import { EmptyIdTree, NormalTree, SameChildIdTree, SameIdTree } from './data'

test('tree-info-normal', () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const pointerMap = treeInfo._test_getPointersMap()

  expect(pointerMap['1'].depth).toBe(0)
  expect(pointerMap['1'].parentId).toBe(undefined)
  expect(pointerMap['1'].index).toBe(undefined)
  expect(pointerMap['1'].siblingId).toBe(undefined)
  expect(pointerMap['1'].firstChildId).toBe('2')

  expect(pointerMap['2'].depth).toBe(1)
  expect(pointerMap['2'].parentId).toBe('1')
  expect(pointerMap['2'].index).toBe(0)
  expect(pointerMap['2'].siblingId).toBe('3')
  expect(pointerMap['2'].firstChildId).toBe(undefined)

  expect(pointerMap['3'].depth).toBe(1)
  expect(pointerMap['3'].parentId).toBe('1')
  expect(pointerMap['3'].index).toBe(1)
  expect(pointerMap['3'].siblingId).toBe('4')
  expect(pointerMap['3'].firstChildId).toBe('5')

  expect(pointerMap['4'].depth).toBe(1)
  expect(pointerMap['4'].parentId).toBe('1')
  expect(pointerMap['4'].index).toBe(2)
  expect(pointerMap['4'].siblingId).toBe(undefined)
  expect(pointerMap['4'].firstChildId).toBe(undefined)

  expect(pointerMap['5'].depth).toBe(2)
  expect(pointerMap['5'].parentId).toBe('3')
  expect(pointerMap['5'].index).toBe(0)
  expect(pointerMap['5'].siblingId).toBe('6')
  expect(pointerMap['5'].firstChildId).toBe('8')

  expect(pointerMap['6'].depth).toBe(2)
  expect(pointerMap['6'].parentId).toBe('3')
  expect(pointerMap['6'].index).toBe(1)
  expect(pointerMap['6'].siblingId).toBe('7')
  expect(pointerMap['6'].firstChildId).toBe(undefined)

  expect(pointerMap['7'].depth).toBe(2)
  expect(pointerMap['7'].parentId).toBe('3')
  expect(pointerMap['7'].index).toBe(2)
  expect(pointerMap['7'].siblingId).toBe(undefined)
  expect(pointerMap['7'].firstChildId).toBe('10')

  expect(pointerMap['8'].depth).toBe(3)
  expect(pointerMap['8'].parentId).toBe('5')
  expect(pointerMap['8'].index).toBe(0)
  expect(pointerMap['8'].siblingId).toBe('9')
  expect(pointerMap['8'].firstChildId).toBe(undefined)

  expect(pointerMap['9'].depth).toBe(3)
  expect(pointerMap['9'].parentId).toBe('5')
  expect(pointerMap['9'].index).toBe(1)
  expect(pointerMap['9'].siblingId).toBe(undefined)
  expect(pointerMap['9'].firstChildId).toBe(undefined)

  expect(pointerMap['10'].depth).toBe(3)
  expect(pointerMap['10'].parentId).toBe('7')
  expect(pointerMap['10'].index).toBe(0)
  expect(pointerMap['10'].siblingId).toBe(undefined)
  expect(pointerMap['10'].firstChildId).toBe(undefined)
})

test('tree-info 存在循环抛异常', () => {
  expect(() => {
    const treeInfo = new TreeInfo({
      root: SameIdTree,
      getId: (node) => node.id,
      getChildren: (node) => (node as any).children,
    })
  }).toThrow()
})
test('tree-info 存在相同id的孩子抛异常', () => {
  expect(() => {
    const treeInfo = new TreeInfo({
      root: SameChildIdTree,
      getId: (node) => node.id,
      getChildren: (node) => (node as any).children,
    })
  }).toThrow()
})
test('tree-info id不能为空', () => {
  expect(() => {
    const treeInfo = new TreeInfo({
      root: EmptyIdTree,
      getId: (node) => node.id,
      getChildren: (node) => (node as any).children,
    })
  }).toThrow('id不允许为空')
})

test('tree-info-root节点', () => {
  const treeInfo = new TreeInfo({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  const rootNodeInfo = treeInfo.getFirstTraversalNodeInfo()
  expect(rootNodeInfo.id == '1').toBe(true)
  expect(rootNodeInfo.depth == 0).toBe(true)
  expect(rootNodeInfo.isBackTrace).toBe(false)
  expect(rootNodeInfo.node === NormalTree).toBe(true)
})

test('tree-info-递归', () => {
  const treeInfo = new TreeInfo<any>({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  // 有孩子节点递归
  const node5 = treeInfo.getNode('5')
  const nextNodeInfo1 = treeInfo.getNextInfoInDeepFirst(node5, false) as NextNodeInfo<any>
  expect(nextNodeInfo1.parentId).toBe('5')
  expect(nextNodeInfo1.id).toBe('8')
  expect(nextNodeInfo1.depth).toBe(3)
  expect(nextNodeInfo1.isBackTrace).toBe(false)
  expect(nextNodeInfo1.fromId).toBe(undefined)
  // 有右兄弟叶子节点递归
  const node6 = treeInfo.getNode('6')
  const nextNodeInfo2 = treeInfo.getNextInfoInDeepFirst(node6, false) as NextNodeInfo<any>
  expect(nextNodeInfo2.parentId).toBe('3')
  expect(nextNodeInfo2.id).toBe('7')
  expect(nextNodeInfo2.depth).toBe(2)
  expect(nextNodeInfo2.isBackTrace).toBe(false)
  expect(nextNodeInfo2.fromId).toBe(undefined)
  // 无右兄弟叶子节点递归
  const node10 = treeInfo.getNode('10')
  const nextNodeInfo3 = treeInfo.getNextInfoInDeepFirst(node10, false) as NextNodeInfo<any>
  expect(nextNodeInfo3.parentId).toBe('3')
  expect(nextNodeInfo3.id).toBe('7')
  expect(nextNodeInfo3.depth).toBe(2)
  expect(nextNodeInfo3.isBackTrace).toBe(true)
  expect(nextNodeInfo3.fromId).toBe('10')
  // 有右兄弟叶子节点跳过子树
  const nextNodeInfo4 = treeInfo.getNextInfoInDeepFirst(node5, false, VisitSkipType.SubTree) as NextNodeInfo<any>
  expect(nextNodeInfo4.parentId).toBe('3')
  expect(nextNodeInfo4.id).toBe('6')
  expect(nextNodeInfo4.depth).toBe(2)
  expect(nextNodeInfo4.isBackTrace).toBe(false)
  expect(nextNodeInfo4.fromId).toBe(undefined)
  // 无右兄弟叶子节点跳过子树
  const node7 = treeInfo.getNode('7')
  const nextNodeInfo5 = treeInfo.getNextInfoInDeepFirst(node7, false, VisitSkipType.SubTree) as NextNodeInfo<any>
  expect(nextNodeInfo5.parentId).toBe('1')
  expect(nextNodeInfo5.id).toBe('3')
  expect(nextNodeInfo5.depth).toBe(1)
  expect(nextNodeInfo5.isBackTrace).toBe(true)
  expect(nextNodeInfo5.fromId).toBe('7')
  // 有子树 有右兄弟 跳过剩余
  const nextNodeInfo6 = treeInfo.getNextInfoInDeepFirst(node5, false, VisitSkipType.Left) as NextNodeInfo<any>
  expect(nextNodeInfo6.parentId).toBe('1')
  expect(nextNodeInfo6.id).toBe('3')
  expect(nextNodeInfo6.depth).toBe(1)
  expect(nextNodeInfo6.isBackTrace).toBe(true)
  expect(nextNodeInfo6.fromId).toBe('5')

  // 有子树 无右兄弟 跳过剩余
  const nextNodeInfo7 = treeInfo.getNextInfoInDeepFirst(node7, false, VisitSkipType.Left) as NextNodeInfo<any>
  expect(nextNodeInfo7.parentId).toBe('1')
  expect(nextNodeInfo7.id).toBe('3')
  expect(nextNodeInfo7.depth).toBe(1)
  expect(nextNodeInfo7.isBackTrace).toBe(true)
  expect(nextNodeInfo7.fromId).toBe('7')
  // 无子树 有右兄弟 跳过剩余
  const nextNodeInfo8 = treeInfo.getNextInfoInDeepFirst(node6, false, VisitSkipType.Left) as NextNodeInfo<any>
  expect(nextNodeInfo8.parentId).toBe('1')
  expect(nextNodeInfo8.id).toBe('3')
  expect(nextNodeInfo8.depth).toBe(1)
  expect(nextNodeInfo8.isBackTrace).toBe(true)
  expect(nextNodeInfo8.fromId).toBe('6')
  // 无子树 无右兄弟 跳过剩余
  const node9 = treeInfo.getNode('9')
  const nextNodeInfo9 = treeInfo.getNextInfoInDeepFirst(node9, false, VisitSkipType.Left) as NextNodeInfo<any>
  expect(nextNodeInfo9.parentId).toBe('3')
  expect(nextNodeInfo9.id).toBe('5')
  expect(nextNodeInfo9.depth).toBe(2)
  expect(nextNodeInfo9.isBackTrace).toBe(true)
  expect(nextNodeInfo9.fromId).toBe('9')
})
test('tree-info-回溯', () => {
  const treeInfo = new TreeInfo<any>({
    root: NormalTree,
    getId: (node) => node.id,
    getChildren: (node) => (node as any).children,
  })
  // 有右兄弟节点
  const hasSiblingNode = treeInfo.getNode('5')
  const nextNodeInfo1 = treeInfo.getNextInfoInDeepFirst(hasSiblingNode, true) as NextNodeInfo<any>
  expect(nextNodeInfo1.parentId).toBe('3')
  expect(nextNodeInfo1.id).toBe('6')
  expect(nextNodeInfo1.depth).toBe(2)
  expect(nextNodeInfo1.isBackTrace).toBe(false)
  expect(nextNodeInfo1.fromId).toBe(undefined)
  // 无右兄弟节点
  const noSiblingNode = treeInfo.getNode('7')
  const nextNodeInfo2 = treeInfo.getNextInfoInDeepFirst(noSiblingNode, true) as NextNodeInfo<any>
  expect(nextNodeInfo2.parentId).toBe('1')
  expect(nextNodeInfo2.id).toBe('3')
  expect(nextNodeInfo2.depth).toBe(1)
  expect(nextNodeInfo2.isBackTrace).toBe(true)
  expect(nextNodeInfo2.fromId).toBe('7')
})
