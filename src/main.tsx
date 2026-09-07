import { render } from 'preact'
import { lazy, Suspense } from "preact/compat"
import { LocationProvider, Router, Route } from 'preact-iso'
import Content from './pages/content/Content';
import { SmoothScroll } from "./components/SmoothScroll"
import "lenis/dist/lenis.css"
import './style.css'
import './icons.css'

const Login = lazy(() => import("./pages/login/Login"))
const ProtectedAdmin = lazy(() => import("./pages/admin/layout"),)

render(
	<>
		<SmoothScroll />
		<LocationProvider>
			<Suspense fallback={<p>Loading...</p>}>
				<Router>
					<Route path="/" component={Content} />
					<Route path="/login" component={Login} />
					<Route path="/admin" component={ProtectedAdmin} />
				</Router>
			</Suspense>
		</LocationProvider>
	</>,
	document.getElementById('root')!
)