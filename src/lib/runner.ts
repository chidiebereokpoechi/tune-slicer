/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec } from 'child_process'
import { flatten, includes, join } from 'lodash'
import { Logger } from 'winston'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Configuration {
    successCodes?: number[]
}

type Args = (string | [string, string])[]

export class Runner {
    private readonly name: string
    private readonly executablePath: string
    private readonly logger: Logger
    private readonly config: Configuration

    constructor(
        name: string,
        exectutablePath: string,
        logger: Logger,
        config?: Configuration,
    ) {
        this.name = name
        this.executablePath = exectutablePath
        this.logger = logger.child({
            executable: this.name,
        })

        this.config = {
            successCodes: config?.successCodes ?? [0],
        }
    }

    private normalizeArgs(args: Args): string {
        return join(flatten(args), ' ')
    }

    public run(args: Args): Promise<number> {
        const normalizedArgs = this.normalizeArgs(args)
        const command = `${this.executablePath} ${normalizedArgs}`
        const conciseCommand = `${this.name} ${normalizedArgs}`

        return new Promise((resolve, reject) => {
            const process = exec(command)

            this.logger.info(`Executing ${this.name}`, {
                args,
                executablePath: this.executablePath,
                command,
                conciseCommand,
            })

            const stdout: string[] = []
            const stderr: string[] = []

            process.stdout?.on('data', (data) => {
                stdout.push(data)
            })

            process.stderr?.on('data', (data) => {
                stderr.push(data)
            })

            process.on('error', (error) => {
                this.logger.error(`Error occured while running ${this.name}`, {
                    error,
                    stdout,
                    stderr,
                    command,
                    conciseCommand,
                })

                reject(error)
            })

            process.on('exit', (code) => {
                const context = {
                    stdout,
                    stderr,
                    command,
                    conciseCommand,
                    code,
                }

                if (code !== null && includes(this.config.successCodes, code)) {
                    this.logger.info(
                        `${this.name} finished executing successfully`,
                        context,
                    )

                    resolve(code)
                } else {
                    this.logger.error(`${this.name} failed execution`, context)
                    reject(code)
                }
            })
        })
    }
}
