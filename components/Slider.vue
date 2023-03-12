<template>
    <div>
        <!-- <label for="default-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Default range</label> -->
        <input id="default-range" type="range" :min="min" :max="max" :oninput="$event => onChange($event.srcElement.value)" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-fuchsia-600">
    </div>
</template>

<script>
export default {
    props: {
        onChange: {
            type: Function,
        },
        min: {
            type: Number,
            default: 50,
        },
        max: {
            type: Number,
            default: 0
        }
    },
    setup () {
        return {}
    }
}
</script>

<style lang="scss" scoped>

</style>