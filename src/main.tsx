import { StrictMode, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/geist/wght.css";
import './style.css'
import './icons.css'

const Introduction = lazy(() => import('./pages/Introduction/Introduction'));

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Suspense fallback={<div>Loading...</div>}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Introduction />} />
					</Routes>
				</BrowserRouter>
			</Suspense>
		</QueryClientProvider>
	</StrictMode>,
)
