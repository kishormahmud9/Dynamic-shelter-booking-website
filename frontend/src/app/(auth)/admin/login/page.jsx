'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/auth/AuthLayout';
import ErrorMessage from '@/components/auth/ErrorMessage';
import PasswordInput from '@/components/auth/PasswordInput';
import { validateEmail, validatePassword } from '@/lib/validation';
import { login } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const router = useRouter();
    const [rememberPassword, setRememberPassword] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load remembered email on mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('userEmail');
        const rememberMe = localStorage.getItem('rememberMe');

        if (rememberMe === 'true' && rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberPassword(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setIsLoading(true);

        try {
            // Make API call to login endpoint using helper function
            const response = await login(email, password);

            if (response?.user?.is_super_admin
                === true || response?.user?.is_normal_admin === true) {
                // Store remember password preference
                if (rememberPassword) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('userEmail', email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('userEmail');
                }
                toast.success('Login successful!');
                // Redirect to dashboard on successful login
                router.push("/admin/dashboard");
            } else {
                toast.error('Login failed. Please check your credentials and try again.');
                setError(response.message || 'Login failed. Please check your credentials and try again.');
                setIsLoading(false);
            }
        } catch (err) {
            // setError(err.message || 'Login failed. Please check your credentials and try again.');
            toast.error("Password is incorrect. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Login to Account"
            description="Please enter your email and password to continue"
        >
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <ErrorMessage message={error} />

                {/* Email Field */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email address
                    </label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password Field */}
                <PasswordInput
                    id="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                />

                {/* Remember Password & Forget Password */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={rememberPassword}
                                onChange={(e) => setRememberPassword(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm border-2 transition-all duration-200 flex items-center justify-center ${rememberPassword
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 bg-transparent'
                                }`}>
                                {rememberPassword && (
                                    <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="ml-2 text-sm sm:text-base text-gray-700">
                            Remember Password
                        </span>
                    </label>
                    <Link
                        href="/admin/forgot-password"
                        className="text-sm sm:text-base hover:underline hover:text-primary font-medium transition-colors"
                    >
                        Forget Password?
                    </Link>
                </div>

                {/* Sign In Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
        </AuthLayout>
    );
}