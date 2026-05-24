import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { HiOutlineMenu, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../component/LanguageSelector'

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <HiOutlineMenu className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 hidden lg:block">
          {t('admin_login.panel')}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSelector />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 bg-[#233480] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block font-medium text-gray-700 group-hover:text-[#233480]">
              {user?.name}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiOutlineLogout className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
