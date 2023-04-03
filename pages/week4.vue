<template>
    <div class="flex flex-col h-screen items-center justify-center">
        <div v-if="!started"> 
            <p class="text-fuchsia-600">RNBO Time Keeper</p>
            <p class="text-xs">Built w/ Nuxt3, RNBO and a little bit of Tiger Trot horn action.</p>
            <button @click="start()" class="py-4 text-center hover:italic hover:underline">Start</button>
        </div>
        <div v-if="started">
            <p>{{ frequency.value }} || {{ harmonicity.value }} || {{ modulation.value }}</p>
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

            // const gainNode = context.createGain();
            // gainNode.connect(context.destination);
            // this.rnboDevice.node.connect(gainNode);

            context.resume()
        },
        async start() {
            console.log('starting')
            await this.setup()
            console.log(this.rnboDevice.outPorts)
            this.rnboDevice.parameters.forEach(parameter => {
                // Each parameter has an ID as well as a name. The ID will include
                // the full path to the parameter, including the names of any parent
                // patchers if the parameter is in a subpatcher. So if the path contains
                // any "/" characters, you know that it's not a top level parameter.

                // Uncomment this line to include only top level parameters.
                // if (parameter.id.includes("/")) return;

                console.log(parameter.id);
                console.log(parameter.value);
            });
            this.frequency = this.rnboDevice.parametersById.get("carrier-frequency");
            this.harmonicity = this.rnboDevice.parametersById.get("harmonicity-ratio")
            this.modulation = this.rnboDevice.parametersById.get("modulation-index")
            this.gain = this.rnboDevice.parametersById.get("gain")

            this.gain.value = 1

            this.context.resume()

            this.started = true
        },
        stop() {
            console.log('stopping')
            this.gain.value = 0
            this.started = false
        }
    },
}
</script>

<style lang="scss" scoped>

</style>