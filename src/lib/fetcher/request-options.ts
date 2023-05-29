import { HttpMethod } from './http-method'

export interface RequestOptions<Body> {
    method: HttpMethod
    url: string
    query?: Record<string, string | number>
    body?: Body
    apiToken?: string
    contentType?: 'application/x-www-form-urlencoded' | 'application/json'
}

export type MethodOptions<Body> = Omit<RequestOptions<Body>, 'method'>

export type GetOptions = Omit<MethodOptions<never>, 'body'>
