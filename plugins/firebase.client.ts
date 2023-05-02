import { initializeApp } from 'firebase/app'
import { getDatabase } from "firebase/database";

export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config.FIREBASE_API_KEY,
        authDomain: config.FIREBASE_AUTH_DOMAIN,
        projectId: "mobile-choir",
        storageBucket: config.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
        appId: config.FIREBASE_APP_ID,
        measurementId: config.FIREBASE_MEASUREMENT_ID,
        databaseURL: config.FIREBASE_DB_URL,
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    
    // Initialize Realtime Database and get a reference to the service
    const database = getDatabase(app);
    nuxtApp.vueApp.provide('database', database)
    nuxtApp.provide('database', database)
})