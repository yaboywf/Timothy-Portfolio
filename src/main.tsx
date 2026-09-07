import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'
import "@fontsource-variable/geist/wght.css";
import './style.css'
import './icons.css'
import Content from './pages/content/Content';
import Login from './pages/login/Login';
import Admin from './pages/admin/Admin';
import { RequireAuth } from './components/RequireAuth';
import { Lenis } from 'lenis/react';

const ProtectedAdmin = () => (
    <RequireAuth>
        <Admin />
    </RequireAuth>
);

render(
	<>
		<Lenis />
		<LocationProvider>
			<Router>
				<Route path="/" component={Content} />
				<Route path="/login" component={Login} />
				<Route path="/admin" component={ProtectedAdmin} />
			</Router>
		</LocationProvider>
	</>,
	document.getElementById('root')!
)