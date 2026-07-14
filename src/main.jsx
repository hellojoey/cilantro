import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CilantroProvider } from './context/CilantroContext'
import Cilantro from './Cilantro'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CilantroProvider>
          <Cilantro />
        </CilantroProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
