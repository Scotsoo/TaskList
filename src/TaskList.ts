import * as logUpdate from 'log-update'
import * as chalk from 'chalk'
const icons = {
  success: chalk.green('✔'),
  fail: chalk.red('❌')
}
interface TaskConstructorArgs<T> {
  title: string
  skip?: () => boolean
  taskList?: Task<T>[]
  task?: (ctx: T, self: Task<T>) => any
}
const processingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'].map(m => chalk.cyan(m))
const processingFramesLength = processingFrames.length
export default class TaskList<T extends {}> {
  private taskList: Task<T>[]
  private interval: NodeJS.Timeout | undefined
  constructor(tasks: Task<T>[]) {
    this.taskList = tasks
  }
  public print () {
    this.interval = setInterval(() => {
      logUpdate(this.getText())
      console.log(this.getText())
    }, 100)

  }
  public async run (): Promise<void> {
    this.print()
    for (const task of this.taskList) {
      await task.run({} as any)
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

export class Task<T extends {} = {}> {
  protected taskState: TaskState = TaskState.NONE
  public title: string
  private skip: () => boolean
  private taskList: Task<T>[] | undefined
  private task: ((ctx: T, task: this) => Promise<any>) | undefined
  private isRunning: boolean = false
  private isFinished: boolean = false
  private proceccingFrameIndex: number = 0
  constructor (args: TaskConstructorArgs<T>) {
    this.title = args.title
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
    if (this.taskList !== undefined && this.task !== undefined) {
      throw new Error('Unable to have taskList and task provided. Provide one or the other.')
    }
    if (this.task !== undefined) {
      if (this.isFinished) {
        let finalOutput = ''
        let icon = ''
        if (this.taskState == TaskState.SUCCESS) {
          icon = icons.success
        } else if (this.taskState === TaskState.FAIL) {
          icon = icons.fail
        }
        finalOutput = `${prefix}${icon} ${this.title}\n`
        this.finalPrintText = finalOutput
        return finalOutput
      }
      if (this.isRunning) {
        return `${prefix}${processingFrames[this.proceccingFrameIndex ++ % processingFramesLength]} ${this.title}\n`
      } else {
        return `${prefix} ${this.title}\n`
      }
    } else if (this.taskList !== undefined) {
      let output = ''
      if (this.isFinished) {
        let icon = ''
        if (this.taskState == TaskState.SUCCESS) {
          icon = icons.success
        } else if (this.taskState === TaskState.FAIL) {
          icon = icons.fail
        }
        output = `${prefix}${icon} ${this.title}\n`
      } else {
        if (this.isRunning) {
          output = `${prefix}${prefix}${processingFrames[this.proceccingFrameIndex ++ % processingFramesLength]} ${this.title}\n`
        } else {
          return `${prefix} ${this.title}\n`
        }
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

  public async run (ctx: T): Promise<void> {
    this.isRunning = true
    if (!this.skip()) {
      if (this.task !== undefined) {
        try {
          if (!this.skip()) {
            await this.task(ctx, this)
          }
          this.taskState = TaskState.SUCCESS
        } catch (e) {
          this.taskState = TaskState.FAIL
          this.title += `: Fail Reason: ${e}`
        }
      } else if (this.taskList !== undefined) {
        for (const task of this.taskList) {
          try {
            await task.run(ctx)
            if (task.taskState === TaskState.FAIL) {
              this.taskState  = TaskState.FAIL
            }
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
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(true)
    //   }, 700)
    // })
    return undefined
  }
}

enum TaskState {
  NONE = 'NONE',
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS'
}