import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LateEntryForm from './late.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LateEntryForm />
  </StrictMode>,
)
