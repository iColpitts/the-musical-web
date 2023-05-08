<template>
    <div class="w-full h-full m-auto p-16">
        <div> 
            <button v-if="!play" class="button" @click="setupPlay()">play</button> // <button v-if="!listen" class="button" @click="setupListen()">listen</button>
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
    import { ref, onValue, onDisconnect, set, remove } from "firebase/database"
    import Rnbo from "@rnbo/js";
    import patcher from '~/static/rnbo/basic-fm.export.json'    
    import randomWords from 'random-words';
import { Param } from "tone";

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
        computed: {
            userDataArray() {
                if (!this.userData) return null
                return Object.entries(this.usersData)
            }
        },
        mounted() {
            let db = useNuxtApp().$database

            onValue(ref(db, 'users/'), (snapshot) => {
                const data = snapshot.val()
                this.usersData = data
                if (this.userDataArray && this.userDataArray.length > 0) this.userDataArray.forEach(updateSynthVoices())
            });

            this.userKey = randomWords({ exactly: 3, join: '-' })
            onDisconnect(ref(db,`users/${this.userKey}`)).remove();

        },
        methods: {
            setupPlay() {
                console.log('playing...')

                this.motionListener = window.addEventListener("devicemotion", this.handleMotion);
                this.orientationListener = window.addEventListener("deviceorientation", this.handleOrientation);
                    
                this.voiceNum = this.getNumUsers() + 1
                console.log(this.voiceNum)

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
                // playback = acceleration
                // frequency = gamma (-90 \ 90)
                // grain length = beta (-180 \ 180)
                // start time = alpha (0 \ 360)
                let pbRate = this.motion.x + this.motion.y + this.motion.z
                let data = {
                    pbRate: pbRate,
                    startTime: this.orientation.alpha,
                    grainLength: this.orientation.beta,
                    frequency: this.orientation.gamma,

                    gain: 1,
                    panpos:0.5,
                    voiceNum: this.voiceNum,
                    userKey: this.userKey,

                    minFreq: -90,
                    maxFreq: 90,
                    minGL: -180,
                    maxGL: 180,
                    minPB: 0,
                    maxPB: 10,
                    minST: 0,
                    maxST: 360,
                }
                this.setDbUser(data)
            },
            updateSynthVoices(data) {
                let voice = data.voiceNum
                console.log(this.rnboDevice.parameters/forEach(param => console.log(param.name)))  

                this.rnboDevice.parametersById.get(`poly/${voice}/pb-rate`).value = data.pbRate
                this.rnboDevice.parametersById.get(`poly/${voice}/frequency`).value = data.frequency
                this.rnboDevice.parametersById.get(`poly/${voice}/grain-length`).value = data.grainLength
                this.rnboDevice.parametersById.get(`poly/${voice}/starttime`).value = data.starttime
                this.rnboDevice.parametersById.get(`gain`).value = 1

                this.rnboDevice.parametersById.get(`poly/${voice}/freq-min`).value = data.minFreq
                this.rnboDevice.parametersById.get(`poly/${voice}/freq-max`).value = data.maxFreq

                this.rnboDevice.parametersById.get(`poly/${voice}/gl-min`).value = data.minGL
                this.rnboDevice.parametersById.get(`poly/${voice}/gl-max`).value = data.maxGL

                this.rnboDevice.parametersById.get(`poly/${voice}/pb-min`).value = data.minPB
                this.rnboDevice.parametersById.get(`poly/${voice}/pb-max`).value = data.maxPB

                this.rnboDevice.parametersById.get(`poly/${voice}/st-min`).value = data.minST
                this.rnboDevice.parametersById.get(`poly/${voice}/st-min`).value = data.minST
            },  
            getNumUsers() {
                let userLength = Object.keys(this.usersData).length;
                console.log(userLength)
                return userLength
            },
            handleMotion(e) {
                this.motion.on = true
                this.motion.x = e.acceleration.x
                this.motion.y = e.acceleration.y
                this.motion.z = e.acceleration.z
                this.updateUserData()
            },
            handleOrientation(e) {
                this.orientation.on = true
                this.orientation.alpha = e.alpha
                this.orientation.beta = e.beta
                this.orientation.gamma = e.gamma
                this.updateUserData() 
            }
        },        
    }
</script>

<style lang="scss" scoped>
.button {
    @apply text-center italic hover:not-italic mt-2 underline hover:no-underline;
}
</style>