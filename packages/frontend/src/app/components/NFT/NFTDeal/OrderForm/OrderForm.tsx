/* eslint-disable react/jsx-one-expression-per-line */
import { observer } from 'mobx-react-lite'
import { type FC, useCallback } from 'react'
import { useForm } from 'react-hook-form'

import { fee } from '../../../../config/mark3d'
import { useSaleAmountWillReceived } from '../../../../hooks'
import { useCurrency } from '../../../../hooks/useCurrency'
import { useCurrentBlockChain } from '../../../../hooks/useCurrentBlockChain'
import { useTokenStore } from '../../../../hooks/useTokenStore'
import { Label } from '../../../../pages/CreatePage/helper/style/style'
import { useIsCreator } from '../../../../processing/nft-interaction/useIsCreator'
import { type TokenFullId } from '../../../../processing/types'
import { ButtonGlowing, Flex, FormControl, Input, PriceBadge } from '../../../../UIkit'
import { formatNumber } from '../../../../utils/number'
import { StyledFlex, StyledPriceDescription } from './OrderForm.styles'

export interface OrderFormValue {
  price: string
}

interface OrderFormRawValue {
  price: number | string
}

export interface OrderFormProps {
  defaultValues?: OrderFormValue
  onSubmit?: (value: OrderFormValue) => void
  tokenFullId: TokenFullId
  isOwner?: boolean
}

export const OrderForm: FC<OrderFormProps> = observer(({
  defaultValues,
  onSubmit,
  tokenFullId,
  isOwner,
}) => {
  const { formatRoyalty, toCurrency, fromCurrency } = useCurrency()
  const currentBlockChainStore = useCurrentBlockChain()

  const tokenStore = useTokenStore(tokenFullId.collectionAddress, tokenFullId.tokenId, currentBlockChainStore.chainId)

  const { isCreator } = useIsCreator(tokenStore.data)

  const importFormValue = useCallback((value?: OrderFormValue): OrderFormRawValue => ({
    price: value ? toCurrency(value.price) : '',
  }), [toCurrency])

  const exportFormValue = useCallback((rawValue: OrderFormRawValue): OrderFormValue => ({
    price: fromCurrency(+rawValue.price ?? 0).toString(),
  }), [fromCurrency])

  const { handleSubmit, control, watch, setValue } = useForm<OrderFormRawValue>({
    defaultValues: importFormValue(defaultValues),
  })
  const price = watch('price')
  const {
    amountWillReceived,
    amountWillReceivedUsd,
    isLoading,
  } = useSaleAmountWillReceived(tokenFullId, +price, isCreator)

  return (
    <form onSubmit={handleSubmit(values => {
      onSubmit?.(exportFormValue(values))
    })}
    >
      <FormControl>
        <Label css={{ textAlign: 'left' }}>Price</Label>
        <Flex w100 flexDirection='column' gap="$3">
          <Input<OrderFormRawValue>
            type="number"
            step="any"
            placeholder='Enter value'
            after={currentBlockChainStore.chain?.nativeCurrency.symbol}
            controlledInputProps={{
              control,
              name: 'price',
              rules: { required: true },
              setValue,
            }}
          />
          {(!!fee || !!tokenStore.data?.royalty) && (
            <StyledFlex flexDirection='column' gap={12}>
              <StyledPriceDescription>
                After reducing the total by
                {' '}
                {!!fee && (
                  <>
                    the marketplace commission
                    (<span>{fee}%</span>)
                  </>
                )}
                {!!fee && !!tokenStore.data?.royalty && ' and ' && !isOwner}
                {!!tokenStore.data?.royalty && (
                  <>
                    the author&apos;s royalty (<span>{formatRoyalty(BigInt(tokenStore.data.royalty ?? 0))}%</span>)
                  </>
                )}
                {' '}
                after the sale of an EFT, <span>you will receive:</span>
              </StyledPriceDescription>
              <PriceBadge
                size="md"
                background='secondary'
                right={`~${formatNumber(amountWillReceivedUsd, 2) || 0}$`}
                left={formatNumber(amountWillReceived, 3) || 0}
                isLoading={isLoading}
              />
            </StyledFlex>
          )}
        </Flex>
      </FormControl>
      <Flex w100 justifyContent='end'>
        <ButtonGlowing
          fullWidth
          type="submit"
        >
          Place order
        </ButtonGlowing>
      </Flex>
    </form>
  )
})
