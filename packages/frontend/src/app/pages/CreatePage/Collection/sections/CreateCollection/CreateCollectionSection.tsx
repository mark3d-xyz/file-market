import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { type Collection } from '../../../../../../swagger/Api'
import BaseModal, {
  ErrorBody,
  InProgressBody,
  SuccessOkBody,
} from '../../../../../components/Modal/Modal'
import ImageLoader from '../../../../../components/Uploaders/ImageLoader/ImageLoader'
import { useStores } from '../../../../../hooks'
import { useCurrentBlockChain } from '../../../../../hooks/useCurrentBlockChain'
import { useAfterDidMountEffect } from '../../../../../hooks/useDidMountEffect'
import useIntervalAsync from '../../../../../hooks/useIntervalAsync'
import { useModalProperties } from '../../../../../hooks/useModalProperties'
import { Button, FormControl, Input, PageLayout } from '../../../../../UIkit'
import { TextArea } from '../../../../../UIkit/Form/TextArea/TextArea'
import { ZeroAddress } from '../../../../../utils/constants'
import { stringifyError } from '../../../../../utils/error'
import { wrapRequest } from '../../../../../utils/error/wrapRequest'
import {
  ButtonContainer,
  Description,
  Form,
  Label,
  LabelWithCounter, LetterCounter,
  TextBold, TextGray,
  Title,
  TitleGroup,
} from '../../../helper/style/style'
import { useCreateCollection } from '../../../hooks/useCreateCollection'

export interface CreateCollectionForm {
  image: FileList
  name: string
  symbol: string
  description: string
}

const MAX_COUNT_TRY_INDEXER = 10

export default function CreateCollectionSection() {
  const [indexerCollectionInfo, setIndexerCollectionInfo] = useState<Collection | undefined>()
  const currentBlockChainStore = useCurrentBlockChain()
  const { address } = useAccount()

  const {
    register,
    handleSubmit,
    formState: { isValid },
    getValues,
    resetField,
    control,
    setValue,
  } = useForm<CreateCollectionForm>()

  const {
    error,
    isLoading,
    result,
    createCollection: mintCollection,
  } = useCreateCollection()

  const onSubmit: SubmitHandler<CreateCollectionForm> = (data) => {
    mintCollection(data)
  }

  const { dialogStore } = useStores()

  const navigate = useNavigate()

  const checkIsIndexerHasMintInfo = useCallback(async () => {
    if (!result?.collectionAddress) return
    try {
      const responseCollection = await wrapRequest(
        async () => currentBlockChainStore.api.collections.collectionsDetail(result?.collectionAddress),
      )
      setIndexerCollectionInfo(responseCollection?.collection)
    } catch (e) {
      flushIsMinted()
      setModalOpen(true)
      setModalBody(
        <ErrorBody
          message={stringifyError(e)}
          onClose={() => {
            setModalOpen(false)
          }
          }
        />)
    }
  }, [currentBlockChainStore.api, result?.collectionAddress])

  const { flush: flushIsMinted, run: runIsMinted, allRunsCount } = useIntervalAsync(() => {
    return checkIsIndexerHasMintInfo()
  }, 3000)

  useEffect(() => {
    console.log('COLLECTION')
    console.log(indexerCollectionInfo)
    if (indexerCollectionInfo?.address) {
      flushIsMinted()
      const successCreateCollectionDialogName = 'SuccessCreateCollectionDialog'
      dialogStore.openDialog({
        component: BaseModal,
        props: {
          name: successCreateCollectionDialogName,
          body: (
            <SuccessOkBody
              handleClose={() => { dialogStore.closeDialogByName(successCreateCollectionDialogName) }}
              description="Your Collection is ready!"
            />
          ),
        },
      })
      const collectionUrl = `/collection/${currentBlockChainStore.chain?.name}/${indexerCollectionInfo?.address}`
      navigate(collectionUrl)
    }
  }, [indexerCollectionInfo?.address])

  const { modalBody, setModalBody, modalOpen, setModalOpen } =
    useModalProperties()

  const loadingModalMainText = useMemo(() => {
    return allRunsCount > MAX_COUNT_TRY_INDEXER ? 'Attention! Your EFT collection have been successfully' +
      ' created! We are currently updating data from the blockchain' +
      ' to accurately display information about this for' +
      ' you. This may take some time, please wait.' : undefined
  }, [allRunsCount])

  useAfterDidMountEffect(() => {
    if (isLoading) {
      setModalOpen(true)
      setModalBody(<InProgressBody text='Collection is being minted' mainText={loadingModalMainText} />)
    } else if (error) {
      setModalOpen(true)
      setModalBody(
        <ErrorBody
          message={error}
          onClose={() => {
            setModalOpen(false)
          }
          }
        />,
      )
    } else if (result) {
      if (result.collectionAddress === ZeroAddress) {
        dialogStore.openDialog({
          component: BaseModal,
          props: {
            name: 'SuccessCreateCollectionDialog',
            body: (
              <SuccessOkBody
                handleClose={() => { dialogStore.closeDialogByName('SuccessCreateCollectionDialog') }}
                description="Your Collection is ready!"
              />
            ),
          },
        })
        const collectionUrl = `/profile/${address}`
        navigate(collectionUrl)
      } else {
        runIsMinted()
      }
    }
  }, [error, isLoading, result])

  useEffect(() => {
    if (!loadingModalMainText) return
    setModalOpen(true)
    setModalBody(<InProgressBody text='Collection is being minted' mainText={loadingModalMainText} />)
  }, [loadingModalMainText])

  const [textareaLength, setTextareaLength] = useState(
    getValues('description')?.length ?? 0,
  )

  return (
    <>
      <BaseModal
        body={modalBody}
        open={modalOpen}
        isError={!!error}
        isLoading={isLoading || (result && !indexerCollectionInfo?.address)}
        onClose={() => {
          setModalOpen(false)
        }}
      />
      <PageLayout style={{ minHeight: '100vh' }} isHasSelectBlockChain>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <TitleGroup><Title>Create New Collection</Title></TitleGroup>

          <FormControl>
            <Label css={{ marginBottom: '$3' }}>Upload a Logo</Label>
            <Description style={{ width: '320px' }}>
              <TextBold>Formats:</TextBold>
              {' '}
              JPG, PNG or GIF.
              <TextBold> Max size:</TextBold>
              {' '}
              100 MB.
              {' '}
              <TextBold>Recommended size:</TextBold>
              {' '}
              300x300 px
            </Description>
            <ImageLoader
              registerProps={register('image', { required: true })}
              resetField={resetField}
            />
          </FormControl>

          <FormControl>
            <Label>Display name</Label>
            <Input<CreateCollectionForm>
              withoutDefaultBorder
              placeholder='Collection name'
              controlledInputProps={{
                control,
                name: 'name',
                rules: { required: true },
                setValue,
              }}
            />
          </FormControl>

          <FormControl>
            <Label>Symbol</Label>
            <Input<CreateCollectionForm>
              withoutDefaultBorder
              placeholder='Collection short name (Bitcoin - BTC)'
              controlledInputProps={{
                control,
                name: 'symbol',
                rules: { required: true },
                setValue,
              }}
            />
          </FormControl>

          <FormControl>
            <LabelWithCounter>
              <Label>
                Description&nbsp;&nbsp;
                <TextGray>(Optional)</TextGray>
              </Label>
              <LetterCounter>
                {textareaLength}
                /1000
              </LetterCounter>
            </LabelWithCounter>

            <TextArea<CreateCollectionForm>
              withoutDefaultBorder
              mint
              controlledInputProps={{
                control,
                name: 'description',
              }}
              { ...control.register('description', {
                onChange(event) {
                  setTextareaLength(event?.target?.value?.length ?? 0)
                },
                maxLength: 1000,
              })
              }
              placeholder='Description of your token collection'
            />
          </FormControl>

          <ButtonContainer>
            <Button
              primary
              type='submit'
              isDisabled={!isValid || isLoading}
              title={isValid ? undefined : 'Required fields must be filled'}
              css={{
                width: '320px',
              }}
            >
              Mint
            </Button>
          </ButtonContainer>
        </Form>
      </PageLayout>
    </>
  )
}
