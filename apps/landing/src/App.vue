<script setup>
import Footer from "./components/Footer.vue";
</script>

<template>
  <div class="overflow-x-hidden bg-white">
    <main class="flex-1">
      <router-view />
    </main>

    <footer class="md:mt-30">
      <Footer />
    </footer>
  </div>
</template>

<style scoped></style>
