<script setup>
import Footer from "./components/Footer.vue";
</script>

<template>
  <div class="overflow-x-hidden bg-white">
    <main class="flex-1">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<style scoped></style>
