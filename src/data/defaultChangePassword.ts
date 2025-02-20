import { UserChangePassword } from "../@types/user";

const defaultChangePassword: UserChangePassword  = {
    current_password:"",
    new_password:"",
    new_password_confirmation:""
}
export default defaultChangePassword;