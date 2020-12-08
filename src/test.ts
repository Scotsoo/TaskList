import NodeList, { Task } from './NodeList'
interface Context {
  a: string
  b: string
}
type ThisTask = Task<Context>
const list = new NodeList<Context>([
  new Task({
    title: 'Test',
    taskList: [
      new Task<Context>({
        title: 'inner',
        task: async (ctx: Context, self: ThisTask) => {
          ctx.a = 'set'
          let times = 5
          let oldTitle = self.title
          await new Promise((resolve) => {
            const int = setInterval(() => {
              if (--times === 0) {
                self.title = oldTitle
                clearInterval(int)
                return resolve('')
              } else {
                self.title = times.toString()
              }
            }, 1000)
          })
        }
      }),
      new Task({
        title: 'inner2',
        task: async (ctx: Context, self: ThisTask) => {
          self.title = ctx.a
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              // console.log('abc')
              reject('abc')
            }, 1000)
          })
        }
      })
    ]
  }),
  new Task({
    title: 'Test2',
    taskList: [
      new Task({
        title: 'inner',
        task: async () => {
          await new Promise(resolve => {
            setTimeout(() => {
              // console.log('abc')
              resolve('abc')
            }, 1000)
          })
        }
      }),
      new Task({
        title: 'inner2',
        task: async () => {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              // console.log('abc')
              resolve('abc')
            }, 1000)
          })
        }
      })
    ]
  })
])


list.run()