import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineAcademicCap,
  HiOutlineCog,
  HiOutlineX,
  HiOutlineShoppingCart
} from 'react-icons/hi'

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  const menuItems = [
    { name: t('admin_dashboard.title'), path: '/admin/dashboard', icon: HiOutlineHome },
    { name: t('admin_dashboard.stats.total_users'), path: '/admin/users', icon: HiOutlineUsers },
    { name: t('admin_dashboard.stats.total_jobs'), path: '/admin/jobs', icon: HiOutlineBriefcase },
    { name: t('admin_dashboard.stats.institutions'), path: '/admin/institutions', icon: HiOutlineOfficeBuilding },
    { name: 'Vendors', path: '/admin/vendors', icon: HiOutlineShoppingCart },
    { name: t('admin_dashboard.stats.trainings'), path: '/admin/trainings', icon: HiOutlineAcademicCap },
    { name: t('admin_dashboard.settings'), path: '/admin/settings', icon: HiOutlineCog },
  ]

  return (
    <aside className={`
      fixed top-0 left-0 z-[100] h-full w-64 bg-white border-r border-gray-200
      transform transition-all duration-300 ease-in-out
      lg:translate-x-0
      ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>
    
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#233480] truncate">
          {t('admin_dashboard.panel_title')}
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors group"
        >
          <HiOutlineX className="w-6 h-6 text-gray-500 group-hover:text-red-500" />
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose()
            }}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
              ${isActive
                ? 'bg-[#233480] text-white'
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
