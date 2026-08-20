import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource-variable/geist/wght.css";
import './style.css'
import './icons.css'

const Introduction = lazy(() => import('./pages/Introduction/Introduction'));

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Suspense fallback={<div>Loading...</div>}>
			<Introduction />
		</Suspense>
	</StrictMode>,
)
