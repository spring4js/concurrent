import IdleDepthFirstTraversal, { BackTraceNodeInfo, NodeInfo, SkipType } from './IdleDepthFirstTraversal'
import { TreeInfo } from './TreeInfo'
import Future from '../Future'

export enum FilterResult {
  CurrentMatch = 'current-match',
  SubTreeMatch = 'sub-tree-match',
  InheritMatch = 'inherit-match',
  NotMatch = 'not-match',
}
enum SearchResult {
  Reserve = 'reserve',
  Pending = 'pending',
}
interface SearchInfo {
  __searchResult: SearchResult
}
interface InitOptions<T> {
  treeInfo: TreeInfo<T>
  filterFn: (item: T, nodeInfo: NodeInfo) => FilterResult
  childrenKey: string
  maxCount?: number
}
/**
 * 遍历回溯原始树，构造搜索树
 *
 */
export class IdleTreeSearch<T> {
  name: string

  private traversal: IdleDepthFirstTraversal<T>

  searchFuture: Future
  filteredTreeRoot: T & SearchInfo

  constructor(name: string) {
    this.name = name
  }

  init({ treeInfo, filterFn, childrenKey, maxCount = Number.MAX_VALUE }: InitOptions<T>) {
    this.traversal = new IdleDepthFirstTraversal<T>(this.name, treeInfo)
    const searchFuture = new Future()
    const idNodeMap: Record<string, any> = {}
    let subTreeMatchedFlag_ID = ''
    let totalMatchedCnt = 0
    this.traversal.setTraversalOptions({
      visit: (node: T, nodeInfo: NodeInfo) => {
        // 访问节点，构造搜索结果树
        let r: FilterResult
        if (subTreeMatchedFlag_ID) {
          // 子树匹配，则不校验
          r = FilterResult.InheritMatch
        } else {
          r = filterFn(node, nodeInfo)
        }
        const isMatched = r !== FilterResult.NotMatch
        const current: T & SearchInfo = {
          ...node,
          __searchResult: isMatched ? SearchResult.Reserve : SearchResult.Pending,
          [childrenKey]: [],
        }
        const { id, parentId } = nodeInfo
        idNodeMap[id] = current
        if (!this.filteredTreeRoot) {
          this.filteredTreeRoot = current
        }
        if (parentId) {
          const pNode = idNodeMap[parentId]
          pNode[childrenKey].push(current) // 构造树
        }
        if (r === FilterResult.SubTreeMatch) {
          if (treeInfo.hasChild(id)) {
            // 有孩子节点，才可能被回溯，清除flag
            subTreeMatchedFlag_ID = id
          }
        }
        if (isMatched) {
          totalMatchedCnt++
          if (totalMatchedCnt >= maxCount) {
            return SkipType.Left
          }
        }
      },
      backtrace: (node: T, { id }: BackTraceNodeInfo) => {
        if (subTreeMatchedFlag_ID === id) {
          subTreeMatchedFlag_ID = ''
        } else {
          // 清理不匹配节点
          const current = idNodeMap[id]
          current[childrenKey] = current[childrenKey].filter(
            (item: SearchInfo) => item.__searchResult === SearchResult.Reserve
          )
          if (current[childrenKey].length > 0 && current.__searchResult !== SearchResult.Reserve) {
            current.__searchResult = SearchResult.Reserve
          }
        }
      },
      finishedCb: (isAborted: boolean) => {
        if (isAborted) {
          searchFuture.reject(new Error(`search ${this.name} abort 1`))
        } else {
          searchFuture.resolve()
        }
      },
    })

    this.searchFuture = searchFuture
  }

  async search() {
    this.traversal.startTraversal()
    await this.searchFuture.get()
    // 可能搜索完了之后，被abort。所以要二次校验
    if (this.traversal.isAborted()) {
      throw new Error(`search ${this.name} abort 2`)
    }
    return this.filteredTreeRoot
  }

  abort() {
    this.traversal.abort()
  }

  getSchedulingTimes(): number {
    return this.traversal.getSchedulingTimes()
  }
}
