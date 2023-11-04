import { type ReactNode, useCallback, useEffect } from 'react'

import {
  ErrorBody,
  extractMessageFromError,
  InProgressBody,
  SuccessNavBody,
  SuccessOkBody,
} from '../components/Modal/Modal'
import { useModalProperties } from './useModalProperties'
import { type useStatusState } from './useStatusState'

type StatusStateType = ReturnType<typeof useStatusState>

export interface UseModalOkArgs {
  statuses: StatusStateType['statuses']
  loadingMsg: ReactNode
  okMsg: ReactNode
  waitForSign?: boolean
  successNavTo?: string
  okMsgUnderText?: ReactNode
  // error message is retrieved from error
}

export function useStatusModal({
  statuses: { isLoading, result, error },
  okMsg,
  loadingMsg,
  waitForSign = true,
  successNavTo,
  okMsgUnderText,
}: UseModalOkArgs) {
  const {
    modalOpen,
    setModalOpen,
    modalBody,
    setModalBody,
  } = useModalProperties()

  const handleClose = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  useEffect(() => {
    if (isLoading || result || error) {
      setModalOpen(true)
    }
  }, [isLoading, result, error])

  useEffect(() => {
    if (isLoading) {
      setModalBody(
        <InProgressBody
          text={loadingMsg}
          waitForSign={waitForSign}
        />,
      )
    } else if (result) {
      if (successNavTo) {
        setModalBody(
          <SuccessNavBody
            buttonText='Cool'
            underText={okMsgUnderText}
            mainText={okMsg}
            link={successNavTo}
            onPress={() => {
              window.scrollTo(0, 0)
              setModalOpen(false)
            }}
          />,
        )
      } else {
        setModalBody(
          <SuccessOkBody
            description={okMsg}
            handleClose={handleClose}
          />,
        )
      }
    } else if (error) {
      setModalBody(
        <ErrorBody
          message={extractMessageFromError(error)}
          onClose={handleClose}
        />,
      )
    }
  }, [isLoading, result, error, loadingMsg, okMsg, waitForSign, handleClose])

  return {
    modalProps: {
      body: modalBody,
      open: modalOpen,
      onClose: handleClose,
      isError: !!error,
      isLoading,
    },
    setModalOpen,
    setModalBody,
  }
}
