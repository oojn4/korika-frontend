import { AxiosError } from "axios";
import { showErrorNotification } from "./notifications";

export const showErrorFetching = (error: any) => {
    showErrorNotification(
    'error-fetch',
    (error instanceof AxiosError) ? `${error.status} ${error.response?.data.message}` : String(error),
    5000
  );
  console.error(error);
  return null;
}