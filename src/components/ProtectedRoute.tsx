import type { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box, CircularProgress } from '@mui/material';
import { authStore } from '../stores/AuthStore';
import { PATHS } from '../PATHS';

export const ProtectedRoute: FC = observer(() => {
    const location = useLocation();

    if (authStore.isAuthChecking) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!authStore.isAuthenticated) {
        return <Navigate to={PATHS.login} state={{ from: location }} replace />;
    }

    return <Outlet />;
});

export const PublicOnlyRoute: FC = observer(() => {
    if (authStore.isAuthChecking) return null;
    if (authStore.isAuthenticated) return <Navigate to={PATHS.home} replace />;
    return <Outlet />;
});
