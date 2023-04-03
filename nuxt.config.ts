// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],
    modules: [
        'nuxt-socket-io'
    ],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    io: {
        sockets: [{
            name: 'week1',
            url: 'http://localhost:8888/',
            default: true,
            iox: [
                'event --> event',
                'bidirectional'
            ]
        }],
        server: {
            /* CORS options */ 
            cors: { 
              credentials: true,
              origin: [
                // whitelisted origins 
                'https://the-musical-web.vercel.app/'
              ]
            }
          }
    }
})
