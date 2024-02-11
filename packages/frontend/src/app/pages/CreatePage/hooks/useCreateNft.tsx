import { useState } from 'react'

import { useAfterDidMountEffect } from '../../../hooks/useDidMountEffect'
import {
  type MintNFTForm as FormToTransfer,
  useMintNFT,
} from '../../../processing/nft-interaction'
import { type CreateNFTForm } from '../EFT/sections/CreateEFT/CreateEFTSection'

const convertFormDataToNftDTO = (form: CreateNFTForm): FormToTransfer => {
  return {
    name: form.name,
    collectionAddress: form.collection.id,
    description: form.description,
    hiddenFile: form.hiddenFile[0],
    image: form.image[0],
    categories: [form.category?.title].filter(Boolean) as string[],
    subcategories: [form.subcategory?.title].filter(Boolean) as string[],
    license: form.license.title,
    licenseUrl: form.licenseUrl,
    tags: form.tagsValue,
    royalty: form.royalty,
  }
}

/** This hook is a wrapper above useMintNft hook. It provides methods to mint collection from given raw form */
export const useCreateNft = () => {
  const [formToTransfer, setFormToTransfer] = useState<FormToTransfer>({
    collectionAddress: '',
    description: '',
    hiddenFile: undefined,
    image: undefined,
    name: '',
  })
  const [options, setOptions] = useState<{ isPublicCollection?: boolean }>()
  const {
    mintNFT,
    setError,
    setIsLoading,
    setResult,
    statuses: { error, isLoading, result },
  } = useMintNFT()

  useAfterDidMountEffect(() => {
    mintNFT({
      ...formToTransfer,
      ...options,
    })
  }, [formToTransfer, options])

  return {
    createNft: (form: CreateNFTForm, options?: { isPublicCollection?: boolean }) => {
      setOptions(options)
      setFormToTransfer(convertFormDataToNftDTO(form))
    },
    error,
    setError,
    isLoading,
    setIsLoading,
    result,
    setResult,
  }
}
