import './polyfills'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import Loading from './app/pages/Loading/Loading'

const App = React.lazy(() => import('./App').then(module => ({ default: module.App })))

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <React.Suspense fallback={<Loading />}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
)
