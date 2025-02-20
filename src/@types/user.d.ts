
export type User = {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string | null;
  phone_number: string;
  address_1: string | null;
  address_2: string | null;
  access_level: string;
}

export type UserAsResponse = {
  id : number,
  email : string,
  full_name : string,
  created_at : string,
  updated_at : string | null,
  phone_number : string,
  address_1 : string | null,
  address_2 : string | null,
  access_level : string
}
export type UserSetting ={
  show_phone: boolean
  show_education_history: boolean
  show_job_history: boolean
}
export type UserChangePassword = {
  current_password:string
  new_password:string
  new_password_confirmation:string
}
export type LinksObject = {
  rel: string
  uri: string
}

export type IndexUserResponse = {
  status: 'success' | 'failed'
  message: string
  data: UserAsResponse[]
}

export type UserSearchResponse = {
  status: 'success' | 'failed'
  message: string
  data: UserAsResponse[]
}

export type UserSuggestionResponse = {
  status: 'success' | 'failed'
  timestamp: string
  data: UserAsResponse[]
}

export type AmountSingleResponse = {
  success: boolean
  message: string
  data: number
}

export type AmountArrayResponse = {
  success: boolean
  message: string
  data: UserByGeneration[]
}

export type UserByGeneration = {
  generation: number
  amount: number
}

export type SearchUserRequest = {
  search: string
}

export type IndexRegistrationResponse = {
  success: boolean
  data: {
    status: 'success' | 'failed'
    timestamp: string
    data: UserAsResponse[]
  }
}

export type ShowRegistrationResponse = {
  success: boolean
  data: {
    status: 'success' | 'failed'
    timestamp: string
    data: UserAsResponse[]
  }
}

export type showAdministratorsResponse = {
  status: 'success' | 'failed'
  timestamp: string
  data: Adminstrators[]
}

export type Adminstrators = {
  id: number
  user_id: string
  position: string
  bio: string
  created_at: string
  updated_at: string
  user: UserAsResponse
}