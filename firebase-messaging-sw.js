
// Give the service worker access to Firebase Messaging.
// Note that we can't use importmap here, so we use importScripts with CDN links.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyBwTa_Z6CbRPLOd_FdnBhnbK9aApz-kCr8",
  authDomain: "mirrorx-32bc2.firebaseapp.com",
  projectId: "mirrorx-32bc2",
  storageBucket: "mirrorx-32bc2.firebasestorage.app",
  messagingSenderId: "836098595860",
  appId: "1:836098595860:web:790b2c9520f4df7cdb5b01",
  measurementId: "G-W7278M6EY8"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Ensure you have an icon in public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
