import React, { type FC } from 'react'
import { Helmet } from 'react-helmet-async'

interface IHelmetProps {
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
