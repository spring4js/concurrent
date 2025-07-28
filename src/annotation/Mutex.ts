import { Semaphore } from '../semaphore'

/**
 * 不支持重入
 * @param eliminator
 * @param keyIndex
 * @constructor
 */
export default function Mutex(semaphore: Semaphore) {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    const oldFun = descriptor.value
    descriptor.value = function (...args: any[]) {
      return semaphore.lock(() => {
        return oldFun.call(this, ...args)
      })
    }
  }
}
