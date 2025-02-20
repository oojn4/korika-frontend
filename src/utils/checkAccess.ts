export const checkAdminAccess = (role : '' | string) => {
  let access : boolean = false
  if(['superadmin', 'admin'].includes(role)) access = true
  return access
}