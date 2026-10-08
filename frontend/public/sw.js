self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'Unicare Alert';
      const options = {
        body: data.message || data.body || 'You have a new notification.',
        icon: '/favicon.svg',
        data: data.url || '/'
      };
      
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.error('Error parsing push payload', err);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
