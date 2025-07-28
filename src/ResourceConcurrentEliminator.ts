import { Semaphore } from './semaphore'
/**
 * 对每个资源进行并发访问控制
 */
export default class ResourceConcurrentEliminator {
  semaphoreMap: Record<string, Semaphore<any>> = {}
  schedule<T>(key:string, thunk: () => T | PromiseLike<T>): Promise<T> {
    let smp: Semaphore<any> = this.semaphoreMap[key]
    if (!smp) {
      smp= new Semaphore(1, () =>{
        delete this.semaphoreMap[key]
      })
      this.semaphoreMap[key] = smp
    }

    return smp.lock(thunk)
  }
}