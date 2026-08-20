import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "@fontsource-variable/geist/wght.css";
import './style.css'
import './icons.css'
import Content from './pages/content/Content';
import Login from './pages/login/Login';
import Admin from './pages/admin/Admin';
import { RequireAuth } from './components/RequireAuth';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Content />} />
				<Route path="/login" element={<Login />} />
				<Route element={<RequireAuth />}>
					<Route path="/admin" element={<Admin />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
)