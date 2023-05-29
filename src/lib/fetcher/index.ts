/* eslint-disable indent */
import axios from 'axios'
import { Logger } from 'winston'
import { baseLogger } from '..'
import { HttpMethod } from './http-method'
import { mapRequestOptionsToAxios } from './mapper'
import { GetOptions, MethodOptions, RequestOptions } from './request-options'
import { RequestError } from './request-error'
import { AxiosError } from 'axios'

const request = async <Body, Response>(
    options: RequestOptions<Body>,
    logger: Logger = baseLogger,
): Promise<Response> => {
    try {
        const { method, url } = options
        logger.info(`Making ${method} request to ${url}`, options)

        const response = await axios.request(mapRequestOptionsToAxios(options))
        logger.info('Response', response)

        return response.data
    } catch (error) {
        const requestError =
            error instanceof AxiosError
                ? new RequestError(+(error.code as string), error.message)
                : new RequestError(
                      500,
                      (error as Error).message ?? 'Unknown error occured',
                  )

        logger.error('Error occured while making request', requestError)
        throw requestError
    }
}

const get = async <Response>(
    options: GetOptions,
    logger: Logger = baseLogger,
) => {
    return request<never, Response>(
        { ...options, method: HttpMethod.Get },
        logger,
    )
}

const post = async <Response, Body = unknown>(
    options: MethodOptions<Body>,
    logger: Logger = baseLogger,
) => {
    return request<Body, Response>(
        { ...options, method: HttpMethod.Post },
        logger,
    )
}

export const fetcher = {
    request,
    get,
    post,
}
