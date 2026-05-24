import React, { useState, useEffect, Suspense } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './dashboard/context/AuthContext'

// Headers
import Header from './component/Header'
import CandidateHeader from './component/CandidateHeader'
import InstitutionHeader from './component/InstitutionHeader'

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

// Public Pages - Lazy Loaded
const Home = React.lazy(() => import('./page/Home'))
const AboutUs = React.lazy(() => import('./page/AboutUs'))
const FAQ = React.lazy(() => import('./page/FAQ'))
const PrivacyPolicy = React.lazy(() => import('./page/PrivacyPolicy'))
const TermsAndConditions = React.lazy(() => import('./page/TermsAndConditions'))
const ContactUs = React.lazy(() => import('./page/ContactUs'))
const CandidateLogin = React.lazy(() => import('./page/CandidateLogin'))
const InstitutionLogin = React.lazy(() => import('./page/InstitutionLogin'))
const CandidateRegister = React.lazy(() => import('./page/CandidateRegister'))
const InstitutionRegister = React.lazy(() => import('./page/InstitutionRegister'))
const ForgotPassword = React.lazy(() => import('./page/ForgotPassword'))

// Candidate Pages - Lazy Loaded
const CandidateDashboard = React.lazy(() => import('./page/CandidateDashboard'))
const CandidateSearchJob = React.lazy(() => import('./page/candidate/CandidateSearchJob'))
const CandidateAppliedJob = React.lazy(() => import('./page/candidate/CandidateAppliedJob'))
const JobDetails = React.lazy(() => import('./page/candidate/JobDetails'))
const ServiceRequestTracker = React.lazy(() => import('./page/candidate/ServiceRequestTracker'))
const TrainingTracker = React.lazy(() => import('./page/candidate/TrainingTracker'))

// Institution Pages - Lazy Loaded
const InstitutionDashboard = React.lazy(() => import('./page/InstitutionDashboard'))
const ShortlistedCandidates = React.lazy(() => import('./page/institution/ShortlistedCandidates'))
const RecentJobs = React.lazy(() => import('./page/institution/RecentJobs'))
const PostServiceRequest = React.lazy(() => import('./page/institution/PostServiceRequest'))
const ViewServiceRequest = React.lazy(() => import('./page/institution/ViewServiceRequest'))
const ServiceApplyReport = React.lazy(() => import('./page/institution/ServiceApplyReport'))
const PostJob = React.lazy(() => import('./page/institution/PostJob'))
const SearchCandidate = React.lazy(() => import('./page/institution/SearchCandidate'))
const CreateTraining = React.lazy(() => import('./page/institution/CreateTraining'))
const CreateVendorService = React.lazy(() => import('./page/institution/CreateVendorService'))
const MyVendorServices = React.lazy(() => import('./page/institution/MyVendorServices'))
const MyTrainings = React.lazy(() => import('./page/institution/MyTrainings'))
const InstitutionJobDetails = React.lazy(() => import('./page/institution/InstituteJobDetails'))
const EditJob = React.lazy(() => import('./page/institution/EditJob'))
const CandidateProfilePublic = React.lazy(() => import('./page/institution/CandidatePublicProfile'))

// Admin Pages - Lazy Loaded
const Layout = React.lazy(() => import('./dashboard/components/Layout'))
const Login = React.lazy(() => import('./dashboard/pages/Login'))
const Dashboard = React.lazy(() => import('./dashboard/pages/Dashboard'))
const Users = React.lazy(() => import('./dashboard/pages/Users'))
const Jobs = React.lazy(() => import('./dashboard/pages/Jobs'))
const Institutions = React.lazy(() => import('./dashboard/pages/Institutions'))
const Vendors = React.lazy(() => import('./dashboard/pages/Vendors'))
const Trainings = React.lazy(() => import('./dashboard/pages/Trainings'))
const Settings = React.lazy(() => import('./dashboard/pages/Settings'))

// Other Pages - Lazy Loaded
const IndustryService = React.lazy(() => import('./page/IndustryService'))
const IndustryServiceDetails = React.lazy(() => import('./page/IndustryServiceDetails'))
const VendorDirectory = React.lazy(() => import('./page/VendorDirectory'))
const VendorDetails = React.lazy(() => import('./page/VendorDetails'))
const KaushalSetu = React.lazy(() => import('./page/KaushalSetu'))
const KaushalSetuApply = React.lazy(() => import('./page/KaushalSetuApply'))
const VisionPage = React.lazy(() => import('./page/VisionPage'))
const CompanyJobs = React.lazy(() => import('./page/CompanyJobs'))
const TrainingDetails = React.lazy(() => import('./page/TrainingDetails'))
const TrainingRequest = React.lazy(() => import('./page/TrainingRequest'))
const OrganizationDetails = React.lazy(() => import('./page/OrganizationDetails'))

/* ================= Protected Route ================= */

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-10 text-center">Loading...</div>

  if (!user) return <Navigate to="/" />

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}

/* ================= App Content ================= */

const AppContent = () => {
  const location = useLocation()
  const { user } = useAuth()

  //  Check if current route is admin
  const isAdminRoute = location.pathname.startsWith('/admin')

  const renderHeader = () => {
    //  Admin routes pe koi header nahi
    if (isAdminRoute) return null

    if (!user) return <Header />
    if (user.role === 'institution') return <InstitutionHeader />
    if (user.role === 'candidate') return <CandidateHeader />

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {renderHeader()}

      {/*  pt-16 sirf non-admin routes ke liye */}
      <div className={`flex-1 ${isAdminRoute ? '' : 'pt-16'}`}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>

          {/* ================= ADMIN ================= */}

          <Route path="/admin/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="trainings" element={<Trainings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ================= PUBLIC ================= */}

          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsandcondition" element={<TermsAndConditions />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/login/candidate" element={<CandidateLogin />} />
          <Route path="/login/institution" element={<InstitutionLogin />} />
          <Route path="/register/candidate" element={<CandidateRegister />} />
          <Route path="/register/institution" element={<InstitutionRegister />} />

          {/* Public Access Pages */}
          <Route path="/industry-service" element={<IndustryService />} />
          <Route path="/industry-service-details/:id" element={<IndustryServiceDetails />} />
          <Route path="/vendor-directory" element={<VendorDirectory />} />
          <Route path="/vendor-details/:id" element={<VendorDetails />} />
           <Route path="/vendor-detail/:id" element={<IndustryServiceDetails />} />
          <Route path="/org-details/:id" element={<OrganizationDetails />} />
          <Route path="/kaushal-setu" element={<KaushalSetu />} />
          <Route path="/kaushal-setu-apply/:id" element={<KaushalSetuApply />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/company-jobs/:id" element={<CompanyJobs />} />
          <Route path="/training-details/:id" element={<TrainingDetails />} />
          <Route path="/training-request" element={<TrainingRequest />} />
          <Route path="/candidates/:id" element={<CandidateProfilePublic />} />
          <Route
            path="/search-job"
            element={
              <CandidateSearchJob />
            }
          />

          {/* ================= CANDIDATE PROTECTED ROUTES ================= */}

          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-job"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateSearchJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applied-job"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateAppliedJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-enquiries"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ServiceRequestTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-trainings"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <TrainingTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-details/:id"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <JobDetails />
              </ProtectedRoute>
            }
          />

          {/* ================= INSTITUTION PROTECTED ROUTES ================= */}

          <Route
            path="/institution/dashboard"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shortlisted-candidates"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <ShortlistedCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recent-jobs"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <RecentJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <PostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job/:jobId"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <InstitutionJobDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recent-jobs/edit-job/:id"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <EditJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-service-request"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <PostServiceRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-service-request"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <ViewServiceRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-apply-report"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <ServiceApplyReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-training"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <CreateTraining />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-vendors"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <CreateVendorService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-vendor"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <MyVendorServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-training"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <MyTrainings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-candidate"
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <SearchCandidate />
              </ProtectedRoute>
            }
          />

          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

/* ================= ROOT APP ================= */

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App