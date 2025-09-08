import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useForm, validators, composeValidators } from '../hooks/useForm';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const initialValues: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { isAuthenticated, login, isLoading } = useAuth();
  const { error: showError, info } = useToast();
  const location = useLocation();
  
  // Redirect to original location after login
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  useEffect(() => {
    // Show demo credentials info
    info('Demo Login', 'Use email: admin@example.com, password: password');
  }, [info]);

  const validateLogin = (values: LoginFormData) => {
    const errors: Record<string, string> = {};

    const emailError = composeValidators(
      validators.required('Email is required'),
      validators.email()
    )(values.email);
    if (emailError) errors.email = emailError;

    const passwordError = validators.required('Password is required')(values.password);
    if (passwordError) errors.password = passwordError;

    return errors;
  };

  const form = useForm({
    initialValues,
    validate: validateLogin,
    onSubmit: async (values) => {
      try {
        await login({
          email: values.email,
          password: values.password,
        });
      } catch (error) {
        showError('Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
      }
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">UD</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User Management Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Sign in to your account to manage users
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={form.handleSubmit}>
            <div>
              <Input
                label="Email address"
                type="email"
                value={form.values.email}
                onChange={form.handleChange('email')}
                onBlur={form.handleBlur('email')}
                error={form.errors.email}
                placeholder="Enter your email"
                icon={<Mail />}
                autoComplete="email"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.values.password}
                  onChange={form.handleChange('password')}
                  onBlur={form.handleBlur('password')}
                  error={form.errors.password}
                  placeholder="Enter your password"
                  icon={<Lock />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[2.2rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={form.values.rememberMe}
                  onChange={form.handleChange('rememberMe')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading || form.isSubmitting}
                disabled={!form.isValid || isLoading || form.isSubmitting}
              >
                Sign in
              </Button>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Demo Credentials
            </h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div><strong>Email:</strong> admin@example.com</div>
              <div><strong>Password:</strong> password</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This is a demo application for showcasing user management capabilities.
          </p>
        </div>
      </div>
    </div>
  );
};
