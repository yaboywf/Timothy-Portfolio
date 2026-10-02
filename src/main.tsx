import { render } from "preact";
import { ErrorBoundary, lazy, LocationProvider, Route, Router } from "preact-iso";
import { SmoothScroll } from "./components/SmoothScroll";
import { auth } from "./lib/neon";
import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import "lenis/dist/lenis.css";
import "./style.css";
import "./icons.min.css";

const Content = lazy(() => import("./pages/content/Content"));
const Login = lazy(() => import("./pages/login/Login"));
const ProtectedAdmin = lazy(() => import("./pages/admin/layout"));

render(
    <>
        <SmoothScroll />

        <LocationProvider>
            <ErrorBoundary onError={(error) => console.error(error)}>
                <NeonAuthUIProvider authClient={auth} defaultTheme="light" social={{ providers: ["google"] }} redirectTo="/admin">
                    <Router>
                        <Route path="/" component={Content} />
                        <Route path="/login" component={Login} />
                        <Route path="/admin" component={ProtectedAdmin} />
                        <Route default component={Content} />
                    </Router>
                </NeonAuthUIProvider>
            </ErrorBoundary>
        </LocationProvider>
    </>,
    document.getElementById("root")!,
);
