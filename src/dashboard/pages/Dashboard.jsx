import { useState, useEffect } from 'react'
import api from '../../../src/services/api'
import {
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
  HiOutlineClock
} from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const StatCard = ({ title, value, icon: Icon, color, loading, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-2" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800 mt-1">{value?.toLocaleString() || 0}</p>
            {trend && (
              <span className={`text-sm font-medium flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <HiOutlineTrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        )}
      </div>
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [monthlyStats, setMonthlyStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      const data = res.data.data

      setStats(data.stats)
      setRecentUsers(data.recentUsers || [])
      setRecentJobs(data.recentJobs || [])
      setMonthlyStats(data.monthlyStats || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    setLoading(false)
  }

  const statCards = [
    {
      title: t('admin_dashboard.stats.total_users'),
      value: stats?.totalUsers,
      icon: HiOutlineUsers,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: 12.5
    },
    {
      title: t('admin_dashboard.stats.candidates'),
      value: stats?.totalCandidates,
      icon: HiOutlineUserGroup,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: 8.3
    },
    {
      title: t('admin_dashboard.stats.institutions'),
      value: stats?.totalInstitutions,
      icon: HiOutlineOfficeBuilding,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trend: 5.2
    },
    {
      title: t('admin_dashboard.stats.active_jobs'),
      value: stats?.activeJobs,
      icon: HiOutlineBriefcase,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      trend: 15.7
    },
    {
      title: t('admin_dashboard.stats.total_jobs'),
      value: stats?.totalJobs,
      icon: HiOutlineBriefcase,
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      trend: -2.1
    },
    {
      title: t('admin_dashboard.stats.applications'),
      value: stats?.totalApplications,
      icon: HiOutlineDocumentText,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      trend: 23.4
    },
    {
      title: t('admin_dashboard.stats.trainings'),
      value: stats?.totalTrainings,
      icon: HiOutlineAcademicCap,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      trend: 6.8
    },
    {
      title: t('admin_dashboard.stats.vendors'),
      value: stats?.totalVendors,
      icon: HiOutlineOfficeBuilding,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      trend: 4.1
    },
  ]

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const chartData = monthlyStats.map((stat, index) => ({
    name: monthNames[stat._id.month - 1] || `Month ${stat._id.month}`,
    users: stat.count
  }))

  const userDistribution = [
    { name: t('admin_dashboard.stats.candidates'), value: stats?.totalCandidates || 0, color: '#10B981' },
    { name: t('admin_dashboard.stats.institutions'), value: stats?.totalInstitutions || 0, color: '#8B5CF6' },
    { name: 'Admins', value: (stats?.totalUsers || 0) - (stats?.totalCandidates || 0) - (stats?.totalInstitutions || 0), color: '#3B82F6' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin_dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('admin_dashboard.welcome')}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-[#233480] text-white rounded-lg hover:bg-[#34479e] transition-colors flex items-center gap-2"
        >
          <HiOutlineClock className="w-5 h-5" />
          {t('admin_dashboard.refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('admin_dashboard.charts.user_growth')}</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('admin_dashboard.charts.user_distribution')}</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{t('admin_dashboard.recent.users')}</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">{t('admin_dashboard.recent.no_users')}</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
                        ${user.role === 'candidate' ? 'bg-blue-100 text-blue-700' : ''}
                        ${user.role === 'institution' ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{t('admin_dashboard.recent.jobs')}</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">{t('admin_dashboard.recent.no_jobs')}</div>
            ) : (
              recentJobs.map((job) => (
                <div key={job._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{job.title}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {job.institution?.organizationName}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${job.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${job.status === 'closed' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {job.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('admin_dashboard.quick_stats.pending')}</p>
              <p className="text-3xl font-bold mt-1">
                {loading ? '...' : ((stats?.totalJobs || 0) - (stats?.activeJobs || 0))}
              </p>
            </div>
            <HiOutlineClock className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('admin_dashboard.quick_stats.success_rate')}</p>
              <p className="text-3xl font-bold mt-1">
                {loading ? '...' : '94.5%'}
              </p>
            </div>
            <HiOutlineTrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">{t('admin_dashboard.quick_stats.avg_response')}</p>
              <p className="text-3xl font-bold mt-1">
                {loading ? '...' : '2.4h'}
              </p>
            </div>
            <HiOutlineClock className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard