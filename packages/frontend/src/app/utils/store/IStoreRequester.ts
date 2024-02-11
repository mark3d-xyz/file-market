import { action } from 'mobx'

import { type ErrorResponse, type HttpResponse } from '../../../swagger/Api'
import { type ErrorStore } from '../../stores/Error/ErrorStore'
import { errorResponseToMessage, stringifyError } from '../error'
import { tap } from '../structs'

/**
 * Maintains request statuses. Prohibits concurrent requests.
 * Error is supposed to be shown through ErrorStore.
 */
export interface IStoreRequester {
  isLoading: boolean // indicates, if the request is in process. Setting loading to false will cancel the request
  isLoaded: boolean
  errorStore: ErrorStore
  requestCount: number
  currentRequest?: RequestContext // current request. Helps to prevent concurrent request
  reset?: () => void
  reload?: () => void
}

export interface RequestContext {
  id: number
  req?: Promise<any>
}

export const storeRequestGeneric = <ResponseType>(
  target: IStoreRequester,
  requester: Promise<ResponseType>,
  responseHandler: (response: ResponseType) => void,
  errorHandler: (error: any) => void,
): void => {
  if (!target.currentRequest) {
    target.isLoading = true
    target.requestCount++
    const context: RequestContext = {
      id: target.requestCount,
    }
    const finish = (resultHandler: () => void) => {
      // handle result only if request is not replaced by another and not cancelled
      if (target.currentRequest?.id === context.id) {
        target.currentRequest = undefined
        target.isLoading = false
        resultHandler()
      }
      // check, if we need to handle request results
    }
    context.req = requester
      .then(
        tap(
          action((data) => {
            finish(() => {
              responseHandler(data)
            })
          }),
        ),
      )
      .catch(
        action((error) => {
          finish(() => {
            errorHandler(error)
          })
        }),
      )
    target.currentRequest = context
  }
}

// Promise will fire void if the error is thrown and handled
export const storeRequest = <Data>(
  target: IStoreRequester,
  requester: Promise<HttpResponse<Data, ErrorResponse>>,
  callback: (data: Data) => void,
  errorCallback?: (error: any) => void,
): void => {
  storeRequestGeneric(
    target,
    requester,
    response => {
      if (response.ok) {
        target.isLoaded = true
        callback(response.data)
      } else {
        target.errorStore.showError(errorResponseToMessage(response.error))
      }
    },
    error => {
      target.errorStore.showError(stringifyError(error))
      errorCallback?.(error)
    },
  )
}

export const storeRequestFetch = <Data>(
  target: IStoreRequester,
  requester: Promise<Data>,
  callback: (data: Data) => void,
): void => {
  storeRequestGeneric(
    target,
    requester,
    response => {
      target.isLoaded = true
      callback(response)
    },
    error => {
      target.errorStore.showError(stringifyError(error))
    },
  )
}

export const storeReset = <Target extends IStoreRequester>(target: Target) => {
  target.currentRequest = undefined // cancel current request
  target.isLoading = false
  target.isLoaded = false
}

export const storeRequestPromise = <Data>(
  target: IStoreRequester,
  requester: Promise<HttpResponse<Data, ErrorResponse>>,
): Promise<Data> => {
  return new Promise((resolve, reject) => {
    storeRequest(target, requester, (data) => { resolve(data) }, (error) => { reject(error) })
  })
}
