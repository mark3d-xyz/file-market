import { Tooltip } from '@nextui-org/react'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import BaseModal, {
  ErrorBody,
  InProgressBody,
  SuccessOkBody,
} from '../../../../../components/Modal/Modal'
import ImageLoader from '../../../../../components/Uploaders/ImageLoader/ImageLoader'
import NftLoader from '../../../../../components/Uploaders/NftLoader/NftLoader'
import { useCollectionAndTokenListStore, useStores } from '../../../../../hooks'
import { useCurrentBlockChain } from '../../../../../hooks/useCurrentBlockChain'
import { useAfterDidMountEffect } from '../../../../../hooks/useDidMountEffect'
import { useMediaMui } from '../../../../../hooks/useMediaMui'
import { useModalProperties } from '../../../../../hooks/useModalProperties'
import { usePublicCollectionStore } from '../../../../../hooks/usePublicCollectionStore'
import { useSubscribeToEft } from '../../../../../hooks/useSubscribeToEft'
import {
  Button,
  type ComboBoxOption,
  ControlledComboBox,
  FormControl,
  Input,
  Link,
  PageLayout,
  Txt,
} from '../../../../../UIkit'
import { TextArea } from '../../../../../UIkit/Form/TextArea/TextArea'
import TagsSection from '../../../../NFTPage/section/Tags/TagsSection'
import { type category, categoryOptions, type license, licenseInfo, licenseOptions, subcategory, tags } from '../../../helper/data/data'
import {
  ButtonContainer,
  Description,
  Form,
  Label,
  LabelWithCounter,
  LetterCounter,
  TextBold,
  TextGray,
  TitleGroup,
} from '../../../helper/style/style'
import { useCreateNft } from '../../../hooks/useCreateNft'
import PlusIcon from '../../../img/plus-icon.svg'
import {
  AddCollectionButton,
  CategoryAndSubcategory,
  CollectionPickerContainer,
  ContentField,
  Icon,
  NFTLicense,
  SubTitle,
} from './CreateEFTSection.styles'

export interface CreateNFTForm {
  image: FileList
  hiddenFile: FileList
  name: string
  collection: ComboBoxOption
  description: string
  tags: ComboBoxOption
  category: ComboBoxOption | null
  subcategory: ComboBoxOption | null
  license: ComboBoxOption
  licenseUrl: string
  tagsValue: string[]
  royalty: number
}

export const CreateEFTSection: React.FC = observer(() => {
  const { address } = useAccount()
  const location = useLocation()
  const predefinedCollection: {
    address: string
    name: string
  } | undefined = location.state?.collection

  const [chosenTags, setChosenTags] = useState<string[]>([])

  const {
    collectionMintOptions,
    isLoading: isCollectionLoading,
  } = useCollectionAndTokenListStore(address)
  const publicCollectionStore = usePublicCollectionStore()
  const { transferStore, dialogStore } = useStores()
  const { collectionAndTokenList } = useStores()
  const currentBlockChainStore = useCurrentBlockChain()
  const { modalBody, modalOpen, setModalBody, setModalOpen } =
    useModalProperties()
  const { subscribe } = useSubscribeToEft({ isDisableListener: true })
  const {
    createNft,
    error: nftError,
    isLoading: isNftLoading,
    result: nftResult,
    setError: setNftError,
    setIsLoading: setIsNftLoading,
  } = useCreateNft()
  const { adaptive } = useMediaMui()
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
    resetField,
    setValue,
    watch,
  } = useForm<CreateNFTForm>({
    defaultValues: {
      royalty: 0,
      name: '',
      collection: predefinedCollection
        ? { id: predefinedCollection.address, title: predefinedCollection.name }
        : undefined,
      description: '',
      category: null,
      subcategory: null,
      license: { id: licenseOptions[0].id, title: licenseOptions[0].title },
    },
  })

  const [choseTagValue, setChoseTagValue] = useState<string>('')

  const chosenTag = watch('tags')
  const chosenCategory = watch('category')
  const license = watch('license')
  const category = watch('category')
  const description = watch('description')
  const royalty = watch('royalty')

  const navigate = useNavigate()

  const onSubmit: SubmitHandler<CreateNFTForm> = (data) => {
    createNft(
      { ...data, tagsValue: chosenTags, licenseUrl },
      { isPublicCollection: data.collection.id === publicCollectionStore.data?.collection?.address },
    )
  }

  useEffect(() => {
    if (chosenTag && !chosenTags.includes(chosenTag.title)) setChosenTags([...chosenTags, chosenTag.title])
  }, [chosenTag])

  useAfterDidMountEffect(() => {
    if (isNftLoading) {
      setModalOpen(true)
      setModalBody(<InProgressBody text='EFT is being minted' />)
    } else if (nftError) {
      setModalOpen(true)
      setModalBody(
        <ErrorBody
          message={nftError}
          onClose={() => {
            setModalOpen(false)
          }}
        />,
      )
    } else if (nftResult) {
      subscribe({
        collectionAddress: nftResult?.receipt.to === null ? undefined : nftResult?.receipt.to,
        tokenId: nftResult?.tokenId,
      })
    }
  }, [nftError, isNftLoading])

  useEffect(() => {
    if (transferStore.isCanRedirectMint && nftResult) {
      const successMintDialogName = 'SuccessMintDialog'
      dialogStore.openDialog({
        component: BaseModal,
        props: {
          name: successMintDialogName,
          body: (
            <SuccessOkBody
              handleClose={() => { dialogStore.closeDialogByName(successMintDialogName) }}
              description="Your EFT is ready!"
            />
          ),
        },
      })
      const nftUrl = `/collection/${currentBlockChainStore.chain?.name}/${nftResult.receipt.to}/${nftResult.tokenId}`
      navigate(nftUrl)
      transferStore.setIsCanRedirectMint(false)
    }
  }, [transferStore.isCanRedirectMint, nftResult])

  const subcategoryOptions: ComboBoxOption[] = useMemo(() => {
    return subcategory[chosenCategory?.title as category]
  }, [chosenCategory])

  const licenseDescription = useMemo(() => {
    return licenseInfo[license?.title as license] ? licenseInfo[license?.title as license].description : 'Tags make it easier to find the right content'
  }, [license])

  const licenseUrl = useMemo(() => {
    return licenseInfo[license?.title as license] ? licenseInfo[license?.title as license].src : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }, [license])

  const saveValue = (value: string | undefined) => {
    if (value && !chosenTags.includes(value)) {
      setChosenTags([...chosenTags, value])
      resetField('tags')
    }
  }

  return (
    <>
      <BaseModal
        body={modalBody}
        open={modalOpen}
        isError={!!nftError}
        isLoading={isNftLoading}
        onClose={() => {
          setIsNftLoading(false)
          setNftError(undefined)
          setModalOpen(false)
        }}
      />
      <PageLayout
        isHasSelectBlockChain
        style={{
          minHeight: '100vh',
        }}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          <TitleGroup>
            <h3><Txt h3 style={{ fontWeight: '600' }}>Create New EFT</Txt></h3>
            <SubTitle>
              <Txt primary1>
                Using
                <Tooltip
                  placement={'bottomStart'}
                  content={(
                    <Txt secondary1 css={{ fontSize: '14px' }}>
                      {'Allows users to mint NFTs with attached encrypted files stored on decentralized storage, which can only be accessed exclusively by the owner of the NFT'}
                    </Txt>
                  )}
                  css={{
                    width: `${adaptive({
                      sm: '300px',
                      md: '400px',
                      defaultValue: '544px',
                    })}`,
                  }}
                >
                  {' '}
                  <Txt css={{ color: '$blue500', cursor: 'pointer' }}>Encrypted FileToken&#169;</Txt>
                  {' '}
                </Tooltip>
                Protocol
              </Txt>
            </SubTitle>
          </TitleGroup>

          <FormControl>
            <Label css={{ marginBottom: '$1' }}>Upload a public preview picture</Label>
            <Description>
              <TextBold>Formats:</TextBold>
              {' '}
              JPG, PNG or GIF.
              <TextBold> Max size:</TextBold>
              {' '}
              100 MB.
            </Description>
            <ImageLoader
              registerProps={register('image', { required: true })}
              resetField={resetField}
            />
          </FormControl>

          <FormControl>
            <Label css={{ marginBottom: '$1' }}>Upload any file that will be encrypted and hidden by EFT Protocol</Label>
            <Description>
              <TextBold>Formats:</TextBold>
              {' '}
              Any.
              <TextBold> Max size:</TextBold>
              {' '}
              200 MB.
            </Description>
            <NftLoader
              registerProps={register('hiddenFile', { required: true })}
              resetField={resetField}
            />
          </FormControl>

          <FormControl>
            <Label>Name</Label>
            <Input<CreateNFTForm>
              withoutDefaultBorder
              placeholder='Item name'
              controlledInputProps={{
                name: 'name',
                control,
                setValue,
                rules: {
                  required: true,
                },
              }}
            />
          </FormControl>

          <FormControl>
            <Label>Collection</Label>
            <CollectionPickerContainer>
              <ControlledComboBox<CreateNFTForm>
                name='collection'
                control={control}
                rules={{ required: true }}
                comboboxProps={{
                  options: [...collectionMintOptions, ...publicCollectionStore.collectionMintOptions],
                  isLoading: isCollectionLoading,
                }}
                onFocus={() => {
                  collectionAndTokenList.reload()
                }}
              />
              <a target={'_blank'} href={'/create/collection'} rel="noreferrer">
                <AddCollectionButton>
                  <Icon src={PlusIcon} />
                </AddCollectionButton>
              </a>
            </CollectionPickerContainer>
          </FormControl>

          <FormControl>
            <LabelWithCounter>
              <Label>
                Description&nbsp;&nbsp;
                <TextGray>(Optional)</TextGray>
              </Label>
              <LetterCounter
                style={{
                  color: description?.length > 1000 ? '#D81B60' : '#A7A8A9',
                }}
              >
                {description?.length}
                /1000
              </LetterCounter>
            </LabelWithCounter>

            <TextArea<CreateNFTForm>
              withoutDefaultBorder
              mint
              controlledInputProps={{
                control,
                name: 'description',
                rules: {
                  maxLength: { value: 1000, message: 'Aboba' },
                },
              }}
              placeholder='Description of your item'
            />
          </FormControl>

          <FormControl>
            <CategoryAndSubcategory>
              <div>
                <Label>Category</Label>
                <CollectionPickerContainer>
                  <ControlledComboBox<CreateNFTForm>
                    name='category'
                    control={control}
                    placeholder={'Select a category'}
                    rules={{ required: true }}
                    size={'md'}
                    comboboxProps={{
                      options: categoryOptions,
                    }}
                  />
                </CollectionPickerContainer>
              </div>

              <div>
                <Label>
                  Subcategory&nbsp;&nbsp;
                  <TextGray>(Optional)</TextGray>
                </Label>
                <CollectionPickerContainer>
                  <ControlledComboBox<CreateNFTForm>
                    name='subcategory'
                    control={control}
                    placeholder={'Select a subcategory'}
                    rules={{ required: false }}
                    isDisabled={!category}
                    size={'md'}
                    comboboxProps={{
                      options: subcategoryOptions,
                    }}
                  />
                </CollectionPickerContainer>
              </div>
            </CategoryAndSubcategory>
          </FormControl>

          <FormControl size={'lg'}>
            <LabelWithCounter>
              <Label paddingL>
                Tags&nbsp;&nbsp;
                <TextGray>(Optional)</TextGray>
              </Label>
              <LetterCounter
                style={{
                  color: choseTagValue.length > 35 ? '#D81B60' : '#A7A8A9',
                }}
              >
                {choseTagValue.length}
                /40
              </LetterCounter>
            </LabelWithCounter>
            <ContentField>
              <ControlledComboBox<CreateNFTForm>
                name='tags'
                control={control}
                placeholder={'Content tags'}
                rules={{ required: false }}
                rightContent={<Txt primary1 style={{ cursor: 'pointer', color: '#0090FF', fontSize: '14px' }}>Save</Txt>}
                comboboxProps={{
                  options: tags?.filter((tag) => !chosenTags.includes(tag.title)),
                }}
                onClickRightContent={(value) => {
                  choseTagValue.length <= 35 && saveValue(value)
                }}
                onEnter={(value) => {
                  choseTagValue.length <= 35 && saveValue(value)
                }}
                onChange={(value) => {
                  setChoseTagValue(value)
                }}
              />
              {chosenTags.length > 0 && (
                <TagsSection
                  tags={chosenTags}
                  tagOptions={{
                    isCanDelete: true,
                    onDelete: (value?: string) => {
                      if (value === chosenTag?.title) {
                        resetField('tags')
                      }
                      setChosenTags([...chosenTags?.filter((tag) => {
                        return tag !== value
                      })])
                    },
                  }}
                />
              )}
              {chosenTags.length <= 0 && (
                <Description secondary style={{ paddingLeft: '8px', marginBottom: '0' }}>
                  Tags make it easier to find the right content
                </Description>
              )}
            </ContentField>
          </FormControl>

          <FormControl size={'lg'}>
            <Label paddingL>Royalty</Label>
            <ContentField>
              <Input<CreateNFTForm>
                withoutDefaultBorder
                after="%"
                type='number'
                placeholder='Amount of creator’s royalty'
                controlledInputProps={{
                  name: 'royalty',
                  setValue,
                  control,
                  rules: {
                    min: 0,
                    required: true,
                    max: 50,
                  },
                }}
                css= {{
                  color: royalty > 50 || royalty < 0 ? '$red500' : undefined,
                }}
              />
              <Description
                secondary
                css={{
                  marginBottom: 0,
                  padding: '0 8px',
                  color: royalty > 50 ? '$red500' : undefined,
                }}
              >
                The allowable limit for specifying your royalty is no more than 50% of the transaction amount
              </Description>
            </ContentField>
          </FormControl>

          <FormControl size={'lg'}>
            <Label paddingL>License</Label>
            <ContentField>
              <ControlledComboBox<CreateNFTForm>
                name='license'
                control={control}
                placeholder={'License'}
                rules={{ required: true }}
                comboboxProps={{
                  options: licenseOptions,
                }}
              />
              <Description secondary style={{ marginBottom: '8px', padding: '0 16px' }}>
                <Txt style={{ fontWeight: '500', color: '#232528' }}>{licenseDescription.split(' ')[0]}</Txt>
                &nbsp;
                {licenseDescription.split(' ').slice(1, licenseDescription.split(' ').length).join(' ')}
                <NFTLicense style={{ marginTop: '8px' }}>
                  <Link
                    iconRedirect
                    style={{ fontWeight: '500' }}
                    href={licenseUrl}
                    target="_blank"
                  >
                    About CC Licenses
                  </Link>
                </NFTLicense>
              </Description>
            </ContentField>
          </FormControl>

          <ButtonContainer>
            <Button
              primary
              type='submit'
              isDisabled={!isValid || isNftLoading}
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
})
