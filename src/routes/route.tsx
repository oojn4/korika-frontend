import { Navigate, Route, Routes } from 'react-router-dom'
import { UserAsResponse } from '../@types/user'
import { ADMINROUTES, AUTHROUTES, PROTECTEDROUTES, PUBLICROUTES } from '../constants/routeConstants'
import { checkAdminAccess } from '../utils/checkAccess'

const RouteApp = ({ isAuthenticated, user } : { isAuthenticated?: boolean, user?: UserAsResponse | null | undefined}) => {
  return (
    <Routes>
      {AUTHROUTES.map((ar, arIdx) =>
        <Route key={arIdx} path={ar.path} element={!isAuthenticated ? <ar.element /> : <Navigate to="/" />} />
      )}
      {ADMINROUTES.map((adr, adrIdx) => 
        <Route key={adrIdx} path={adr.path} element={isAuthenticated && checkAdminAccess(user?.access_level || '') ? <adr.element /> : <Navigate to="/" />} />
      )}
      {PROTECTEDROUTES.map((pr, prIdx) => 
        <Route key={prIdx} path={pr.path} element={isAuthenticated ? <pr.element /> : <Navigate to="/login" />} />
      )}
      {PUBLICROUTES.map((ur, urIdx) => 
        <Route key={urIdx} path={ur.path} element={<ur.element />} />
      )}
    </Routes>
  )
}

export default RouteApp