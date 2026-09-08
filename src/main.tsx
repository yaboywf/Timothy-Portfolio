import { render } from 'preact'
import { LocationProvider, Router, Route, ErrorBoundary, lazy } from 'preact-iso'
import { SmoothScroll } from "./components/SmoothScroll"
import "lenis/dist/lenis.css"
import './style.css'
import './icons.css'

const Content = lazy(() => import('./pages/content/Content'));
const Login = lazy(() => import("./pages/login/Login"))
const ProtectedAdmin = lazy(() => import("./pages/admin/layout"),)

render(
	<>
		<SmoothScroll />
		<LocationProvider>
			<ErrorBoundary onError={error => console.error(error)}>
				<Router>
					<Route path="/" component={Content} />
					<Route path="/login" component={Login} />
					<Route path="/admin" component={ProtectedAdmin} />
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	</>,
	document.getElementById('root')!
)