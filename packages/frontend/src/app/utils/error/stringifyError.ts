import { type ErrorResponse } from '../../../swagger/Api'

export function stringifyError(error: any): string {
  console.log(error)
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    // Some time ago we took just error.stack
    // But that is not working if we rethrow the error. It just gets dirty with the stack.
    // So if the message is available, we just take the message
    if (error.message && error.name) {
      return `${error.name}: ${error.message}`
    } else if (error.message) {
      return error.message
    } else if (error.stack) {
      return error.stack
    }
  }
  let str
  try {
    str = JSON.stringify(error)
    if (str === '{}') {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      str = error + ''
    }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    str = (error + '')
  }

  return str
}

export function errorResponseToMessage(error?: ErrorResponse): string {
  if (!error) {
    return 'received nullish error from the backend, but request was not successful'
  }

  return (error.message || 'Unknown Error') + (error.detail ? `: ${error.detail}` : '') + ' Please try again'
}
