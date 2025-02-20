import { lazy } from 'react'
import { Routes } from '../@types/route'

export const PROTECTEDROUTES: Routes = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    element: lazy(() => import('../pages/Dashboard/Dashboard')),
  }
]

export const ADMINROUTES: Routes = [
  {
    key: 'admin',
    name: 'Admin',
    path: '/admin',
    element: lazy(() => import('../pages/Admin/Admin')),
  },
]

export const PUBLICROUTES: Routes = [
  {
    key: 'home',
    name: 'Home',
    path: '/',
    element: lazy(() => import('../pages/Home/Home')),
  }
]

export const AUTHROUTES: Routes = [
  {
    key: 'login',
    name: 'Login',
    path: '/login',
    element: lazy(() => import('../pages/Login/Login')),
  },
  {
    key: 'register',
    name: 'Register',
    path: '/register',
    element: lazy(() => import('../pages/Register/Register')),
  }
]