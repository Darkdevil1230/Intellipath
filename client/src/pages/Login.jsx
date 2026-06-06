import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';
import AuthFormField from '../components/auth/AuthFormField';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { authPrimaryButtonClass } from '../components/auth/authButtonClasses';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured =
    googleClientId &&
    googleClientId.endsWith('.apps.googleusercontent.com') &&
    !googleClientId.startsWith('your_');

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        toast.error('Google login failed. Please try again.');
        return;
      }

      try {
        setLoading(true);
        const googleResponse = await authService.loginWithGoogle(response.credential);
        setUser(googleResponse.user);
        setToken(googleResponse.token);
        toast.success("Welcome back! You're signed in.");
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    [navigate, setToken, setUser]
  );

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await authService.login(data);
      setUser(response.user);
      setToken(response.token);
      toast.success("Welcome back! You're signed in.");
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-6">
        <div className="space-y-1.5 text-center lg:text-left">
          <p className="hidden lg:flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            Welcome back
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to IntelliPath
          </h2>
          <p className="text-sm text-slate-500">Continue your personalized career journey.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthFormField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            registration={register('email')}
            error={errors.email?.message}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[13px] font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-900/10'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-[13px] text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {isGoogleConfigured ? (
            <div className="space-y-4">
              <div className="relative flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <GoogleSignInButton
                clientId={googleClientId}
                onCredential={handleGoogleCredentialResponse}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
              Google sign-in is not configured. Add{' '}
              <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> to your client{' '}
              <code className="text-xs">.env</code> file.
            </div>
          )}

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default Login;
