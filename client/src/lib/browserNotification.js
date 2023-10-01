
export const requestBrowserNotificationPermissions = () => {
  if (!("Notification" in window)) {
    console.log("Browser does not support desktop notification");
  } else {
    Notification.requestPermission();
  }
}

export const createBrowserNotification = (title, body) => {
  if (Notification.permission === 'denied') {
    return
  }

  new Notification(title, {
    body, icon: '/favicon.ico',
  })
}