import React, { type FC, type PropsWithChildren } from 'react'
import { Helmet } from 'react-helmet-async'

interface IHelmetProps extends PropsWithChildren {
  img: string
  title: string
  description: string
}

export const HelmetWrapper: FC<IHelmetProps> = ({
  img,
  description,
  title,
}) => {
  return (
    <Helmet>
      <meta property="og:image" content={img} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  )
}
