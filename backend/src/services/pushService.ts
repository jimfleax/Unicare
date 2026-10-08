import webpush from 'web-push';
import Subscription from '../models/Subscription';

// In a real app, these would come from env vars
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BE7yQwCHAeFtI_tCGFQa7-DPn_nrOnMYTVMMYDiQAXpSFUlF74AigCYvpV-WKg78QWCYXi8w07ly_3QLNJMXjU0',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'VABwzc1PeVnGvLQNITCzHvxM-z8goa88MBP5a1s2ZJk'
};

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const sendPushNotification = async (payload: object, target: { userId?: string; role?: string }) => {
  try {
    const subscriptions = await Subscription.find().populate('userId');
    
    interface PopulatedSubscription {
      _id: unknown;
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userId?: {
        _id: { toString: () => string };
        role?: string;
      };
    }

    const targetSubs = subscriptions.filter((s) => {
      const sub = s as unknown as PopulatedSubscription;
      if (!sub.userId) return false;
      if (target.userId && sub.userId._id.toString() !== target.userId) return false;
      if (target.role && sub.userId.role !== target.role) return false;
      return true;
    }) as unknown as PopulatedSubscription[];

    const notificationPayload = JSON.stringify(payload);
    
    const pushPromises = targetSubs.map(sub => 
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: sub.keys
      }, notificationPayload).catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log('Subscription has expired or is no longer valid: ', err);
          return Subscription.findByIdAndDelete(sub._id);
        }
      })
    );
    
    await Promise.all(pushPromises);
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
};
