import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HeroUIProvider } from '@heroui/react'

import { Application } from './application';

createRoot(document.getElementById('root')).render(

    <HeroUIProvider>
      <Application />
    </HeroUIProvider>

)
