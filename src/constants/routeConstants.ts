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
  {
    key: 'upload-data',
    name: 'Upload Actual Data',
    path: '/upload-data',
    element: lazy(() => import('../pages/Admin/UploadData')),
  },
  {
    key: 'raw-data',
    name: 'Raw Data',
    path: '/raw-data',
    element: lazy(() => import('../pages/Admin/RawData')),
  },
  {
    key: 'training-model',
    name: 'Create Prediction Data',
    path: '/training-model',
    element: lazy(() => import('../pages/Admin/TrainingModel')),
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