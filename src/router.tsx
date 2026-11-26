import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LogInPage } from './pages/LogInPage';
import { WaybillPage } from './pages/WaybillPage';
import { PATHS } from './PATHS';

export const router = createBrowserRouter([
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: PATHS.login,
                element: <LogInPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        path: PATHS.home,
                        element: <WaybillPage />,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to={PATHS.home} replace />,
    },
]);
