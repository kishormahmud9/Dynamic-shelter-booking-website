"use client";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    LayoutDashboard,
    Users,
    User,
    Settings,
    HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navMain = [
    {
        label: "DashBoard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        activeIcon: HelpCircle
    },
    {
        label: "All Applications",
        icon: Users,
        href: "/admin/all-applications"
    },
    {
        label: "Administrators",
        icon: User,
        href: "/admin/administrator"
    },
    {
        label: "Program Manage",
        icon: Settings,
        href: "/admin/program-manage"
    },
];



export default function Sidebar({
    isSidebarOpen,
    mobileSidebar,
    setMobileSidebar,
}) {
    const pathname = usePathname();

    const isActive = (href) => {
        // Exact match
        if (pathname === href) {
            return true;
        }

        // For program-manage, also check sub-routes (like create-program)
        if (href === '/admin/program-manage' && pathname.startsWith('/admin/program-manage/')) {
            return true;
        }

        return false;
    };

    const SidebarContent = (
        <div className="flex flex-col h-full w-full transition-all duration-500 ease-in-out">
            {/* Logo */}
            <div className="flex justify-center items-center mt-5 mb-8 px-2 transition-all duration-500">
                <div className="bg-black rounded-lg p-3 transition-all duration-500">
                    <img
                        src="/assets/logo/logo.jpeg"
                        alt="Star Light Logo"
                        className={`${isSidebarOpen ? 'h-12 w-12' : 'h-10 w-10'} object-contain transition-all duration-500 ease-in-out`}
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className={`${isSidebarOpen ? 'px-4' : 'px-2'} flex-1 w-full transition-all duration-500 ease-in-out`}>
                <nav className="flex flex-col gap-2 w-full">
                    {navMain.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`w-full flex  items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-300 ease-in-out ${active
                                    ? "bg-gradient-to-r from-[#FFA100] to-[#FFD700] text-white shadow-md"
                                    : "text-gray-800 hover:bg-gray-100"
                                    }`}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                {active && item.activeIcon ? (
                                    <div className={`${isSidebarOpen ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-in-out`}>
                                        <item.activeIcon className={`${isSidebarOpen ? 'w-5 h-5' : 'w-4 h-4'} text-white transition-all duration-500 ease-in-out`} />
                                    </div>
                                ) : (
                                    <item.icon className={`w-6 h-6 font-bold ${active ? "text-white" : "text-gray-600"} flex-shrink-0 transition-colors duration-300`} />
                                )}
                                <span
                                    className={`text-xl font-bold ${active ? "text-white" : "text-gray-800"} whitespace-nowrap transition-all duration-500 ease-in-out ${isSidebarOpen
                                        ? 'opacity-100 max-w-full'
                                        : 'opacity-0 max-w-0 overflow-hidden'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-full">
                {SidebarContent}
            </div>

            {/* Mobile Sidebar */}
            <div className="flex md:hidden">
                <Sheet open={mobileSidebar} onOpenChange={setMobileSidebar}>
                    <SheetContent side="left" className="p-0 w-64">
                        <VisuallyHidden>
                            <SheetTitle>Star Light</SheetTitle>
                        </VisuallyHidden>
                        <div className="h-full overflow-y-auto">
                            <div className="flex flex-col h-full w-full">
                                {/* Logo */}
                                <div className="flex justify-center items-center mt-5 mb-8 px-2">
                                    <div className="bg-black rounded-lg p-3">
                                        <img
                                            src="/assets/logo/logo.jpeg"
                                            alt="Star Light Logo"
                                            className="h-12 w-12 object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="px-4 flex-1 w-full">
                                    <nav className="flex flex-col gap-2 w-full">
                                        {navMain.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    onClick={() => setMobileSidebar(false)}
                                                    className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-all ${active
                                                        ? "bg-gradient-to-r from-[#FFA100] to-[#FFD700] text-white shadow-md"
                                                        : "text-gray-800 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {active && item.activeIcon ? (
                                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                                            <item.activeIcon className="w-5 h-5 text-white" />
                                                        </div>
                                                    ) : (
                                                        <item.icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-600"} flex-shrink-0`} />
                                                    )}
                                                    <span className={`text-md font-medium ${active ? "text-white" : "text-gray-800"} whitespace-nowrap`}>
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}