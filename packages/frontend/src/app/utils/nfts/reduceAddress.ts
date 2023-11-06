/** Reduce address to view like **0x1234...5678** */
export const reduceAddress = (profileAddress: string) => {
  if (profileAddress.length < 16) return profileAddress
  if (profileAddress.length < 20) return `${profileAddress.slice(0, 6)}...`

  return `${profileAddress.slice(0, 6)}...${profileAddress.slice(-4)}`
}
