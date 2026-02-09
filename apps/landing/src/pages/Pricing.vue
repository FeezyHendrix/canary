<script setup>
import Navbar from "@/components/Navbar.vue";

const pricingPlans = [
  {
    id: 1,
    name: "FREE PLAN",
    price: "Free",
    period: "",
    features: [
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
    ],
  },
  {
    id: 2,
    name: "STARTER PLAN",
    price: "$10",
    period: "per month",
    features: [
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
    ],
  },
  {
    id: 3,
    name: "PRO PLAN",
    price: "$20",
    period: "per month",
    features: [
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
      "Plan feature",
    ],
  },
];
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-contain bg-no-repeat pt-14.5 max-md:bg-[url('/images/pricing-gradient-mobile.png')] sm:pt-13 md:bg-[url('/images/pricing-gradient.png')]"
  >
    <div class="flex justify-center">
      <Navbar />
    </div>
    <div class="mt-8.75 text-center md:mt-17">
      <h3 class="text-sm font-bold tracking-widest">PRICING</h3>
      <h1
        class="mt-2 text-[32px] leading-8 font-medium md:text-5xl md:leading-12"
      >
        Simple pricing <br />
        Full control
      </h1>
    </div>
    <div
      class="mt-10.75 flex gap-6 max-md:flex-col max-md:items-center md:mx-4 md:mt-30.75 md:justify-center lg:gap-10 xl:mx-0"
    >
      <div
        v-for="plan in pricingPlans"
        :key="plan.id"
        class="h-118.5 w-full max-w-96 rounded-3xl border border-[#EDEDED] bg-[url('/images/plan-gradient.png')] bg-contain bg-no-repeat md:max-w-none md:flex-1 lg:max-w-100"
      >
        <div class="mx-4 my-8">
          <h3 class="text-sm font-bold tracking-widest">{{ plan.name }}</h3>
          <p class="font-neue mt-2 text-[40px] font-medium">
            {{ plan.price }}
            <span class="font-inter text-base font-medium">{{
              plan.period
            }}</span>
          </p>
          <button
            class="mt-6 cursor-pointer rounded-lg bg-[#7B00D8] px-3 py-2 text-sm font-semibold text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#9310F6] md:mt-8"
          >
            Get Started
          </button>
          <ul class="gap mt-10 flex flex-col gap-2">
            <li
              v-for="(feature, index) in plan.features"
              :key="index"
              class="font-inter flex gap-2 text-base font-medium"
            >
              <div class="shrink-0">
                <img src="/images/logo-2.png" alt="" role="presentation" class="h-4.5 w-4" />
              </div>

              <h3 class="font-bold">
                {{ feature }}
              </h3>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
