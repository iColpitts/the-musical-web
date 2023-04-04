<template>
    <div class="flex flex-col h-screen items-center justify-center">
        <div v-if="!started"> 
            <p class="text-fuchsia-600">RNBO Time Keeper</p>
            <p class="text-xs">Built w/ Nuxt3, RNBO and p5.js solely to track mouse movements.</p>
            <button @click="start()" class="py-4 text-center hover:italic hover:underline">Start</button>
        </div>
        <div v-if="started">
            <!-- <p>{{  freqInterval }} || {{ timeInterval }} </p>
            <p>{{ frequency.value }} || {{ harmonicity.value }} || {{ modulation.value }}</p> -->
            <button v-if="started" @click="stop()" class="text-center italic hover:not-italic mt-2 underline hover:no-underline">Stop</button>
        </div>
    </div>
</template>

<script>
import Rnbo from "@rnbo/js";
import patcher from '~/static/rnbo/basic-fm.export.json'

export default {
    data() {
        return {
            started: false,
            rnboDevice: null,
            context: null,
            frequency: null,
            harmonicity: null,
            modulation: null,
            gain: null,
            mouseX: null,
            mouseY: null,
            freqInterval: 1,
            timeInterval: 100,
            freqMax: 440,
            freqMin: 40,
            freqPlus: true,
        }
    },
    async mounted () {
        console.log("mounted")
        if (process.client) {
            const { default: P5 } = await import('p5')
            
            const sketch = (s) => {
                s.setup = () => {
                    s.createCanvas(500, 500)
                }
                s.mouseMoved = (val) => {
                    this.freqInterval = val.clientY/4
                    this.timeInterval = val.clientX
                }
            }
            // eslint-disable-next-line no-unused-vars
            const canvas = new P5(sketch, 'p5Canvas')
        }
        
    },
    computed: {
        frequencyComp() {
            if(!this.rnboDevice) return {}
            return this.rnboDevice.parametersById.get("carrier-frequency");
        },
        harmonicityratioComp() {
            if(!this.rnboDevice) return {}
            return this.rnboDevice.parametersById.get("harmonicity-ratio");
        },
        modulcationratioComp() {
            if(!this.rnboDevice) return {}
            return this.rnboDevice.parametersById.get("modulation-index");
        }
    },
    methods: {
        async setup() {
            console.log('setting up')

            let WAContext = window.AudioContext || window.webkitAudioContext;
            this.context = new WAContext();
            let context = this.context

            this.rnboDevice = await Rnbo.createDevice({ context, patcher });

            // This connects the device to audio output, but you may still need to call context.resume()
            // from a user-initiated function.
            this.rnboDevice.node.connect(context.destination);

            setInterval(this.updateFrequency, this.timeInterval)
 
            context.resume()
        },
        updateFrequency() {
            if (this.frequency.value >= this.freqMax) this.freqPlus = false
            if (this.frequency.value <= this.freqMin) this.freqPlus = true

            if (this.freqPlus) {
                this.frequency.value += this.freqInterval
            }
            if (!this.freqPlus) {
                this.frequency.value += this.freqInterval * -1
            }
        },
        async start() {
            console.log('starting')
            await this.setup()
            console.log(this.rnboDevice.outPorts)
            this.rnboDevice.parameters.forEach(parameter => {
                console.log(parameter.id);
                console.log(parameter.value);
            });
            this.frequency = this.rnboDevice.parametersById.get("carrier-frequency");
            this.harmonicity = this.rnboDevice.parametersById.get("harmonicity-ratio")
            this.modulation = this.rnboDevice.parametersById.get("modulation-index")
            this.gain = this.rnboDevice.parametersById.get("gain")

            this.gain.value = 0.2

            this.context.resume()

            this.started = true
        },
        stop() {
            console.log('stopping')
            this.gain.value = -1
            this.started = false
        },
    },
}
</script>

<style lang="scss" scoped>

</style>