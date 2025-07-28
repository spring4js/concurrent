import MutexLock from '../MutexLock'
import { LoggerFactory } from '@spring4js/log'

const logger = LoggerFactory.getLogger('EliminateJitter')

/**
 * 防抖
 * @constructor
 */
export function EliminateJitter(mutex: MutexLock) {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    const clazzName = target.constructor.name
    const oldFun = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const opId = `${mutex.Name}-${key}-${Date.now()}`
      logger.info(`执行操作 mutex: ${mutex.Name} opId: ${opId}  ${clazzName} ${key}`)
      const success = mutex.tryLock(opId)
      // 加锁不成功返回
      if (!success) {
        logger.warn(`执行操作 opId: ${opId} 未获取到锁 current: ${mutex.Owner}，终止执行`)
        throw new Error(`操作过快 ${opId} current: ${mutex.Owner}`)
      }
      try {
        return await oldFun.call(this, ...args)
      } catch (err) {
        logger.error(`执行操作异常 opId: ${opId}`, err)
        throw err
      } finally {
        mutex.unlock()
        logger.info(`执行操作opId: ${opId} 结束`)
      }
    }
  }
}
