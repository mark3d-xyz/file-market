import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'

import { AppLayout } from '../components/App'
import PrivateRouteJwt from '../HOC/PrivateRoute'
import { Params } from '../utils/router/Params'
import BrandingPage from './BrandingPage/BrandingPage'
import CheckCryptoPage from './CheckCryptoPage/CheckCryptoPage'
import CollectionPage from './CollectionPage/CollectionPage'
import { collectionPageRoutes } from './CollectionPage/routes'
import { createRoutes } from './CreatePage/routes'
import ExplorerPage from './ExplorerPage/ExplorerPage'
import FileBunniesPage from './FileBunnies/FileBunniesPage'
import MainPage from './MainPage/MainPage'
import MarketPage from './MarketPage/MarketPage'
import { marketRoutes } from './MarketPage/routes'
import NFTPage from './NFTPage/NFTPage'
import ProfilePage from './ProfilePage/ProfilePage'
import { profileRoutes } from './ProfilePage/routes'
import ProfileSettings from './ProfileSettings/ProfileSettings'
import SuccessSubscribePage from './SuccessSubscribePage/SuccessSubscribePage'

const routes: RouteObject[] = [
  {
    path: 'explorer',
    element: <ExplorerPage />,
  },
  {
    path: 'branding',
    element: <BrandingPage />,
  },
  {
    path: 'successGetAccess',
    element: <SuccessSubscribePage />,
  },
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: 'market',
    element: <MarketPage />,
    children: marketRoutes,
  },
  {
    path: 'create',
    children: createRoutes,
  },
  {
    path: `profile/:${Params.profileAddress}`,
    element: <ProfilePage />,
    children: profileRoutes,
  },
  {
    path: `collection/:${Params.chainName}/:${Params.collectionAddress}`,
    element: <CollectionPage />,
    children: collectionPageRoutes,
  },
  {
    path: `collection/:${Params.chainName}/:${Params.collectionAddress}/:${Params.tokenId}`,
    element: <NFTPage />,
  },
  {
    path: 'checkCrypto',
    element: <CheckCryptoPage />,
  },
  {
    path: 'settings',
    element: <PrivateRouteJwt />,
    children: [{
      path: '',
      element: <ProfileSettings />,
    }],
  },
  {
    path: 'fileBunnies',
    element: <FileBunniesPage />,
  },
  {
    path: '*',
    element: <Navigate replace to={''} />,
  },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: routes,
  },
])
