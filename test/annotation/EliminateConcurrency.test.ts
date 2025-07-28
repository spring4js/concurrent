import delay from '../../../src/utils/delay'
import EliminateConcurrency from '../../../src/concurrent/annotation/EliminateConcurrency'
import ResourceConcurrentEliminator from '../../../src/concurrent/ResourceConcurrentEliminator'

const eliminator = new ResourceConcurrentEliminator()
class FileService {
  contentMap: Record<string, string> = {}
  @EliminateConcurrency(eliminator, 0)
  async readFile(path: string) {
    const begin = Date.now()
    await delay(200)
    return {
      begin,
      content: this.contentMap[path],
    }
  }
  @EliminateConcurrency(eliminator, 0)
  async writeFile(path: string, content: string) {
    const begin = Date.now()
    this.contentMap[path] = content
    await delay(200)
    return {
      begin,
    }
  }
}
test('消除并发装饰器-同一资源不允许并发', async () => {
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
test('消除并发装饰器-同一不同资源可以并发', async () => {
  const fileService = new FileService()
  const [first, secnd, third] = await Promise.all([
    fileService.writeFile('1', '1-content1'),
    fileService.writeFile('2', '2-content1'),
    fileService.readFile('1'),
  ])

  expect(secnd.begin - first.begin < 10).toBe(true)
  expect(third.begin - secnd.begin >= 200).toBe(true)
  expect(third.content).toBe('1-content1')
})
