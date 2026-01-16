import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import NavBar from '../components/NavBar.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, userData } = useContext(AppContext);

  const [adminData, setAdminData] = useState(null);
  const [moderatorData, setModeratorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        axios.defaults.withCredentials = true;

        let endpoint = '';
        if (userData?.role === 'admin') {
          endpoint = '/api/user/dashboard/admin';
        } else if (userData?.role === 'moderator') {
          endpoint = '/api/user/dashboard/moderator';
        }

        console.log('Fetching dashboard from:', backendUrl + endpoint);
        
        const { data } = await axios.get(backendUrl + endpoint, {
          withCredentials: true
        });

        console.log('Dashboard response:', data);

        if (data.success) {
          // Store the dashboard data based on role
          if (userData?.role === 'admin') {
            setAdminData(data.dashboard);
          } else if (userData?.role === 'moderator') {
            setModeratorData(data.dashboard);
          }
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
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoggedIn) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    // Check if user has admin or moderator role
    if (userData?.role !== 'admin' && userData?.role !== 'moderator') {
      toast.error('Access denied. Admin or Moderator role required.');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [isLoggedIn, userData, navigate, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const isAdmin = userData?.role === 'admin';
  const isModerator = userData?.role === 'moderator';
  const dashboardData = isAdmin ? adminData : moderatorData;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-400">
      <NavBar />

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-slate-900 rounded-lg shadow-lg p-8 text-white">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">
              {isAdmin ? 'Admin Dashboard' : 'Moderator Dashboard'}
            </h1>
            <p className="text-gray-400">
              Welcome, {userData?.name}! You have{' '}
              <span className="text-indigo-400 font-semibold capitalize">{userData?.role}</span> access.
            </p>
          </div>

          {/* Check if dashboard data is loaded */}
          {!dashboardData ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No dashboard data available</p>
              <p className="text-gray-500 text-sm mt-2">Please check your connection and try again</p>
            </div>
          ) : (
            <>
              {/* Admin Only Section */}
              {isAdmin && dashboardData.overview && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg border border-purple-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">👑</span>
                    <h2 className="text-2xl font-semibold">Admin Overview</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-indigo-400">{dashboardData.overview.totalUsers}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Verified Users</p>
                      <p className="text-3xl font-bold text-green-400">{dashboardData.overview.verifiedUsers}</p>
                      <p className="text-sm text-gray-400 mt-1">{dashboardData.overview.verificationRate}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">2FA Enabled</p>
                      <p className="text-3xl font-bold text-yellow-400">{dashboardData.overview.users2FA}</p>
                      <p className="text-sm text-gray-400 mt-1">{dashboardData.overview.twoFactorAdoptionRate}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold">System Health</h3>
                    {dashboardData.systemHealth && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">Status</p>
                          <p className="text-green-400 font-semibold">{dashboardData.systemHealth.status}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">Uptime</p>
                          <p className="text-blue-400 font-semibold">{dashboardData.systemHealth.uptime}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">API Calls</p>
                          <p className="text-purple-400 font-semibold">{dashboardData.systemHealth.apiCalls?.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">Response Time</p>
                          <p className="text-indigo-400 font-semibold">{dashboardData.systemHealth.avgResponseTime}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {dashboardData.recentUsers && dashboardData.recentUsers.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Recent Users</h3>
                      <div className="bg-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-slate-700">
                            <tr>
                              <th className="text-left p-3 text-sm">Name</th>
                              <th className="text-left p-3 text-sm">Email</th>
                              <th className="text-left p-3 text-sm">Role</th>
                              <th className="text-left p-3 text-sm">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentUsers.slice(0, 5).map((user, index) => (
                              <tr key={user._id || index} className="border-t border-slate-700">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3 text-gray-400">{user.email}</td>
                                <td className="p-3">
                                  <span className="px-2 py-1 bg-purple-700 rounded text-xs capitalize">{user.role}</span>
                                </td>
                                <td className="p-3">
                                  {user.isAccountVerified ? (
                                    <span className="text-green-400">✓ Verified</span>
                                  ) : (
                                    <span className="text-yellow-400">⚠ Unverified</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Moderator Section (Both Admin and Moderator can see) */}
              {(isAdmin || isModerator) && dashboardData.stats && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-900 to-cyan-900 rounded-lg border border-blue-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🛡️</span>
                    <h2 className="text-2xl font-semibold">Moderation Dashboard</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-blue-400">{dashboardData.stats.totalUsers}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Pending Reports</p>
                      <p className="text-3xl font-bold text-yellow-400">{dashboardData.stats.pendingReports}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Resolved Today</p>
                      <p className="text-3xl font-bold text-green-400">{dashboardData.stats.resolvedToday}</p>
                    </div>
                  </div>

                  {dashboardData.recentUsers && dashboardData.recentUsers.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Recent Users</h3>
                      <div className="space-y-2">
                        {dashboardData.recentUsers.slice(0, 5).map((user, index) => (
                          <div key={user._id || index} className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.isAccountVerified 
                                ? 'bg-green-700 text-green-100' 
                                : 'bg-yellow-700 text-yellow-100'
                            }`}>
                              {user.isAccountVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboardData.tasks && (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-lg font-semibold">Active Tasks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">Pending Reviews</p>
                          <p className="text-yellow-400 font-bold text-xl">{dashboardData.tasks.pendingReviews}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">Flagged Content</p>
                          <p className="text-red-400 font-bold text-xl">{dashboardData.tasks.flaggedContent}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded">
                          <p className="text-gray-400 text-xs">User Reports</p>
                          <p className="text-orange-400 font-bold text-xl">{dashboardData.tasks.userReports}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Role Information */}
          <div className="p-6 bg-[#333A5C] rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Role-Based Access Control (RBAC)</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-purple-400">Admin Role</p>
                  <p className="text-sm text-gray-400">
                    Full system access with all privileges including user management and system configuration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-blue-400">Moderator Role</p>
                  <p className="text-sm text-gray-400">
                    Content moderation access with limited user management capabilities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-green-400">User Role</p>
                  <p className="text-sm text-gray-400">
                    Standard user access with personal account management only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
            >
              Account Settings
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
