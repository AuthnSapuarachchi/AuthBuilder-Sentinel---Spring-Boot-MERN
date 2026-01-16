import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

const UserDashboard = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                axios.defaults.withCredentials = true;
                
                console.log('Fetching dashboard from:', backendUrl + '/api/user/dashboard/user');
                const { data } = await axios.get(backendUrl + '/api/user/dashboard/user', {
                    withCredentials: true
                });
                
                console.log('Dashboard response:', data);
                
                if (data.success) {
                    setDashboardData(data.dashboard);
                    toast.success('Dashboard loaded successfully!');
                } else {
                    console.error('Dashboard fetch failed:', data.message);
                    toast.error(data.message || 'Failed to load dashboard');
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                toast.error(error.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [backendUrl]);

    if (loading) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!dashboardData) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-600">No dashboard data available</p>
                </div>
            </>
        );
    }

    const { user, stats, recentActivity } = dashboardData;

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h1>
                        <p className="text-gray-600">Here's an overview of your account</p>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                user.isVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {user.isVerified ? '✓ Verified' : '⚠ Unverified'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-lg font-medium text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="text-lg font-medium text-gray-900 capitalize">{user.role}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Account Age</p>
                                <p className="text-lg font-medium text-gray-900">{user.accountAge}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Two-Factor Authentication</p>
                                <p className={`text-lg font-medium ${
                                    user.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {user.twoFactorEnabled ? '🔒 Enabled' : '🔓 Disabled'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Account Status"
                            value={stats.accountStatus}
                            icon="✓"
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Security Level"
                            value={stats.securityLevel}
                            icon="🔒"
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Backup Codes"
                            value={stats.backupCodesRemaining}
                            subtitle="remaining"
                            icon="🔑"
                            color="bg-purple-500"
                        />
                        <StatCard
                            title="Active Sessions"
                            value={stats.activeSessions}
                            subtitle="devices"
                            icon="📱"
                            color="bg-indigo-500"
                        />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            <ActivityItem
                                label="Last Login"
                                value={new Date(recentActivity.lastLogin).toLocaleString()}
                                icon="🔐"
                            />
                            <ActivityItem
                                label="Account Created"
                                value={new Date(recentActivity.accountCreated).toLocaleString()}
                                icon="📅"
                            />
                            <ActivityItem
                                label="Last Updated"
                                value={new Date(recentActivity.lastUpdated).toLocaleString()}
                                icon="🔄"
                            />
                        </div>
                    </div>

                    {/* Security Recommendations */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                        <h2 className="text-2xl font-semibold mb-4">Security Recommendations</h2>
                        <div className="space-y-3">
                            {!user.twoFactorEnabled && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                    <p className="font-medium mb-2">🔒 Enable Two-Factor Authentication</p>
                                    <p className="text-sm text-blue-100 mb-3">
                                        Add an extra layer of security to your account
                                    </p>
                                    <button 
                                        onClick={() => navigate('/settings')}
                                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                                    >
                                        Enable 2FA
                                    </button>
                                </div>
                            )}
                            {!user.isVerified && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                    <p className="font-medium mb-2">✉️ Verify Your Email</p>
                                    <p className="text-sm text-blue-100">
                                        Please verify your email address to unlock all features
                                    </p>
                                </div>
                            )}
                            {stats.backupCodesRemaining === 0 && user.twoFactorEnabled && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                    <p className="font-medium mb-2">⚠️ No Backup Codes</p>
                                    <p className="text-sm text-blue-100 mb-3">
                                        Generate backup codes in case you lose access to your authenticator
                                    </p>
                                    <button 
                                        onClick={() => navigate('/settings')}
                                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                                    >
                                        Generate Codes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
        <div className="flex items-center justify-between mb-4">
            <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
                {icon}
            </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
            {value} {subtitle && <span className="text-sm text-gray-500 font-normal">{subtitle}</span>}
        </p>
    </div>
);

// Activity Item Component
const ActivityItem = ({ label, value, icon }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-gray-900 font-medium">{value}</p>
        </div>
    </div>
);

export default UserDashboard;
