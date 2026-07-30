export default function AuthLayout({ children, title, description }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf3e0] px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
                    {/* Logo Section */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-black rounded-xl p-4 sm:p-6">
                            <img
                                src="/assets/logo/logo.jpeg"
                                alt="Star Light Path Logo"
                                className="h-10 sm:h-14 md:h-20 w-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    {title && (
                        <h1 className="text-2xl sm:text-4xl font-semibold text-gray-800 text-center mb-5">
                            {title}
                        </h1>
                    )}

                    {/* Description */}
                    {description && (
                        <p className="text-gray-600 text-sm sm:text-base text-center mb-6 sm:mb-8">
                            {description}
                        </p>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
