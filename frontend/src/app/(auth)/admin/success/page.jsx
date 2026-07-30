'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/auth/AuthLayout';

export default function Success() {
    const router = useRouter();

    const handleSignIn = () => {
        router.push('/admin/login');
    };

    return (
        <AuthLayout
            title="Password Updated Successfully!"
            description="Your new password has been saved. You can now continue securely."
        >
            <Button
                type="button"
                onClick={handleSignIn}
                variant="primary"
                className="w-full"
            >
                Sign In
            </Button>
        </AuthLayout>
    );
}