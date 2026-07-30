'use client';

import { Shield, Heart, Users, Sofa, Home, CheckCircle } from 'lucide-react';

export default function WhyChooseUs() {
    const features = [
        {
            icon: Shield,
            iconColor: 'text-green-600',
            title: 'Safe & Secure Living',
            description: 'We offer a safe and comfortable home where residents can live with peace of mind.',
        },
        {
            icon: Heart,
            iconColor: 'text-red-600',
            title: 'Compassionate Support',
            description: 'Our team offers caring and respectful support to ensure daily comfort and well-being.',
        },
        {
            icon: Users,
            iconColor: 'text-green-700',
            title: 'Strong Community',
            description: 'We build welcoming communities where residents feel connected, and at home.',
        },
        {
            icon: Sofa,
            iconColor: 'text-blue-600',
            title: 'Comfortable Shared Spaces',
            description: 'Our thoughtfully designed spaces promote ease, accessibility, and everyday comfort.',
        },
        {
            icon: Home,
            iconColor: 'text-yellow-600',
            title: 'Affordable Living Options',
            description: 'We offer cost-effective housing solutions without compromising quality or care.',
        },
        {
            icon: CheckCircle,
            iconColor: 'text-purple-600',
            title: 'Respect & Dignity',
            description: 'Every resident is treated with dignity, respect, and genuine understanding.',
        },
    ];

    return (
        <section className="w-full bg-gray-100 py-10 sm:py-12 md:py-14 lg:py-16 mt-5 lg:mt-10">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12 sm:mb-16 md:mb-20">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                        Why Choose Us
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        Thoughtfully designed living spaces built on care, safety, and community, creating comfort, dignity, trust, and belonging.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Icon */}
                                <div className="mb-4 sm:mb-5 md:mb-6">
                                    <IconComponent
                                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${feature.iconColor}`}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
