import { makeAutoObservable, runInAction } from 'mobx';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { waybillStore } from './WaybillStore';

export class AuthStore {
    user: User | null = null;
    session: Session | null = null;
    isAuthChecking = true; // Идёт первичная проверка сессии при загрузке приложения
    isLoading = false;     // Идёт запрос входа или регистрации
    error: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
        this.initAuth();
    }

    private async initAuth() {
        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error) throw error;

            runInAction(() => {
                this.session = session;
                this.user = session?.user ?? null;
            });
        } catch (err) {
            console.error('Ошибка инициализации сессии:', err);
        } finally {
            runInAction(() => {
                this.isAuthChecking = false;
            });
        }

        supabase.auth.onAuthStateChange((_event, session) => {
            runInAction(() => {
                const prevUserId = this.user?.id;
                this.session = session;
                this.user = session?.user ?? null;
                this.isAuthChecking = false;

                // Если пользователь вышел или сменился аккаунт — очищаем данные путевых листов
                if (!session || prevUserId !== session.user.id) {
                    waybillStore.reset();
                }
            });
        });
    }

    async signIn(email: string, password: string): Promise<boolean> {
        this.isLoading = true;
        this.error = null;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        runInAction(() => {
            this.isLoading = false;
            if (error) {
                this.error = this.mapAuthError(error.message);
            } else {
                this.session = data.session;
                this.user = data.user;
            }
        });

        return !error;
    }

    async signUp(email: string, password: string): Promise<boolean> {
        this.isLoading = true;
        this.error = null;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        runInAction(() => {
            this.isLoading = false;
            if (error) {
                this.error = this.mapAuthError(error.message);
            } else {
                this.session = data.session;
                this.user = data.user;
            }
        });

        return !error;
    }

    async logout(): Promise<boolean> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Ошибка при выходе:', error.message);
            return false;
        }

        runInAction(() => {
            this.session = null;
            this.user = null;
            waybillStore.reset();
        });

        return true;
    }

    get isAuthenticated(): boolean {
        return Boolean(this.user && this.session);
    }

    clearError() {
        this.error = null;
    }

    private mapAuthError(message: string): string {
        if (message.includes('Invalid login credentials')) {
            return 'Неверный email или пароль';
        }
        if (message.includes('User already registered')) {
            return 'Пользователь с таким email уже зарегистрирован';
        }
        if (message.includes('Password should be at least')) {
            return 'Пароль должен содержать минимум 6 символов';
        }
        if (message.includes('rate limit')) {
            return 'Превышен лимит отправки писем. Попробуйте позже';
        }
        return message;
    }
}

export const authStore = new AuthStore();
