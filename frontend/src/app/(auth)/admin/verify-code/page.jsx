'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/auth/AuthLayout';
import ErrorMessage from '@/components/auth/ErrorMessage';
import toast from 'react-hot-toast';
import { create } from '@/lib/api';

function VerifyCodeForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'your email';

    const [code, setCode] = useState(['', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef([]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) return;

        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-advance to next input
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 5);
        if (digits.length === 5) {
            const newCode = digits.split('');
            setCode(newCode);
            inputRefs.current[4]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const codeString = code.join('');
        const email = localStorage.getItem('passwordResetEmail');

        // Validation
        if (codeString.length !== 5) {
            setError('Please enter the complete 5-digit code');
            return;
        }

        setIsLoading(true);



        try {

            const response = await create('/api/auth/password/verify/', { email, otp: codeString });
            console.log(response);

            if (response.detail === "OTP verified. You may set a new password now.") {
                toast.success('Verification code verified!');
                router.push('/admin/reset-password?code=' + codeString);
            } else {
                setError('Invalid verification code. Please try again.');
            }
        } catch (err) {
            const msg = err?.message || 'Invalid verification code. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const email = localStorage.getItem('passwordResetEmail');
            const response = await create('/api/auth/password/forgot/', { email });
            if (response.status === 200) {
                toast.success('Verification code sent to your email!');
            } else {
                setError('Failed to resend code. Please try again.');
            }
            setCode(['', '', '', '', '']);
            setError('');
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout
            title="Check your email"
            description={
                <>
                    We sent a code to your email address <span className="font-medium">{email}</span>. Please check your email for the 5 digit code.
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <ErrorMessage message={error} />

                {/* Verification Code Inputs */}
                <div className="flex justify-center gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border-primary focus-visible:border-primary focus-visible:ring-primary/50"
                            disabled={isLoading}
                            required
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading || code.join('').length !== 5}
                >
                    {isLoading ? 'Verifying...' : 'Verify'}
                </Button>

                {/* Resend Link */}
                <div className="text-center text-sm sm:text-base text-gray-600">
                    <span>You have not received the email? </span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-primary hover:opacity-80 font-medium transition-colors disabled:opacity-50 cursor-pointer hover:underline"
                    >
                        {isResending ? 'Sending...' : 'Resend'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}

export default function VerifyCode() {
    return (
        <Suspense fallback={
            <AuthLayout title="Check your email">
                <div className="text-center text-gray-600">Loading...</div>
            </AuthLayout>
        }>
            <VerifyCodeForm />
        </Suspense>
    );
}