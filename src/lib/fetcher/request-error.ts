export class RequestError extends Error {
    public readonly code: number
    public readonly message: string

    constructor(code: number, message: string) {
        super(message)
        this.code = code
        this.message = message
    }
}
