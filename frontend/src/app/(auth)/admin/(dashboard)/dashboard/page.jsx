'use client';

import { useState, useEffect } from 'react';
import { Users, User, UserCheck, UsersRound, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { get } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [summaryData, setSummaryData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both APIs in parallel
                const [summaryResponse, monthlyResponse] = await Promise.all([
                    get('/api/auth/dashboard/summary/'),
                    get('/api/auth/dashboard/applications/monthly/')
                ]);

                setSummaryData(summaryResponse);
                setMonthlyData(monthlyResponse);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Map summary data to overview cards
    const overviewData = summaryData ? [
        // {
        //     title: 'Total User',
        //     value: summaryData.users_count?.toString() || '0',
        //     change: 'Total users',
        //     icon: Users,
        //     bgColor: 'bg-pink-100',
        //     iconColor: 'text-pink-600',
        //     changeColor: 'text-pink-500',
        // },
        {
            title: 'Total Applications',
            value: summaryData.total_applications_count?.toString() || '0',
            change: 'All time applications',
            icon: User,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            changeColor: 'text-yellow-500',
        },
        {
            title: 'Referred',
            value: summaryData.total_refer_count?.toString() || '0',
            change: 'Total referred',
            icon: UserCheck,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            changeColor: 'text-green-500',
        },
        // {
        //     title: 'Without Refer',
        //     value: summaryData.total_without_refer_count?.toString() || '0',
        //     change: 'Total without refer',
        //     icon: UsersRound,
        //     bgColor: 'bg-purple-100',
        //     iconColor: 'text-purple-600',
        //     changeColor: 'text-purple-500',
        // },
    ] : [];

    // Map monthly data to chart format
    const chartData = monthlyData?.labels?.map((label, index) => ({
        month: label,
        Applications: monthlyData.data[index] || 0,
    })) || [];

    // Calculate max value for Y-axis
    const maxValue = chartData.length > 0
        ? Math.max(...chartData.map(d => d.Applications), 0)
        : 10;
    const yAxisMax = Math.max(Math.ceil(maxValue * 1.2), 10); // Add 20% padding, minimum 10

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFA100] mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-[#FFA100] hover:bg-[#FF8C00] text-white"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Today's Overview Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Today's Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">Summary</p>
                    </div>
                   
                </div>

                {/* Overview Cards */}
                {overviewData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {overviewData.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={index}
                                    className={`${item.bgColor} rounded-xl p-6 transition-all hover:shadow-md flex items-center justify-between`}
                                >
                                    <div className={`${item.iconColor} bg-white rounded-full p-3 flex-shrink-0`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-3xl font-bold text-gray-800">{item.value}</h3>
                                        <p className="text-sm font-medium text-gray-600 mt-1">{item.title}</p>
                                        <p className={`text-xs font-medium ${item.changeColor} mt-1`}>
                                            {item.change}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                        <p>No overview data available</p>
                    </div>
                )}
            </div>

            {/* Monthly Applications Chart Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Applications</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 60,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="month"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                domain={[0, yAxisMax]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey="Applications"
                                fill="#FFA100"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[400px] text-gray-500">
                        <p>No data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}