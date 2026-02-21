import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './styles/index.css'
import PharmaPlusUIApp from './App.tsx'
import { ReduxStore } from './redux-delegate/redux-store/ReduxStore.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={ReduxStore}>
      <PharmaPlusUIApp />
    </Provider>
  </StrictMode>,
)
