export interface NodePointers {
  parentId?: string
  siblingId?: string
  firstChildId?: string
  index?: number
  depth: number
}

export interface InitOption<T> {
  root: T
  getId: (node: T) => string
  getChildren: (node: T) => T[]
}
export interface NextNodeInfo<T> {
  node: T
  id: string
  parentId?: string
  depth: number
  isBackTrace: boolean // 是否是回溯
  fromId?: string // 回溯时，记录源节点id
}
interface StackNode<T> {
  node: T
  depth: number
}

export enum VisitSkipType {
  None = 'none',
  SubTree = 'sub-tree',
  Left = 'left',
}
/**
 * 构造每个节点的索引信息 (parent、sibling、firstChild、index)
 */
export class TreeInfo<T> {
  private readonly options: InitOption<T>
  public pointersMap: Record<string, NodePointers> = {}
  private nodeMap: Record<string, T> = {}

  constructor(options: InitOption<T>) {
    this.options = options
    this.buildIdx()
  }

  private buildIdx() {
    const { root, getId, getChildren } = this.options
    // 构建索引
    const stack: StackNode<T>[] = [
      {
        node: root,
        depth: 0,
      },
    ]
    while (stack.length > 0) {
      const currSN = stack.pop()
      const id = getId(currSN.node)
      if (!id) {
        throw new Error('id不允许为空')
      }
      this.nodeMap[id] = currSN.node

      const children = getChildren(currSN.node) || []
      if (children.length === 0) {
        continue
      }
      let preChildId
      const childDepth = currSN.depth + 1
      const childIdSet = new Set<string>()
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childId = getId(child)
        // 如果childId已经存在，说明树中存在循环边， 有节点的子节点指向了父节点
        if (this.nodeMap[childId]) {
          throw new Error(`${id}的子节点${childId}非法： 已经在其他位置出现过`)
        }
        if (childIdSet.has(childId)) {
          throw new Error(`${id}的子节点${childId}非法： 存在id一样的子节点`)
        }
        childIdSet.add(childId)
        stack.push({
          node: child,
          depth: childDepth,
        })
        // 当前节点 parentId、index
        const cPointer: NodePointers = this.pointersMap[childId] || { depth: childDepth }
        cPointer.parentId = id
        cPointer.index = i

        this.pointersMap[childId] = cPointer
        // siblingId
        if (preChildId) {
          this.pointersMap[preChildId].siblingId = childId
        }
        //
        preChildId = childId
      }
      preChildId = ''
      // firstChildId
      const pointers: NodePointers = this.pointersMap[id] || { depth: currSN.depth }
      pointers.firstChildId = getId(children[0])
      this.pointersMap[id] = pointers
    }
  }

  getFirstTraversalNodeInfo(): NextNodeInfo<T> {
    const root = this.options.root
    return {
      node: root,
      depth: 0,
      isBackTrace: false,
      id: this.options.getId(root),
    }
  }

  getNextInfoInDeepFirst(
    node: T,
    isBackTrace: boolean,
    skipType: VisitSkipType = VisitSkipType.None
  ): NextNodeInfo<T> | void {
    const currId = this.options.getId(node)
    const currPointers = this.pointersMap[currId]
    // node非回溯访问，则访问子节点、右兄弟节点
    if (!isBackTrace && skipType === VisitSkipType.None && currPointers.firstChildId) {
      const id = currPointers.firstChildId
      const pter = this.pointersMap[id]
      return {
        node: this.nodeMap[id],
        id,
        parentId: pter.parentId,
        depth: pter.depth,
        isBackTrace: false,
      }
    }
    if (currPointers.siblingId && skipType !== VisitSkipType.Left) {
      const id = currPointers.siblingId
      const pter = this.pointersMap[id]
      return {
        node: this.nodeMap[id],
        id,
        parentId: pter.parentId,
        depth: pter.depth,
        isBackTrace: false,
      }
    }
    if (currPointers.parentId) {
      const id = currPointers.parentId
      const pter = this.pointersMap[id]
      return {
        node: this.nodeMap[id],
        id,
        parentId: pter.parentId,
        depth: pter.depth,
        isBackTrace: true,
        fromId: currId,
      }
    }
  }

  getNode(id: string): T {
    return this.nodeMap[id]
  }

  hasChild(id: string): boolean {
    return !!this.pointersMap[id].firstChildId
  }

  _test_getPointersMap(): Record<string, NodePointers> {
    return this.pointersMap
  }
  _test_getNodeMap(): Record<string, T> {
    return this.nodeMap
  }
}
