import { NextNodeInfo, TreeInfo, VisitSkipType } from './TreeInfo'
import { LoggerFactory } from '@spring4js/log'
import RAL from '../ral'

const logger = LoggerFactory.getLogger('IdleDepthFirstTraversal')

export enum SkipType {
  None = 'none',
  SubTree = 'sub-tree',
  Terminate = 'terminate',
  Left = 'left',
}
export interface NodeInfo {
  id: string
  parentId: string
  depth: number
}
export interface BackTraceNodeInfo {
  id: string
  parentId: string
  depth: number
  fromId: string
}
interface TraversalOption<T> {
  visit: (node: T, nodeInfo: NodeInfo) => SkipType | void
  backtrace?: (node: T, nodeInfo: BackTraceNodeInfo) => void
  finishedCb: (isAborted: boolean) => void
}

/**
 * 利用idle时间，进行树的深度遍历
 *
 */
export default class IdleDepthFirstTraversal<T> {
  private readonly name: string
  private treeInfo: TreeInfo<T>
  private options: TraversalOption<T>
  private nextNodeInfo: NextNodeInfo<T> | void

  private isProcessing: boolean = false
  private abortFlag: boolean = false
  private isSkipLeft: boolean = false
  private schedulingTimes: number = 0

  constructor(name: string, treeInfo: TreeInfo<T>) {
    this.name = name
    this.treeInfo = treeInfo
  }

  setTraversalOptions(options: TraversalOption<T>) {
    this.options = options
    this.nextNodeInfo = this.treeInfo.getFirstTraversalNodeInfo()
  }

  startTraversal() {
    if (!this.isProcessing) {
      this.isProcessing = true
      RAL().idle.requestIdleCallback(this.traversal)
    }
  }

  private traversal = (deadline: IdleDeadline) => {
    this.schedulingTimes++
    while (this.nextNodeInfo && !this.abortFlag && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
      try {
        const currNodeInfo = this.nextNodeInfo
        if (!currNodeInfo.isBackTrace) {
          const skipType = this.options.visit(currNodeInfo.node, {
            id: currNodeInfo.id,
            parentId: currNodeInfo.parentId,
            depth: currNodeInfo.depth,
          })
          if (skipType === SkipType.Terminate) {
            this.nextNodeInfo = null
          } else {
            let visitSkipType = VisitSkipType.None

            if (this.isSkipLeft) {
              visitSkipType = VisitSkipType.Left
            } else {
              if (skipType === SkipType.SubTree) {
                visitSkipType = VisitSkipType.SubTree
              } else if (skipType === SkipType.Left) {
                this.isSkipLeft = true
                visitSkipType = VisitSkipType.Left
              }
            }

            this.nextNodeInfo = this.treeInfo.getNextInfoInDeepFirst(currNodeInfo.node, false, visitSkipType)
          }
        } else {
          this.options.backtrace(currNodeInfo.node, {
            id: currNodeInfo.id,
            parentId: currNodeInfo.parentId,
            depth: currNodeInfo.depth,
            fromId: currNodeInfo.fromId!,
          })
          this.nextNodeInfo = this.treeInfo.getNextInfoInDeepFirst(
            currNodeInfo.node,
            true,
            this.isSkipLeft ? VisitSkipType.Left : VisitSkipType.None
          )
        }
      } catch (err) {
        logger.error(`${this.name} Error`, err)
      }
    }
    if (this.abortFlag) {
      this.options.finishedCb(true)
    } else {
      // 判断是否还有任务需要处理
      if (this.nextNodeInfo) {
        RAL().idle.requestIdleCallback(this.traversal)
      } else {
        this.isProcessing = false
        this.options.finishedCb(false)
      }
    }
  }

  abort() {
    this.abortFlag = true
  }
  isAborted() {
    return this.abortFlag
  }

  getSchedulingTimes(): number {
    return this.schedulingTimes
  }
}
