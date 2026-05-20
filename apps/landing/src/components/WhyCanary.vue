<script setup>
const WhyCanary = [
  {
    id: 1,
    icon: "/icons/lock.png",
    h1: "Total Infrastructure Independence",
    p: "Route emails through any provider, manage all your delivery settings in one place, and switch services instantly",
  },
  {
    id: 2,
    icon: "/icons/repair.png",
    h1: "Built for the Modern Dev Stack",
    p: "Deploy with Docker, connect your own S3 storage, and manage your entire workflow through a robust, documented API",
  },
  {
    id: 3,
    icon: "/icons/paint.png",
    h1: "Design Freedom Without Technical Debt",
    p: "Build complex, responsive layouts with a visual editor that generates clean code and renders perfectly in every inbox",
  },
];
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- WHY CANARY TEXT -->
    <div class="text-center">
      <h3 class="text-sm font-bold tracking-widest">WHY CANARY?</h3>
      <h1
        class="font-neue mt-2 text-[32px] leading-8 font-medium md:text-5xl md:leading-12"
      >
        Bridge the gap between <br /><span
          class="font-tiempos text-[#7B00D8] italic"
          >design and delivery</span
        >
      </h1>
    </div>
    <!--WHY CANARY CARDS -->
    <div
      class="mt-10.5 flex flex-col gap-6 overflow-hidden max-sm:w-full md:flex-row md:justify-center md:gap-1 xl:gap-10"
    >
      <div
        v-for="item in WhyCanary"
        :key="item.id"
        class="group mx-6 h-78 cursor-pointer rounded-2xl bg-[#FFF3C6] px-6 transition-all duration-300 hover:scale-x-105 hover:bg-[#CF8300] hover:text-white md:mx-3 md:h-97 md:px-3 lg:mx-8 lg:px-6 hover:lg:mx-8 lg:hover:scale-x-120 xl:w-77"
      >
        <div
          class="mt-10 flex flex-col transition-transform md:mt-24 md:group-hover:scale-95"
        >
          <img :src="item.icon" :alt="item.h1" class="size-14" />
          <h1 class="mt-4 text-xl font-medium xl:text-2xl">{{ item.h1 }}</h1>
          <p class="mt-4 text-justify text-sm font-medium xl:text-base">
            {{ item.p }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
