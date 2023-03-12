<template>
    <div class="flex flex-col h-screen items-center justify-center">
        <div v-if="!started"> 
            <p class="text-fuchsia-600">Multi-user created drone nonsense.</p>
            <p class="text-xs">Built w/ Nuxt3, Tone.js and my own personal BS.</p>
            <button @click="start()" class="py-4 text-center hover:italic hover:underline">Start</button>
        </div>

        <Slider v-if="started" class="w-3/4" :onChange="sliderChange" max="300"/>
        <button v-if="started" @click="stop()" class="text-center italic hover:not-italic mt-2 underline hover:no-underline">Stop</button>
    </div>
</template>

<script>
import slider from '.../components/Slider.vue'
import * as Tone from 'tone'
    export default {
        components: { slider },
        data() {
            return {
                started: false,
                synth: null,
                osc: null
            }
        },
        mounted () {
            
        },
        methods: {
            start() {
                //create a synth and connect it to the main output (your speakers)
                this.osc = new Tone.FMOscillator({
                    frequency: 300,
                    type: "square",
                    modulationType: "triangle",
                    harmonicity: 0.5,
                    modulationIndex: 3
                }).toDestination().start();

                this.started = true;
            },
            stop() {
                this.osc.stop();
                this.started = false; 
            },
            sliderChange(event) {
                console.log(event)
                this.osc.frequency.rampTo(event, 3)
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>