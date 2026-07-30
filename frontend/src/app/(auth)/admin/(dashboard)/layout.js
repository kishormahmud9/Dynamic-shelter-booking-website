"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./component/Sidebar";
import TopNavbar from "./component/TopNavbar";
import { getCurrentUser, isAuthenticated } from "@/lib/api";

export default function Layout({ children }) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            router.push('/admin/login');
            return;
        }

        // Get user data from API helper
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        } else {
            // If no user found, redirect to login
            router.push('/admin/login');
        }
    }, [router]);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <div
                    className={`
                        hidden md:flex overflow-y-auto border-r-2 border-gray-200
                        transition-all duration-500 ease-in-out bg-white
                        ${isSidebarOpen ? "w-64 lg:w-72" : "w-20"}
                    `}
                >
                    <AdminSidebar
                        isSidebarOpen={isSidebarOpen}
                        setMobileSidebar={setMobileSidebar}
                        mobileSidebar={mobileSidebar}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-500 ease-in-out">
                    <div className="flex-shrink-0">
                        <TopNavbar
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                            mobileSidebar={mobileSidebar}
                            setMobileSidebar={setMobileSidebar}
                            user={user}
                        />
                    </div>
                    <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-10 bg-[#f2f2f2] overflow-y-auto transition-all duration-500 ease-in-out">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}