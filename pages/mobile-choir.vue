<template>
    <div>
        <ChoirVoice  
            :frequency="orientation.alpha"
            :playback="orientation.beta"
            :grainsize="orientation.gamma"
            :overlap="motion.x"/>
    </div>
</template>

<script>
import ChoirVoice from '../components/Choir-Voice.vue'
export default {
    components: {
        ChoirVoice,
    },
    setup () {
        return {}
    },
    mounted () {
        this.startPlay();
    },
    data() {
        return {
            motion: { on: false },
            orientation: { on: false },
            motionListener: null,
            orientationListener: null,
            play: false,
        }
    },
    methods: {
        startPlay() {
            console.log('playing...')

            this.motionListener = window.addEventListener("devicemotion", this.handleMotion);
            this.orientationListener = window.addEventListener("deviceorientation", this.handleOrientation);
            
            this.play = true
        }, 
        endPlay() {
            console.log('listening...')

            removeEventListener("devicemotion", this.motionListener)
            removeEventListener("deviceorientation", this.orientationListener)

            this.play= false
        },
        handleMotion(e) {
            this.motion.on = true
            this.motion.x = e.acceleration.x
            this.motion.y = e.acceleration.y
            this.motion.z = e.acceleration.z
            // this.updateUserData()
        },
        handleOrientation(e) {
            this.orientation.on = true
            this.orientation.alpha = e.alpha
            this.orientation.beta = e.beta
            this.orientation.gamma = e.gamma
            // this.updateUserData() 
        }, 
    },
}
</script>

<style lang="scss" scoped>

</style>