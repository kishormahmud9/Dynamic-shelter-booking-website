'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/auth/AuthLayout';
import ErrorMessage from '@/components/auth/ErrorMessage';
import PasswordInput from '@/components/auth/PasswordInput';
import { validatePassword, validatePasswordsMatch } from '@/lib/validation';
import { create } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        const matchError = validatePasswordsMatch(newPassword, confirmPassword);
        if (matchError) {
            setError(matchError);
            return;
        }

        setIsLoading(true);

        try {
            const email = localStorage.getItem('passwordResetEmail');
            const response = await create('/api/auth/password/reset/', { email, new_password: newPassword, new_password_confirm: confirmPassword });

            if (response.detail === "Password reset successful. Please log in with your new password.") {
                toast.success('Password reset successful!');
                localStorage.removeItem('passwordResetEmail');
                localStorage.removeItem('passwordResetOtp');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('rememberMe');
                router.push('/admin/success');
            } else {
                setError('Failed to reset password. Please try again.');
            }

        } catch (err) {
            const msg = err?.message || 'Failed to reset password. Please try again.';
            setError(msg);
            toast.error(msg);
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Set a new password"
            description="Create a new password. Ensure it differs from previous ones for security"
        >
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <ErrorMessage message={error} />

                <PasswordInput
                    id="newPassword"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isLoading}
                />

                <PasswordInput
                    id="confirmPassword"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
        </AuthLayout>
    );
}