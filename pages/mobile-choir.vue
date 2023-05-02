<template>
    <div class="w-full h-full m-auto p-16">
        <p>Mobile Choir</p>
        <p class="py-10">{{ this.granulatorData }}</p>
        <p class="py-10">{{  this.userData }}</p>
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
            }
        },
        mounted () {
            let db = useNuxtApp().$database
            let dbRef = ref(db)

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

            const presenceRef = ref(db, "disconnectmessage");
            // Write a string when this client loses connection
            onDisconnect(presenceRef).set(ref(db, 'user/'),  );

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
        },        
    }
</script>

<style lang="scss" scoped>

</style>