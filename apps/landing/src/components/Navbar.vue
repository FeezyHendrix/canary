<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>
<template>
  <div class="relative max-md:mx-4 max-md:w-full">
    <!-- DARK OVERLAY (MOBILE ONLY) -->
    <div
      v-show="isMenuOpen"
      @click="toggleMenu"
      class="fixed inset-0 z-40 bg-black/65 transition-opacity md:hidden"
    ></div>

    <div
      class="relative z-50 flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_2px_7px_0_rgba(213,213,213,0.25)] md:gap-20"
    >
      <div class="hidden gap-4 p-2 text-base font-medium md:flex">
        <a
          href="https://feezyhendrix.github.io/canary/?no-cache=1"
          target="_blank"
          class="cursor-pointer"
          ><h1>Docs</h1></a
        >
        <router-link to="/pricing" class="cursor-pointer"
          ><h1>Pricing</h1></router-link
        >
      </div>

      <!-- CANARY LOGO -->
      <router-link to="/" class="h-7 w-29">
        <img src="/images/logo.png" alt="Canary logo" class="h-full w-full" />
      </router-link>

      <!-- BUTTONS -->
      <div class="hidden gap-2 md:flex">
        <button
          class="cursor-pointer rounded-lg bg-[#7B00D8] px-3 py-2 text-sm font-semibold text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#9310F6]"
        >
          Get Started
        </button>

        <a href="https://github.com/FeezyHendrix/canary" target="_blank">
          <button
            class="flex cursor-pointer items-center gap-1 rounded-lg border border-[#EBE6E6] bg-[#FFFFFF] px-3 py-2 font-semibold hover:border-[#DED9D9] hover:bg-[#FAFAFA]"
          >
            <span><img src="/icons/github.png" alt="GitHub" class="size-5" /></span>
            View On Github
          </button></a
        >
      </div>

      <!-- HAMBURGER MENU FOR MOBILE -->
      <div class="md:hidden">
        <img
          v-show="!isMenuOpen"
          src="/icons/hamburger-menu.png"
          alt="hamburger menu icon"
          class="size-8 cursor-pointer"
          @click="toggleMenu()"
        />
        <img
          v-show="isMenuOpen"
          src="/icons/close-menu.png"
          alt="close menu icon"
          class="size-8 cursor-pointer"
          @click="toggleMenu()"
        />
      </div>
    </div>

    <!-- MOBILE MENU LIST -->
    <div
      v-show="isMenuOpen"
      class="absolute top-18 z-50 w-full rounded-[20px] bg-white pb-4 shadow-[0_2px_7px_0_rgba(213,213,213,0.25)] md:hidden"
    >
      <div class="flex flex-col gap-1 text-base font-semibold">
        <a href="" target="_blank">
          <div
            class="cursor-pointer rounded-t-[20px] px-2 py-1 hover:bg-[#7B00D8] hover:text-white"
          >
            Docs
          </div></a
        >

        <router-link to="/pricing">
          <div
            class="cursor-pointer px-2 py-1 hover:bg-[#7B00D8] hover:text-white"
          >
            Pricing
          </div></router-link
        >

        <div class="flex gap-2 px-2">
          <button
            class="shadow-[inset_0_2px_4px_rgba(0,0,0,0.3) cursor-pointer rounded-lg bg-[#7B00D8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#9310F6]"
          >
            Get Started
          </button>

          <button
            class="flex cursor-pointer items-center gap-1 rounded-lg border border-[#EBE6E6] px-4 py-3 text-sm font-semibold hover:border-[#DED9D9] hover:bg-[#FAFAFA]"
          >
            <span><img src="/icons/github.png" alt="GitHub" class="size-5" /></span>
            View On Github
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
