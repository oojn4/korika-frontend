import { UserAsResponse } from "./user"

export type SignInCredential = {
  email: string
  password: string
}

export type ForgotPasswordReq = {
  email: string
}

export type SignInResponse = {
  user: UserAsResponse
  success: boolean
  message: string
  access_token: string
}

export type FetchProfileResponse = {
  success: boolean
  data: UserAsResponse
}

export type ResponseInfoObject = {
  status: 'success' | 'failed'
  error_code?: number
  message?: string
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
  name: string
  username: string
  password: string
}

