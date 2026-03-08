import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PharmaPlusAppComponent } from './app/PharmaPlusAppComponent'
import './styles/index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <PharmaPlusAppComponent />
        </QueryClientProvider>
    </StrictMode>,
)
