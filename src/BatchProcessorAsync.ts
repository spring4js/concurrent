import { LoggerFactory } from '@spring4js/log'
import RAL from './ral'

export type TaskProcessor<T> = (task: T) => Promise<void>
export type FinishedCb = (isAborted: boolean) => void

const logger = LoggerFactory.getLogger('BatchProcessorAsync')

export default class BatchProcessorAsync<T = any> {
  name: string
  private taskQueue: T[] = []
  private abortFlag: boolean = false
  private isProcessing: boolean = false
  private schedulingTimes: number = 0

  private taskProcessor: TaskProcessor<T>
  private finishedCb: FinishedCb

  constructor(name: string) {
    this.name = name
  }

  setProcessor(taskProcessor: TaskProcessor<T>, finishedCb: FinishedCb) {
    this.taskProcessor = taskProcessor
    this.finishedCb = finishedCb
  }

  setTasks(tasks: T[]) {
    // 使用新的数组遍历
    this.taskQueue = [...tasks]
  }

  addTask(task: T) {
    this.taskQueue.push(task)
  }

  start() {
    if (!this.isProcessing) {
      this.isProcessing = true
      RAL().idle.requestIdleCallback(this.processTasks)
    }
  }

  processTasks = async (deadline: IdleDeadline) => {
    this.schedulingTimes++
    while (!this.abortFlag && (deadline.timeRemaining() > 0 || deadline.didTimeout) && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()
      try {
        await this.taskProcessor(task)
      } catch (err) {
        logger.error(`${this.name} Error`, err)
      }
    }
    if (this.abortFlag) {
      this.finishedCb(true)
    } else {
      // 判断是否还有任务需要处理
      if (this.taskQueue.length > 0) {
        RAL().idle.requestIdleCallback(this.processTasks)
      } else {
        this.isProcessing = false
        this.finishedCb(false)
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
