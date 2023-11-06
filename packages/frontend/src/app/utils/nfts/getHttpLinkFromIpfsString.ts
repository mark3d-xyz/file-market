export const getIpfsCidWithFilePath = (ipfs: string) => {
  const pattern = /ipfs:\/\/([A-Za-z0-9/.-_]+)/

  return pattern.exec(ipfs)?.[1] ?? ''
}

export const getHttpLinkFromIpfsString = (ipfs: string) => {
  if (!ipfs) return ''
  const cidWithFilePath = getIpfsCidWithFilePath(ipfs)

  return `https://gateway.mesh3.network/ipfs/${cidWithFilePath}`
}
