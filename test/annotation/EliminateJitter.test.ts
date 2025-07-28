import delay from '../../../src/utils/delay'
import MutexLock from '../../../src/concurrent/MutexLock'
import { EliminateJitter } from '../../../src/concurrent/annotation/EliminateJitter'
import IdleSearch from '../../../src/concurrent/array/IdleSearch'

const mutexLock = new MutexLock()
class ViewOpService {
  @EliminateJitter(mutexLock)
  async readFile() {
    await delay(200)
    return 'read'
  }
  @EliminateJitter(mutexLock)
  async writeFile() {}
}

class ViewOpServiceSingle {
  @EliminateJitter()
  async readFile() {
    await delay(200)
    return 'read'
  }
  @EliminateJitter()
  async writeFile() {
    return 'write'
  }
}

test('eliminate-jitter-all', async () => {
  const op = new ViewOpService()
  const readPromise = op.readFile()
  await expect(op.readFile()).rejects.toThrow()
  await expect(op.writeFile()).rejects.toThrow()
  await expect(readPromise).resolves.toBe('read')
})

test('eliminate-jitter-single', async () => {
  const op1 = new ViewOpServiceSingle()
  const op2 = new ViewOpServiceSingle()
  const readPromise = op1.readFile()
  await expect(op1.readFile()).rejects.toThrow()
  await expect(op1.writeFile()).resolves.toBe('write')
  await expect(op2.readFile()).resolves.toBe('read')
  await expect(readPromise).resolves.toBe('read')
})
