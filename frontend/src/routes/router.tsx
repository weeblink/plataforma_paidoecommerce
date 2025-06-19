import { createBrowserRouter } from 'react-router-dom'
import LoginPage from './login'
import AppLayout from './app'
import ErrorPage from './error-page'
import HomePage from './app/home'
import RegisterPage from './register'
import ResetPasswordPage from './reset-password'
import ResetPasswordLoader from './reset-password/loader'
import ResetPasswordErrorPage from './reset-password/error-page'
import CourseManagementPage from './app/courses-management'
import LeadsPage from './app/leads'
import CoursePage from './app/courses'
import ProfilePage from './app/profile'
import { CourseDetailsLoader } from './app/course-details/loader'
import CourseDetailsPage from './app/course-details'
import EmailMarketingPage from './app/email-marketing'
import PaymentPage from './app/payment'
import PaymentStatusPage from './app/payment/payment-status'
import PrivacyPolicy from './app/payment/privacy-politcs'
import TermsOfPurchase from './app/payment/terms-and-conditions'
import MentoringManagementPage from './app/mentoring-management'
import ExtraManagementPage from './app/extra-management'
import BannersManagementPage from './app/banners'
import MentoringPage from './app/mentoring'
import { MentoringDetailsLoader } from './app/mentoring-details/loader'
import MentoringDetailsPage from './app/mentoring-details'
import AdminMeetingsPage from './app/admin-mentoring-meetings'
import ExtraProductsPage from './app/extra'
import { ExtraDetailsLoader } from './app/extra-details/loader'
import ExtraProductDetailsPage from './app/extra-details'
import { MentoringCourseLoader } from './app/mentoring-course/loader'
import MentoringCoursePage from './app/mentoring-course'
import WhatsappConnections from '@/routes/app/whatsapp-connections'
import { ManageConnections } from '@/routes/app/manage-connections'
import MentoringGroupPage from '@/routes/app/mentoring-groups'
import PaymentPlatformsPage from './app/payment-platforms'
import CalculatorPage from './app/calculator'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/courses-management',
        element: <CourseManagementPage />,
      },
      {
        path: '/mentoring-management',
        element: <MentoringManagementPage />,
      },
      {
        path: '/extra-management',
        element: <ExtraManagementPage />,
      },
      {
        path: '/banners',
        element: <BannersManagementPage />,
      },
      {
        path: '/email-marketing',
        element: <EmailMarketingPage />,
      },
      {
        path: '/courses',
        element: <CoursePage />,
      },
      {
        path: '/courses/:id',
        loader: CourseDetailsLoader as never,
        element: <CourseDetailsPage />,
      },
      {
        path: '/mentoring',
        element: <MentoringPage />,
      },
      {
        path: '/mentoring/groups/:id',
        element: <MentoringGroupPage />,
      },
      {
        path: '/mentoring-details/:id',
        loader: MentoringDetailsLoader as never,
        element: <MentoringDetailsPage />,
      },
      {
        path: '/mentoring-course/:id',
        loader: MentoringCourseLoader as never,
        element: <MentoringCoursePage />,
      },
      {
        path: '/extra',
        element: <ExtraProductsPage />,
      },
      {
        path: '/extra/:id',
        loader: ExtraDetailsLoader as never,
        element: <ExtraProductDetailsPage />,
      },
      {
        path: '/admin-mentoring-meetings',
        element: <AdminMeetingsPage />,
      },
      {
        path: '/leads',
        element: <LeadsPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/payment/:type/:id',
        element: <PaymentPage />,
      },
      {
        path: '/payment/info/:payment_id',
        element: <PaymentStatusPage />,
      },
      {
        path: '/payment/privacy-politcs',
        element: <PrivacyPolicy />,
      },
      {
        path: '/payment/terms-and-conditions',
        element: <TermsOfPurchase />,
      },
      {
        path: '/whatsapp-connections',
        element: <WhatsappConnections />,
      },
      {
        path: '/whatsapp-connections/manage',
        element: <ManageConnections />,
      },
      {
        path: '/payment-platforms',
        element: <PaymentPlatformsPage />,
      },
      {
        path: '/calculator',
        element: <CalculatorPage /> 
      }
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
    errorElement: <ResetPasswordErrorPage />,
    loader: ResetPasswordLoader,
  },
])
