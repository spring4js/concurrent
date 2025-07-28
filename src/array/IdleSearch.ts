import BatchProcessor from '../BatchProcessor'
import Future from '../Future'

/**
 * 特点：搜索书中的节点，随时可以终止
 *
 * 使用场景： 数据量大，搜索频繁。
 */
export default class IdleSearch<T> {
  private readonly name: string
  private result: T[]
  private batchProcessor: BatchProcessor<T>
  private searchFuture: Future
  constructor(name: string) {
    this.name = name
  }
  init(list: T[], filterFn: (item: T) => boolean) {
    this.result = []
    const searchFuture = new Future()
    //
    const batchProcessor = new BatchProcessor<T>(this.name)
    batchProcessor.setTasks(list)
    batchProcessor.setProcessor(
      (item: T) => {
        const r = filterFn(item)
        if (r) {
          this.result.push(item)
        }
      },
      (isAborted) => {
        if (isAborted) {
          searchFuture.reject(new Error(`search ${this.name} abort 1`))
        } else {
          searchFuture.resolve()
        }
      }
    )
    this.batchProcessor = batchProcessor
    this.searchFuture = searchFuture
  }
  async search(): Promise<T[]> {
    //
    this.batchProcessor.start()
    await this.searchFuture.get()
    // 可能搜索完了之后，被abort。所以要二次校验
    if (this.batchProcessor.isAborted()) {
      throw new Error(`search ${this.name} abort 2`)
    }
    return this.result
  }

  abort() {
    this.batchProcessor.isAborted()
  }

  getSchedulingTimes(): number {
    return this.batchProcessor.getSchedulingTimes()
  }
}
