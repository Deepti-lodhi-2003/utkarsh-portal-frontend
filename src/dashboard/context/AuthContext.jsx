



import { createContext, useContext, useState, useEffect } from 'react'
import api from '../../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

const checkAuth = async () => {
  const token = localStorage.getItem('accessToken')

  if (!token) {
    setLoading(false)
    return
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token}`

    const res = await api.get('/auth/me')
    setUser(res.data.data.user)

  } catch {
    logout()
  } finally {
    setLoading(false)
  }
}


  const login = async (mobile, password) => {
    try {
      const res = await api.post('/auth/login', { mobile, password })

      const loggedUser = res?.data?.data?.user
      const accessToken = res?.data?.data?.accessToken
      const refreshToken = res?.data?.data?.refreshToken

      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(loggedUser))
      localStorage.setItem('role', loggedUser.role)
       api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      setUser(loggedUser)

      return { success: true, role: loggedUser.role }

    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    }
  }

 const logout = () => {
  // Get role before clearing
  const role = localStorage.getItem('role');
  
  // Clear all auth data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  
  setUser(null);
  
  // Redirect based on role
  if (role === 'admin') {
    window.location.href = '/admin/login';
  } else if (role === 'candidate') {
    window.location.href = '/login/candidate';
  } else if (role === 'institution') {
    window.location.href = '/login/institution';
  } else {
    window.location.href = '/';
  }
}

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
