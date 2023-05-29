import { AxiosRequestConfig } from 'axios'
import { RequestOptions } from './request-options'

export const mapRequestOptionsToAxios = <T>(
    options: RequestOptions<T>,
): AxiosRequestConfig => {
    const {
        method,
        url,
        body: data,
        query: params,
        apiToken,
        contentType,
    } = options

    const headers: Record<string, string> = {}

    if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`
    }

    if (contentType) {
        headers['Content-Type'] = contentType
    }

    return {
        method,
        url,
        data,
        params,
        headers,
    }
}
