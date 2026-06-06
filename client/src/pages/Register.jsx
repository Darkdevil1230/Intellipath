import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, UserPlus } from 'lucide-react';
import authService from '../services/authService';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';
import AuthFormField from '../components/auth/AuthFormField';
import { authPrimaryButtonClass } from '../components/auth/authButtonClasses';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Registration successful. Please check your email to verify.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-7">
        <div className="space-y-1.5 text-center lg:text-left">
          <p className="hidden lg:flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            Get started
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join IntelliPath and unlock your personalized career roadmap.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthFormField
            id="name"
            label="Full name"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            registration={register('name')}
            error={errors.name?.message}
          />

          <AuthFormField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            registration={register('email')}
            error={errors.email?.message}
          />

          <AuthFormField
            id="password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            registration={register('password')}
            error={errors.password?.message}
          />

          <AuthFormField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <button type="submit" disabled={loading} className={`${authPrimaryButtonClass} mt-1`}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-slate-900 underline-offset-4 hover:underline dark:text-white"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default Register;
