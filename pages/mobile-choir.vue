<template>
    <div class="w-full h-full m-auto p-16">
        <p>Mobile Choir</p>
        <p class="py-10" v-if="granulatorData">{{ granulatorData }}</p>
        <p class="py-10" v-if="userData">{{  userData }}</p>
        <p class="py-10" v-if="motion">{{ motion }}</p>
        <p class="py-10" v-if="orientation">{{ orientation }}</p>
        <button @click="granularSet">Granulator Set Button</button>
    </div>
</template>

<script>
    import { ref, onValue, onDisconnect, set } from "firebase/database";

    export default {
        data() {
            return {
                granulatorData: null,
                userData: null,
                granulatorControls: null,
                userNum: null,
                motion: { on: false },
                orientation: { on: false },
            }
        },
        mounted () {
            let db = useNuxtApp().$database
            let dbRef = ref(db)

            // if (
            //     DeviceMotionEvent &&
            //     typeof DeviceMotionEvent.requestPermission === "function"
            // ) {
            //     DeviceMotionEvent.requestPermission();
            // }

            window.addEventListener("devicemotion", this.handleMotion);
            window.addEventListener("deviceorientation", this.handleOrientation);

            onValue(ref(db, 'granulator/'), (snapshot) => {
                const data = snapshot.val();
                console.log(data)
                this.granulatorData = data
            });
            onValue(ref(db, 'users/'), (snapshot) => {
                const data = snapshot.val();
                console.log(data)
                this.userData = data
            });

            // const presenceRef = ref(db, "disconnectmessage");
            // // Write a string when this client loses connection
            // onDisconnect(presenceRef).set(ref(db, 'user/'),  );

        },
        methods: {
            setDbGranulator(newData) {
                let db = useNuxtApp().$database
                console.log('setting DB granulator')
                set(ref(db, 'granulator/'), newData);
            },
            setDbUser(newData) {
                let db = useNuxtApp().$database
                console.log('setting DB granulator')
                set(ref(db, 'users/'), newData);
            },
            granularSet() {
                console.log('ganulator Setting')
                let newGranulator = {
                    frequency: this.randomNum(350, 2000),
                    gain: 1,
                    grainLength: this.randomNum(0, 10),
                    panpos: 0.5,
                    pbRate: this.randomNum(100, 1000),
                    starttime: this.randomNum(0, 2000),
                }
                console.log(newGranulator)
                this.setDbGranulator(newGranulator)
            },
            randomNum(min, max){
                return Math.floor(Math.random() * (max - min + 1) + min)
            },
            redistributeControl(){
                console.log('redistributing controls')
            },
            handleMotion(e) {
                this.motion.on = true
                this.motion.x = e.acceleration.x
                this.motion.y = e.acceleration.y
                this.motion.z = e.acceleration.z
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

</style>