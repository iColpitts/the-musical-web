<template>
    <div class="flex flex-col h-screen items-center justify-center">
        <div v-if="!started"> 
            <p class="text-fuchsia-600">Multi-user created drone nonsense.</p>
            <p class="text-xs">Built w/ Nuxt3, Tone.js and my own personal BS. Socket.io functionality coming soon.</p>
            <button @click="start()" class="py-4 text-center hover:italic hover:underline">Start</button>
        </div>
        <Slider v-if="started" class="w-3/4" :value="150" :onChange="$event => sliderChange($event, this.osc)" :max="300"/>
        <Slider v-if="started" class="w-3/4" :value="100" :onChange="$event => sliderChange($event, this.oscToo)" :max="300"/>
        <button v-if="started" @click="stop()" class="text-center italic hover:not-italic mt-2 underline hover:no-underline">Stop</button>
        <div class="w-3/4">{{ socketStatus }}</div>
        <div class="w-3/4">{{ emitResp }}</div>
    </div>
</template>

<script>
import slider from '../components/Slider.vue'
import * as Tone from 'tone'

export default {
    components: { slider },
    data() {
        return {
            started: false,
            synth: null,
            osc: null,
            oscToo: null,
            socket: null,
            emitError: null,
            messageRxd: null,
            socketStatus: {},
            emitResp: null
        }
    },
    mounted () {
        this.socket = this.$nuxtSocket({
            name: 'week1',
            emitErrorsProps: 'emitError',
            path: 'sockets',
            reconnection: true
        })

        this.socket.onAny((eventName, ...args) => {
            console.log('slider event 1!')
            this.sliderEvent(eventName)
        })

        this.socket.on("connect_error", (e) => {
            console.log(e);
        });
    },
    methods: {
        start() {
            //create a synth and connect it to the main output (your speakers)
            this.osc = new Tone.FMOscillator({
                frequency: 150,
                type: "square",
                modulationType: "triangle",
                harmonicity: 0.5,
                modulationIndex: 3
            }).toDestination();

            this.oscToo = new Tone.FMOscillator({
                frequency: 100,
                type: "square",
                modulationType: "triangle",
                harmonicity: 0.5,
                modulationIndex: 3
            }).toDestination();

            this.started = true;
        },
        stop() {
            this.osc.stop();
            this.oscToo.stop();
            this.started = false; 
        },
        sliderChange(event, osc) {
            console.log(event)
            osc.frequency.rampTo(event, 6)
            this.emitEvent(event)
        },
        getEvent(val) {
            console.log('event!')
            console.log(val)
        },
        async emitEvent(val) {
            console.log(`slider event emit attempt: ${val}`)
            this.emitResp = await this.socket.emitP('event', {value: val}).then(res => console.log(res)).catch(err => console.log(err))
        }
    },
}
</script>

<style lang="scss" scoped>

</style>