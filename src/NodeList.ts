import { writeFileSync } from "fs"
import { Stream } from "stream"
import * as logUpdate from 'log-update'

interface TaskConstructorArgs {
  title: string
  enabled?: boolean
  skip?: () => boolean
  taskList?: Task[]
  task?: () => any
}
const processingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const processingFramesLength = processingFrames.length
export default class NodeList {
  private taskList: Task[]
  private interval: NodeJS.Timeout | undefined
  constructor(tasks: Task[]) {
    this.taskList = tasks
  }
  public print () {
    this.interval = setInterval(() => {
      // console.log(this.getText())
      logUpdate(this.getText())
    }, 100)

  }
  public async run (): Promise<void> {
    this.print()
    for (const task of this.taskList) {
      await task.run()
    }
    setTimeout(() => {
      if (this.interval !== undefined) {
        clearInterval(this.interval)
        this.interval = undefined
      }
    }, 1000)
  }

  private getText (): string {
    let output = ''
    for (const task of this.taskList) {
      output += task.getPrintText() + '\n'
    }
    // writeFileSync('./out.txt', 'output: ' + output + '\n\n')
    return output
  }
}

export class Task {
  private taskState: TaskState = TaskState.NONE
  private title: string
  private enabled: boolean
  private skip: () => boolean
  private taskList: Task[] | undefined
  private task: (() => Promise<any>) | undefined
  private isRunning: boolean = false
  private isFinished: boolean = false
  private proceccingFrameIndex: number = 0
  constructor (args: TaskConstructorArgs) {
    this.title = args.title
    this.enabled = args.enabled || true
    this.skip = args.skip || (() => false)
    this.taskList = args.taskList
    this.task = args.task
  }
  private finalPrintText: string | undefined = undefined
  public getPrintText (indentLevel: number = 0): string {
    if (this.finalPrintText !== undefined && this.isFinished) {
      return this.finalPrintText
    }
    const prefix = new Array(indentLevel + 1).join('  ')
    if (this.skip()) {
      this.finalPrintText = `${prefix}${this.title} [Skipped]`
      return this.finalPrintText
    }

    if (this.task !== undefined) {
      if (this.isFinished) {
        console.log(`${this.title} is finished`)
        let finalOutput = ''
        let icon = ''
        if (this.taskState == TaskState.SUCCESS) {
          icon = '✔'
        } else if (this.taskState === TaskState.FAIL) {
          icon = '❌'
        }
        finalOutput = `${prefix}${icon} ${this.title}\n`
        this.finalPrintText = finalOutput
        return finalOutput
      }
      if (this.isRunning) {
        return `${prefix}${processingFrames[this.proceccingFrameIndex ++ % processingFramesLength]} ${this.title} - running\n`
      } else {
        return `${prefix} ${this.title}`
      }
    } else if (this.taskList !== undefined) {
      let output = ''
      if (this.isFinished) {
        let icon = ''
        if (this.taskState == TaskState.SUCCESS) {
          icon = '✔'
        } else if (this.taskState === TaskState.FAIL) {
          icon = '❌'
        }
        output = `${prefix}${icon} ${this.title}\n`
      } else {
        output = `${prefix}${prefix}${processingFrames[this.proceccingFrameIndex ++ % processingFramesLength]}${this.title}\n`
      }
      if (this.taskState === TaskState.SUCCESS) {
        return output
      }
      for (const task of this.taskList) {
        output += task.getPrintText(indentLevel + 1)
      }
      if (this.isFinished) {
        this.finalPrintText = output
      }
      return output
    }
    return 'missed case'
  }

  public async run (): Promise<void> {
    this.isRunning = true
    if (!this.skip()) {
      if (this.task !== undefined) {
        try {
          if (!this.skip()) {
            await this.task()
          }
          this.taskState = TaskState.SUCCESS
        } catch (e) {
          this.taskState = TaskState.FAIL
          throw e
        }
      } else if (this.taskList !== undefined) {
        for (const task of this.taskList) {
          try {
            await task.run()
          } catch {
            this.taskState = TaskState.FAIL
          }
        }
        if (this.taskState === TaskState.NONE) {
          this.taskState = TaskState.SUCCESS
        }
      }
    }
    this.isRunning = false
    this.isFinished = true
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 700)
    })
  }
}

enum TaskState {
  NONE = 'NONE',
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS'
}