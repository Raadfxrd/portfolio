<template>
  <div
      class="pointer-events-none fixed bottom-4 left-1/2 z-9999 flex -translate-x-1/2 flex-col gap-3"
  >
    <AnimatePresence>
      <Motion
          v-for="notification in notifications"
          :key="notification.id"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :class="getNotificationClasses(notification.type)"
          :exit="{ opacity: 0, y: 20, scale: 0.9 }"
          :initial="{ opacity: 0, y: 30, scale: 0.95 }"
          :transition="{ duration: 0.3 }"
          class="pointer-events-auto flex min-w-[320px] items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm"
      >
        <!-- Icon -->
        <div class="shrink-0">
          <component
              :is="getIconComponent(notification.type)"
              class="h-5 w-5"
          />
        </div>

        <!-- Message -->
        <div class="flex-1">
          <p class="text-sm leading-5 font-medium">
            {{ notification.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
            class="shrink-0 opacity-70 transition-opacity hover:opacity-100"
            @click="removeNotification(notification.id)"
        >
          <XMarkIcon class="h-4 w-4"/>
        </button>
      </Motion>
    </AnimatePresence>
  </div>
</template>

<script lang="ts" setup>
import {AnimatePresence, Motion} from "motion-v";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from "@heroicons/vue/24/outline";
import {type NotificationType, useNotification} from "~/composables/useNotification";

const {notifications, removeNotification} = useNotification();

const getNotificationClasses = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "bg-green-900/20 border-green-500/50 text-green-400";
    case "error":
      return "bg-red-900/20 border-red-500/50 text-red-400";
    case "warning":
      return "bg-yellow-900/20 border-yellow-500/50 text-yellow-400";
    case "info":
      return "bg-blue-900/20 border-blue-500/50 text-blue-400";
    default:
      return "bg-gray-900/20 border-gray-500/50 text-gray-400";
  }
};

const getIconComponent = (type: NotificationType) => {
  switch (type) {
    case "success":
      return CheckCircleIcon;
    case "error":
      return XCircleIcon;
    case "warning":
      return ExclamationTriangleIcon;
    case "info":
      return InformationCircleIcon;
    default:
      return InformationCircleIcon;
  }
};
</script>
