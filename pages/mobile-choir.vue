<template>
    <div class="w-full h-full m-auto p-16">
        <div> 
            <button v-if="!play" class="button" @click="setupPlay()">play</button> <span>{{ voiceNum }}</span> // <button v-if="!listen" class="button" @click="setupListen()">listen</button>
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
    import patcher from '~/static/rnbo/grains-example.export.json'    
    import randomWords from 'random-words';
    import sample from '~/static/amen.mp3';

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
                buffer: null,
            }
        },
        computed: {
            userDataArray() {
                if (!this.usersData) return null
                return Object.entries(this.usersData)
            }
        },
        mounted() {
            let db = useNuxtApp().$database

            onValue(ref(db, 'users/'), (snapshot) => {
                const data = snapshot.val()
                this.usersData = data
                console.log('updating data')
                if (this.userDataArray && this.userDataArray.length > 0) {
                    this.userDataArray.forEach(array => this.updateSynthVoices(array[1]))
                }
            })

            this.userKey = randomWords({ exactly: 3, join: '-' })
            onDisconnect(ref(db,`users/${this.userKey}`)).remove()

        },
        methods: {
            async setup() {
                console.log('setting up')

                let WAContext = window.AudioContext || window.webkitAudioContext
                this.context = new WAContext();
                let context = this.context

                this.rnboDevice = await Rnbo.createDevice({ context, patcher })

                const fileResponse = await fetch(sample);
	            const arrayBuf = await fileResponse.arrayBuffer();

                const audioBuf = await context.decodeAudioData(arrayBuf);
                this.buffer = audioBuf
                console.log(audioBuf)
                await this.rnboDevice.setDataBuffer('hymn', audioBuf);

                this.rnboDevice.node.connect(context.destination)
                context.resume()

            },
            setupPlay() {
                console.log('playing...')

                this.motionListener = window.addEventListener("devicemotion", this.handleMotion);
                this.orientationListener = window.addEventListener("deviceorientation", this.handleOrientation);
                console.log(this.rnboDevice.parametersById)

                this.setVoiceNum()
                console.log(this.voiceNum)
                this.updateUserData()

                this.listen = false
                this.play = true
                
                if (!this.rnboDevice) this.setup()
                
            },
            setupListen(){
                console.log('listening...')

                removeEventListener("devicemotion", this.motionListener)
                removeEventListener("deviceorientation", this.orientationListener)
                
                let db = useNuxtApp().$database
                remove(ref(db, `users/${this.userKey}`))

                this.play= false
                this.listen = true

                if (!this.rnboDevice) this.setup()
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
                if(this.voiceNum == 0) return
                
                let pbRate = this.motion.x + this.motion.y + this.motion.z
                let data = {
                    pbRate: 1,
                    startTime: 100,
                    grainLength: 100,
                    frequency: 550,

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
                if (!this.rnboDevice || !data) return
                let voice = data.voiceNum
                console.log('setting voice')

                console.log(this.rnboDevice.parametersById)

                let targetVoice = this.rnboDevice.parametersById.get('voice-number')
                targetVoice.value = voice
                let gain = this.rnboDevice.parametersById.get('gain')
                gain.value = 1

                let pbParam = this.rnboDevice.parametersById.get(`p_obj-8/pb-rate`)
                pbParam.value = data.pbRate
                let freqParam = this.rnboDevice.parametersById.get(`p_obj-8/frequency`)
                freqParam.value = data.frequency
                let glParam = this.rnboDevice.parametersById.get(`p_obj-8/grain-length`)
                glParam.value = data.grainLength
                let stParam = this.rnboDevice.parametersById.get(`p_obj-8/starttime`)
                stParam.value = data.starttime

                let freqMin = this.rnboDevice.parametersById.get(`p_obj-8/freq-min`)
                freqMin.value = data.minFreq
                let freqMax= this.rnboDevice.parametersById.get(`p_obj-8/freq-max`)
                freqMax.value = data.maxFreq

                let glMin = this.rnboDevice.parametersById.get(`p_obj-8/gl-min`)
                glMin.value = data.minGL
                let glMax = this.rnboDevice.parametersById.get(`p_obj-8/gl-max`)
                glMax.value = data.maxGL

                let pbMin = this.rnboDevice.parametersById.get(`p_obj-8/pb-min`)
                pbMin.value = data.minPB
                
                let pbMax = this.rnboDevice.parametersById.get(`p_obj-8/pb-max`)
                pbMax.value = data.maxPB

                let stMin = this.rnboDevice.parametersById.get(`p_obj-8/st-min`)
                stMin.value = data.minST
                let stMax = this.rnboDevice.parametersById.get(`p_obj-8/st-min`)
                stMax.value = data.minST
                let buffer = this.rnboDevice.parametersById.get(`buffer`)
                buffer.value = 'hymn'

            }, 
            setVoiceNum() {
                let activeVoices = []
                if (!this.userDataArray || this.userDataArray.length == 0) {
                    this.voiceNum = 1
                    return
                }
                this.userDataArray.forEach(el => {
                    if (el[1]) activeVoices.push(el[1].voiceNum)
                })
                if (activeVoices.length > 4) return 0
                const missing = []

                for(let i=1; i<= 5; i++) {
                    if(!activeVoices.includes(i)) { // Checking whether i(current value) present in num(argument)
                        missing.push(i); // Adding numbers which are not in num(argument) array
                    }
                }
                console.log(missing[0])
                this.voiceNum = missing[0]
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