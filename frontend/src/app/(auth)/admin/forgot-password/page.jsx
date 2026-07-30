'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/auth/AuthLayout';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { validateEmail } from '@/lib/validation';
import toast from 'react-hot-toast';
import { create } from '@/lib/api';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('passwordResetEmail');
        if (savedEmail) setEmail(savedEmail);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        setIsLoading(true);

        try {
            // API: /api/auth/password/forgot (email only)
            await create('/api/auth/password/forgot/', { email });

            // Store temporary data for the next steps
            localStorage.setItem('passwordResetEmail', email);
            localStorage.removeItem('passwordResetOtp');

            // Redirect to verification code page with email
            toast.success('Verification code sent to your email!');
            router.push('/admin/verify-code');

        } catch (err) {
            const msg = err?.message || 'Failed to send verification code. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forget Password?"
            description="Please enter your email to get verification code"
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
                        className="border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]"
                    />
                </div>

                {/* Continue Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending...' : 'Continue'}
                </Button>
            </form>
        </AuthLayout>
    );
}