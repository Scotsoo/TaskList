import NodeList, { Task } from './NodeList'

const list = new NodeList([
  new Task({
    taskList: [
      new Task({
        title: 'Inner test',
        taskList: [
          new Task({
            title: 'Inner test',
            task: async (): Promise<void> => {
              await new Promise((resolve, reject) => {
                setTimeout(() => {
                  return resolve('abc')
                }, 1000)
              })
            },
          }),
          new Task({
            title: 'Inner test 2',
            task: async (): Promise<void> => {
              await new Promise((resolve, reject) => {
                setTimeout(() => {
                  return reject('ERROR?')
                }, 1000)
              })
            },
          })
        ]
      }),
      new Task({
        title: 'Inner test 2',
        task: async (): Promise<void> => {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              return reject('ERROR?')
            }, 1000)
          })
        },
      })
    ],
    title: 'test'
  })
])


list.run()