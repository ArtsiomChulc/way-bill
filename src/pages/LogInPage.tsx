import { type FC, type SyntheticEvent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { authStore } from '../stores/AuthStore';

type AuthMode = 'signin' | 'signup';

export const LogInPage: FC = observer(() => {
    const { error, isLoading, isAuthChecking } = authStore;

    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isSignUp = mode === 'signup';

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSignUp) {
            await authStore.signUp(email, password);
        } else {
            await authStore.signIn(email, password);
        }
    };

    const toggleMode = () => {
        authStore.clearError();
        setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    };

    if (isAuthChecking) {
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

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
                        <Stack sx={{alignItems: 'center'}}>
                            <DirectionsCarIcon color="primary" sx={{ fontSize: 40 }} />
                            <Typography variant="h5" sx={{fontWeight: 600}}>
                                Путевые листы
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isSignUp
                                    ? 'Создание новой учётной записи'
                                    : 'Вход в систему учёта ГСМ и пробега'}
                            </Typography>
                        </Stack>

                        <TextField
                            type="email"
                            label="Email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                            fullWidth
                        />

                        <TextField
                            type="password"
                            label="Пароль"
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            fullWidth
                        />

                        {error && <Alert severity="error">{error}</Alert>}

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            fullWidth
                        >
                            {isLoading
                                ? 'Загрузка...'
                                : isSignUp
                                    ? 'Зарегистрироваться'
                                    : 'Войти'}
                        </Button>

                        <Button
                            type="button"
                            size="small"
                            onClick={toggleMode}
                            disabled={isLoading}
                        >
                            {isSignUp
                                ? 'Уже есть аккаунт? Войти'
                                : 'Нет аккаунта? Зарегистрироваться'}
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
});
