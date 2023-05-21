<template>
    <div>
        <p>Freq: {{ frequency }}</p>
        <p>Playback: {{ playback }}</p>
        <p>Grain Size: {{ grainsize }}</p>
        <p>Overlap: {{  overlap }}</p>
        <p>Volume: {{ volume }}</p>
    </div>
</template>

<script>
import * as Tone from 'tone'

export default {
    data() {
        return {
            granulator: null,
            filter: null,
            sample: './assets/Amen-break.wav'
        }
    },
    props: {
        frequency: Number,
        playback: Number,
        grainsize: Number,
        overlap: Number,
        volume: Number
    },
    computed: {
        backgroundCSS() {
            return this.data 
        }
    },
    watch: {
        frequency(newValue, oldValue) {
            this.granulator.set({detune: newValue})
        },
        playback(newValue, oldValue) {
            this.granulator.set({playback: newValue})
        },
        grainsize(newValue, oldValue) {
            this.granulator.set({grainsize: newValue})
        },
        overlap(newValue, oldValue) {
            this.granulator.set({overlap: newValue})
        },
        volume(newValue, oldValue) {
            this.granulator.set({volume: newValue})
        }
    },
    mounted () {
        this.startGrainPlayer()
    },
    methods: {
        startGrainPlayer() {
            // this.filter = new Tone.Filter().toDestination();

            this.granulator = new Tone.GrainPlayer({
                url: '/hymn.mp3',
                loop: true,
                grainSize: 0.01,
                overlap: 4,
                playbackRate: 0.6,
                detune: 0,
                volume: 0.4,
                loopStart: 0,
            }).toDestination()

            this.granulator.start()
        },
        scale (number, inMin, inMax, outMin, outMax) {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        },
    },
}
</script>

<style lang="scss" scoped>

</style>