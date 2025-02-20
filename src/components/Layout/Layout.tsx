import { Suspense } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { ADMINROUTES, AUTHROUTES } from '../../constants/routeConstants'
import { RootState } from '../../store/store'
import LoaderComponent from '../LoaderComponent/LoaderComponent'
import AdminLayout from './LayoutTypes/AdminLayout'
import AuthLayout from './LayoutTypes/AuthLayout'
import PublicLayout from './LayoutTypes/PublicLayout'

const Layout = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const { pathname } = useLocation();

  let layout = <PublicLayout isAuthenticated={isAuthenticated} user={user} />

  if(AUTHROUTES.find((rt) => rt.path === pathname)){
    layout = <AuthLayout />
  }

  if(ADMINROUTES.find((rt) => rt.path === pathname)){
    layout = <AdminLayout isAuthenticated={isAuthenticated} user={user} />
  }

  return (
    <Suspense fallback={<LoaderComponent />}>
      {layout}
    </Suspense>
  )
}

export default Layout