import User from '../models/User';
import Notification from '../models/Notification';
import { sendPushNotification } from './pushService';

interface NotificationPayload {
  title: string;
  message: string;
  location?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  time: string;
  incidentId?: any;
}

interface Target {
  userId?: string;
  role?: string;
}

export const createTargetedNotification = async (payload: NotificationPayload, target: Target) => {
  let recipients: any[] = [];

  if (target.userId) {
    const user = await User.findById(target.userId);
    if (user) {
      recipients.push(user);
    }
  } else if (target.role) {
    recipients = await User.find({ role: target.role as any });
  }

  const notifications = recipients.map(user => ({
    ...payload,
    recipient: user._id
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  // Trigger push notifications
  await sendPushNotification(
    { title: payload.title, body: payload.message },
    target
  );
};
