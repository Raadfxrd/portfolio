import {ref} from "vue";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

const notifications = ref<Notification[]>([]);

export const useNotification = () => {
    const addNotification = (
        type: NotificationType,
        message: string,
        duration: number = 5000,
    ) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const notification: Notification = {id, type, message, duration};

        notifications.value.push(notification);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    const removeNotification = (id: string) => {
        notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    const success = (message: string, duration?: number) => {
        addNotification("success", message, duration);
    };

    const error = (message: string, duration?: number) => {
        addNotification("error", message, duration);
    };

    const warning = (message: string, duration?: number) => {
        addNotification("warning", message, duration);
    };

    const info = (message: string, duration?: number) => {
        addNotification("info", message, duration);
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
    };
};
