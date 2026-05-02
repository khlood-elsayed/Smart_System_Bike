// ============================================

/**
 * Request browser notification permission
 * Can be extended to integrate with Firebase Cloud Messaging later
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send OTP notification (simulated or real)
 * @param {string} method - 'sms' or 'whatsapp'
 * @param {string} code - OTP code (e.g., '1234')
 * @param {string} phone - User's phone number
 * 
 * Future extension for Firebase:
 * - SMS: Use Firebase Cloud Functions + Twilio
 * - WhatsApp: Use Firebase + WhatsApp Business API
 */
export async function sendOtpNotification(method, code, phone) {
  const hasPermission = await requestNotificationPermission();

  if (hasPermission && 'Notification' in window) {
    new Notification('SmartBike', {
      body: `Your verification code is ${code}`,
      icon: '/images/logo-icon.png', // Optional: add a logo
      tag: 'otp-verification',
      requireInteraction: false,
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23CCFF00"/></svg>'
    });

    // Log for demonstration purposes
    console.log(`OTP via ${method.toUpperCase()}: Notification sent to ${phone}`);
    console.log(`Code: ${code}`);
  } else {
    console.warn('Notification permission not granted');
  }

  // TODO: Firebase Integration
  // if (method === 'sms') {
  //   await firebase.functions().httpsCallable('sendSMS')({
  //     phone: phone,
  //     code: code
  //   });
  // } else if (method === 'whatsapp') {
  //   await firebase.functions().httpsCallable('sendWhatsAppOTP')({
  //     phone: phone,
  //     code: code
  //   });
  // }
}

