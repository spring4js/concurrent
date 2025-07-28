import delay from '../../../src/utils/delay'
import Mutex from '../../../src/concurrent/annotation/Mutex'
import { Semaphore } from '../../../src/concurrent/semaphore'

const semaphore = new Semaphore()
class FileService {
  contentMap: Record<string, string> = {}
  @Mutex(semaphore)
  async readFile(path: string) {
    const begin = Date.now()
    await delay(200)
    return {
      begin,
      content: this.contentMap[path],
    }
  }
  @Mutex(semaphore)
  async writeFile(path: string, content: string) {
    const begin = Date.now()
    this.contentMap[path] = content
    await delay(200)
    return {
      begin,
    }
  }
}
test('互斥装饰器-同一资源不允许并发', async () => {
  const fileService = new FileService()
  const [first, secnd, third] = await Promise.all([
    fileService.writeFile('1', '1-content1'),
    fileService.readFile('1'),
    fileService.writeFile('1', '1-content2'),
  ])

  expect(secnd.begin - first.begin >= 200).toBe(true)
  expect(third.begin - secnd.begin >= 200).toBe(true)
  expect(secnd.content).toBe('1-content1')
})
