'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
   

    return (
        <>
            {!isAdminRoute && <Navbar />}
            {children}
            {!isAdminRoute && <Footer />}
        </>
    );
}
