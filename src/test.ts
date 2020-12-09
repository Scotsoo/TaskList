import { resolve } from 'path'
import TaskList, { Task } from './TaskList'
interface Context {
  a: string
  b: string
}
type ThisTask = Task<Context>
const list = new TaskList<Context>([
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


// const list = new TaskList([
//   new Task({
//     title: '1',
//     taskList: [
//       new Task({
//         title: '2',
//         taskList: [
//           new Task({
//             title: '3',
//             taskList: [
//               new Task({
//                 title: '4',
//                 taskList: [
//                   new Task({
//                     title: '5',
//                     taskList: [
//                       new Task({
//                         title: '6',
//                         taskList: [
//                           new Task({
//                             title: 'Actual task',
//                             task: async () => {
//                               await new Promise((resolve) => {
//                                 setTimeout(() => {
//                                   resolve('')
//                                 }, 5000)
//                               })
//                             }
//                           })
//                         ]
//                       })
//                     ]
//                   })
//                 ]
//               })
//             ]
//           })
//         ]
//       })
//     ]
//   })
// ])


list.run()