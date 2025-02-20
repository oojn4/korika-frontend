interface ClientInputRegistrationData {
    fullname: string
    email: string
    password: string
    repeat_password:string
    nickname: string
    sex: string | null
    phone: string
    birthplace: string
    birthdate: string
    country_id: string | null
    province_id: string | null
    city_id: string | null
    address: string
    university_id: string | null
    status:string | null
    graduation_month_year: Date | null
    graduation_month:  number | null
    graduation_year:  number | null
    cohort: string
    major_id: string | null

    office_category_id: string | null
    nip:string,

    bps_province_id: string | null
    bps_city_id: string | null
    other_office_name: string
    org_unit: string
    office_province_id: string | null
    office_city_id: string | null
    start_working_month_year:Date | null
    start_working_month: number | null
    start_working_year: number | null
    is_working: string | null
    stop_working_month_year:Date | null
    stop_working_month: number | null
    stop_working_year:  number | null

    is_activated:string | null
    alumni_id:string
    [key: string]: any
  }
  
  