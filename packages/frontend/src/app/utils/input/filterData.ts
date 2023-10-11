export interface IFilterData {
  value: string
  pattern?: RegExp
  isLowerCase?: boolean
  isDisableEnglishPriority?: boolean
}

export const filterData = ({ value, pattern, isLowerCase, isDisableEnglishPriority }: IFilterData) => {
  let result = value
  if (isLowerCase) result = result.toLowerCase()
  if (!isDisableEnglishPriority) {
    const patternEnglish = /[a-zA-Z0-9!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/
    result = result.split('').filter(item => {
      return patternEnglish?.test(item) || item === ' '
    }).join('')
  }
  if (pattern) {
    result = result.split('').filter(item => {
      return pattern?.test(item)
    }).join('')
  }

  return result
}
