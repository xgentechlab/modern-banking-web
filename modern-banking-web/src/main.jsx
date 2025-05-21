import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import reportWebVitals from './utils/reportWebVitals'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
     staleTime: 0,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}  >
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

// Report web vitals
reportWebVitals(console.log)
