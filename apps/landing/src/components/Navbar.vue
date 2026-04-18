<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Left: Links -->
        <nav class="hidden items-center gap-6 md:flex">
          <router-link
            to="/pricing"
            class="text-sm font-medium text-gray-600 transition-colors hover:text-[#0A0A0A]"
            >Pricing</router-link
          >
          <a
            href="https://feezyhendrix.github.io/canary/?no-cache=1"
            target="_blank"
            class="text-sm font-medium text-gray-600 transition-colors hover:text-[#0A0A0A]"
            >Docs</a
          >
          <a
            href="https://github.com/FeezyHendrix/canary"
            target="_blank"
            class="text-gray-400 transition-colors hover:text-[#0A0A0A]"
          >
            <span class="sr-only">GitHub</span>
            <svg
              class="size-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </nav>

        <!-- Center: Logo -->
        <div class="flex flex-1 justify-center md:flex-none">
          <router-link to="/" class="flex items-center gap-2">
            <img src="/images/logo.png" alt="Canary logo" class="h-6 w-auto" />
          </router-link>
        </div>

        <!-- Right: CTAs -->
        <div class="hidden items-center gap-4 md:flex">
          <a
            href="https://app.canary.email/login"
            class="text-sm font-medium text-gray-600 transition-colors hover:text-[#0A0A0A]"
            >Login</a
          >
          <a
            href="https://app.canary.email/register"
            class="rounded-lg bg-[#7B00D8] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6A00B8] focus:ring-2 focus:ring-[#7B00D8] focus:ring-offset-2 focus:outline-none"
            >Get Started</a
          >
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button
            @click="toggleMenu"
            type="button"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              v-if="!isMenuOpen"
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <svg
              v-else
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-show="isMenuOpen"
      class="border-t border-gray-100 bg-white md:hidden"
    >
      <div class="space-y-1 px-4 pt-2 pb-3">
        <router-link
          to="/pricing"
          class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >Pricing</router-link
        >
        <a
          href="https://feezyhendrix.github.io/canary/?no-cache=1"
          target="_blank"
          class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >Docs</a
        >
        <a
          href="https://github.com/FeezyHendrix/canary"
          target="_blank"
          class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >GitHub</a
        >
      </div>
      <div class="border-t border-gray-100 pt-4 pb-4">
        <div class="flex flex-col gap-2 px-4">
          <a
            href="https://app.canary.email/login"
            class="block rounded-md px-3 py-2 text-center text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >Login</a
          >
          <a
            href="https://app.canary.email/register"
            class="block w-full rounded-lg bg-[#7B00D8] px-4 py-2 text-center text-base font-medium text-white shadow-sm hover:bg-[#6A00B8]"
            >Get Started</a
          >
        </div>
      </div>
    </div>
  </header>
</template>
