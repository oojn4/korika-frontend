import { notifications } from "@mantine/notifications";
import { ReactElement } from "react";
import { checkIcon, speakerIcon, warnIcon, xIcon } from "../components/icons/notificationIcon";

const showErrorNotification = (id: string, message: string, time: number | null) => {
  showNotification(id, message, time, 'Gagal', 'red', xIcon);
}

const showSuccessNotification = (id: string, message: string, time: number | null) => {
  showNotification(id, message, time, 'Berhasil', 'green', checkIcon);
}

const showWarningNotification = (id: string, message: string, time: number | null) => {
  showNotification(id, message, time, 'Peringatan', 'yellow', warnIcon);
}

const showAnnouncementNotification = (id: string, message: string, time: number | null) => {
  showNotification(id, message, time, 'Informasi', 'blue', speakerIcon);
}

const showNotification = (id: string, message: string, time: number | null, title: string, color: string, icon: ReactElement) => {
  notifications.show({
    id: id,
    withCloseButton: true,
    autoClose: time || 5000,
    title: title,
    message: message || '',
    color: color,
    icon: icon,
    className: 'my-notification-class',
    loading: false,
  });
}

export { showAnnouncementNotification, showErrorNotification, showSuccessNotification, showWarningNotification };
