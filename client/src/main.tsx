import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { AtlasProvider } from './context'

import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AtlasProvider>
      <App />
    </AtlasProvider>
  </StrictMode>,
)
