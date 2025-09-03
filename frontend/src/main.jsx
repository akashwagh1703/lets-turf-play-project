import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.jsx'
import QueryProvider from './components/QueryProvider.jsx'
import './index.css'

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryProvider>
        <App />
        <Toaster position="top-right" />
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)