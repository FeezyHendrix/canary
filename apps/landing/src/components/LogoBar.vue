<script setup>
const companiesRow1 = [
  "Acme Corp",
  "Globex",
  "Soylent",
  "Initech",
  "Umbrella",
  "Massive Dynamic",
  "Stark Industries",
  "Wayne Enterprises",
];

const companiesRow2 = [
  "Oscorp",
  "Cyberdyne",
  "Aperture Science",
  "Tyrell Corp",
  "Weyland-Yutani",
  "Hooli",
  "Veidt",
  "Pied Piper",
];
</script>

<template>
  <div class="overflow-hidden bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <h2
        class="text-center text-sm leading-8 font-semibold tracking-widest text-gray-500 uppercase"
      >
        Used by developers at
      </h2>

      <div class="relative mt-10 flex flex-col gap-6">
        <!-- Row 1: Left to right -->
        <div class="animate-marquee flex w-max gap-6 [--duration:40s]">
          <!-- Duplicate 3 times for seamless loop -->
          <template v-for="i in 3" :key="i">
            <div
              v-for="company in companiesRow1"
              :key="company"
              class="flex h-12 items-center justify-center rounded-full bg-gray-50 px-8 py-3 text-sm font-semibold whitespace-nowrap text-gray-400 ring-1 ring-gray-100"
            >
              {{ company }}
            </div>
          </template>
        </div>

        <!-- Row 2: Right to left (reverse marquee) -->
        <div class="animate-marquee-reverse flex w-max gap-6 [--duration:50s]">
          <!-- Duplicate 3 times for seamless loop -->
          <template v-for="i in 3" :key="i">
            <div
              v-for="company in companiesRow2"
              :key="company"
              class="flex h-12 items-center justify-center rounded-full bg-gray-50 px-8 py-3 text-sm font-semibold whitespace-nowrap text-gray-400 ring-1 ring-gray-100"
            >
              {{ company }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-marquee {
  animation: marquee var(--duration) linear infinite;
}

.animate-marquee-reverse {
  animation: marquee var(--duration) linear infinite reverse;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.333333%);
  }
}
</style>
