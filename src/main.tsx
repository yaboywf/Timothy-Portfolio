import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource-variable/geist/wght.css";
import './style.css'
import './icons.css'
import Content from './content/Content';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Content />
	</StrictMode>
)