<script setup lang="ts">
import { ref } from 'vue';
const appDesc = ref(import.meta.env.VITE_APP_DESC || '')
const gitUrl = ref(import.meta.env.VITE_GIT_URL || '')
</script>

<template>
    <div class="w-full rounded-2xl z-10 p-5 text-center">
        <div class="copyright text-sm text-gray-600 leading-relaxed">
            <div class="mb-2">
                {{ appDesc }} © 2019 - 2025 
            </div>
            <div class="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs">
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>