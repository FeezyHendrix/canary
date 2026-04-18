<script setup lang="ts">
// Email Builder section showing the drag and drop interface
</script>

<template>
  <section class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2
          class="text-sm font-semibold tracking-wider text-[#7B00D8] uppercase"
        >
          Email Builder
        </h2>
        <p
          class="mt-2 text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl"
        >
          Drag. Drop. Send.
        </p>
        <p class="mt-6 text-lg leading-8 text-[#6B7280]">
          No-code drag-and-drop editor for visual emails.<br
            class="hidden sm:block"
          />
          Switch to HTML anytime for full control.
        </p>
      </div>

      <div class="mt-16 sm:mt-24">
        <div
          class="overflow-hidden rounded-2xl bg-gray-50/50 p-2 shadow-xl ring-1 ring-gray-200 sm:p-4"
        >
          <!-- Main builder image -->
          <img
            src="/images/illustrationDesktop.svg"
            alt="Canary visual drag and drop email builder interface"
            class="hidden w-full rounded-xl border border-gray-200 shadow-sm md:block"
          />
          <img
            src="/images/illustrationMobile.svg"
            alt="Canary visual drag and drop email builder interface mobile"
            class="w-full rounded-xl border border-gray-200 shadow-sm md:hidden"
          />
        </div>
      </div>
    </div>
  </section>
</template>
