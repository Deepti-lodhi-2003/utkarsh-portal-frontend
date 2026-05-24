import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI, settingsAPI } from '../../services/api'
import { HiOutlineKey, HiOutlineCog, HiOutlineUser, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const Settings = () => {
  const { t } = useTranslation()
  const { user, setUser } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [profileLoading, setProfileLoading] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get()
      setSettings(res.data.data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
    setLoading(false)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setProfileLoading(true)

    try {
      const res = await authAPI.updateProfile(profileData)
      console.log('Profile update response:', res)
      
      const updatedUser = res.data?.data
      if (!updatedUser) {
        throw new Error('No user data in response')
      }

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setMessage({ type: 'success', text: t('admin_settings.profile.update_success') })
      setProfileLoading(false)

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || t('admin_settings.profile.update_failed')
      })
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('admin_settings.password.mismatch') })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('admin_settings.password.min_length') })
      return
    }

    setPasswordLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      })
      setMessage({ type: 'success', text: t('admin_settings.password.success') })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('admin_settings.password.failed')
      })
    }
    setPasswordLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('admin_settings.title')}</h1>
        <p className="text-gray-500 mt-1">{t('admin_settings.subtitle')}</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }) }}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'profile'
              ? 'border-[#233480] text-blue-900'
              : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
        >
          <div className="flex items-center gap-2">
            <HiOutlineUser className="w-5 h-5" />
            {t('admin_settings.tabs.profile')}
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }) }}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'password'
              ? 'border-[#233480] text-blue-900'
              : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
        >
          <div className="flex items-center gap-2">
            <HiOutlineKey className="w-5 h-5" />
            {t('admin_settings.tabs.security')}
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('system'); setMessage({ type: '', text: '' }) }}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'system'
              ? 'border-[#233480] text-blue-900'
              : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
        >
          <div className="flex items-center gap-2">
            <HiOutlineCog className="w-5 h-5" />
            {t('admin_settings.tabs.system')}
          </div>
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'error'
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {activeTab === 'profile' && (
          <>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#233480] to-[#34479e] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-white font-bold text-3xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <span className="mt-3 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {user?.role}
                  </span>

                  <div className="w-full mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{user?.mobile}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <HiOutlineMail className="w-5 h-5 text-gray-400" />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${user?.isEmailVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {user?.isEmailVerified ? t('admin_settings.profile.email_verified') : t('admin_settings.profile.email_not_verified')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">{t('admin_settings.profile.update_title')}</h2>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin_settings.profile.full_name')} *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin_settings.profile.email')} *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('admin_settings.profile.email_hint')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin_settings.profile.mobile')}
                    </label>
                    <input
                      type="text"
                      value={user?.mobile}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('admin_settings.profile.mobile_hint')}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-2.5 bg-[#233480] text-white font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {profileLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('admin_settings.profile.updating')}
                      </>
                    ) : t('admin_settings.profile.update_button')}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {activeTab === 'password' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HiOutlineKey className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{t('admin_settings.password.title')}</h2>
                  <p className="text-sm text-gray-500">{t('admin_settings.password.subtitle')}</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin_settings.password.current')} *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin_settings.password.new')} *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t('admin_settings.password.new_hint')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin_settings.password.confirm')} *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 bg-[#233480] text-white font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {passwordLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('admin_settings.password.updating')}
                    </>
                  ) : t('admin_settings.password.update_button')}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">{t('admin_settings.system.title')}</h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : settings ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">{t('admin_settings.system.site_name')}</p>
                    <p className="font-semibold text-blue-900 mt-1">{settings.siteName}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <p className="text-sm text-green-600 font-medium">{t('admin_settings.system.max_file_size')}</p>
                    <p className="font-semibold text-green-900 mt-1">{settings.maxFileSize}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium">{t('admin_settings.system.otp_expiry')}</p>
                    <p className="font-semibold text-purple-900 mt-1">{settings.otpExpireMinutes} {t('admin_settings.system.minutes')}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">{t('admin_settings.system.jwt_expiry')}</p>
                    <p className="font-semibold text-orange-900 mt-1">{settings.jwtExpire}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                    <p className="text-sm text-pink-600 font-medium">{t('admin_settings.system.contact_email')}</p>
                    <p className="font-semibold text-pink-900 mt-1 text-sm">{settings.contactEmail}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                    <p className="text-sm text-indigo-600 font-medium">{t('admin_settings.system.allowed_files')}</p>
                    <p className="font-semibold text-indigo-900 mt-1">{settings.allowedFileTypes?.join(', ')}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 sm:col-span-2">
                    <p className="text-sm text-teal-600 font-medium">{t('admin_settings.system.description')}</p>
                    <p className="font-semibold text-teal-900 mt-1">{settings.siteDescription}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{t('admin_settings.system.load_failed')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings