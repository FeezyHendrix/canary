<script setup>
import EmailBuilderPreview from "@/components/EmailBuilderPreview.vue";
import Features from "@/components/Features.vue";
import Navbar from "@/components/Navbar.vue";
import WhyCanary from "@/components/WhyCanary.vue";
</script>
<template>
  <div
    class="flex min-h-screen flex-col bg-contain bg-no-repeat pt-14.5 max-md:bg-[url('/images/gradient-bg-mobile.png')] sm:pt-13 md:bg-[url('/images/heroGradientVector.png')]"
  >
    <div class="flex justify-center">
      <Navbar />
    </div>
    <div class="mt-11 lg:mt-20">
      <EmailBuilderPreview />
    </div>
    <div class="mt-28 lg:mt-34 xl:mt-40">
      <WhyCanary />
    </div>
    <div class="mt-32 md:mt-30">
      <Features />
    </div>
  </div>
</template>
