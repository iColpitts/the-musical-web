<template>
    <div class="w-full h-full m-auto p-16">
        <div> 
            <button v-if="!play" class="button" @click="setupPlay()">play</button><span v-if="this.userKey">{{ this.userKey }}</span> // <button v-if="!listen" class="button" @click="setupListen()">listen</button>
        </div>
        
        <div class="py-4"> 
            <p>Mobile Choir</p>
            <p class="py-10" v-if="usersData">{{  usersData }}</p>
            <p class="py-10" v-if="motion">{{ motion }}</p>
            <p class="py-10" v-if="orientation">{{ orientation }}</p>
        </div>
    </div>
</template>

<script>
    import { ref, onValue, onDisconnect, set } from "firebase/database"
    import Rnbo from "@rnbo/js";
    import patcher from '~/static/rnbo/basic-fm.export.json'    
    import randomWords from 'random-words';

    export default {
        data() {
            return {
                rnboDevice: null,
                listen: false,
                play: false,
                context: null,
                usersData: null,
                voiceNum: 0,
                userKey: null,
                motion: { on: false },
                orientation: { on: false },
                motionListener: null,
                orientationListener: null,
            }
        },
        mounted() {
            let db = useNuxtApp().$database

            onValue(ref(db, 'users/'), (snapshot) => {
                const data = snapshot.val();
                console.log(data)
                this.usersData = data
            });

            // const presenceRef = ref(db, "disconnectmessage");
            // // Write a string when this client loses connection
            // onDisconnect(presenceRef).set(ref(db, 'user/'),  );

        },
        methods: {
            setupPlay() {
                console.log('playing...')

                this.motionListener = window.addEventListener("devicemotion", this.handleMotion);
                this.orientationListener = window.addEventListener("deviceorientation", this.handleOrientation);
                    
                this.userKey = randomWords({ exactly: 3, join: '-' })

                this.listen = false
                this.play = true
                if(!this.rnboDevice) this.setup()
            },
            setupListen(){
                console.log('listening...')

                removeEventListener("devicemotion", this.motionListener)
                removeEventListener("deviceorientation", this.orientationListener)

                this.play= false
                this.userKey = null
                this.listen = true

                if(!this.rnboDevice) this.setup()
            },
            async setup() {
                console.log('setting up')

                let WAContext = window.AudioContext || window.webkitAudioContext;
                this.context = new WAContext();
                let context = this.context

                this.rnboDevice = await Rnbo.createDevice({ context, patcher });

                this.rnboDevice.node.connect(context.destination);
    
                context.resume()
            },
            setDbUser(newData) {
                let db = useNuxtApp().$database
                console.log('setting DB granulator')
                set(ref(db, `users/${this.userKey}`), newData);
            },
            updateUserData() {

                let data = {
                    frequency:1500,
                    gain:0,
                    grainLength:150,
                    live:0,
                    maxFreq:2000,
                    maxGL:500,
                    maxPB:500,
                    maxST:500,
                    panpos:0.5,
                    pbRate:560,
                    startTime:0,
                }
            },
            handleMotion(e) {
                this.motion.on = true
                this.motion.x = e.acceleration.x
                this.motion.y = e.acceleration.y
                this.motion.z = e.acceleration.z
                updateUserData()
            },
            handleOrientation(e) {
                this.orientation.on = true
                this.orientation.alpha = e.alpha
                this.orientation.beta = e.beta
                this.orientation.gamma = e.gamma 
            },
            gyro_event (e) {
                if (this.sensorData.time.length < 6000) {
                    this.sensorData.time.push(this.gyroscope.time)
                    this.sensorData.x.push(this.gyroscope.x)
                    this.sensorData.y.push(this.gyroscope.y)
                    this.sensorData.z.push(this.gyroscope.z)
                }
            }
        },        
    }
</script>

<style lang="scss" scoped>
.button {
    @apply text-center italic hover:not-italic mt-2 underline hover:no-underline;
}
</style>