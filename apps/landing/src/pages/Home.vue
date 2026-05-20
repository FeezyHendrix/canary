<script setup>
import Navbar from "@/components/Navbar.vue";
import HeroSection from "@/components/HeroSection.vue";
import LogoBar from "@/components/LogoBar.vue";
import Features from "@/components/Features.vue";
import TransactionalSection from "@/components/TransactionalSection.vue";
import EmailBuilderPreview from "@/components/EmailBuilderPreview.vue";
import FaqSection from "@/components/FaqSection.vue";
import CtaSection from "@/components/CtaSection.vue";
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <Navbar />
    <HeroSection />
    <LogoBar />
    <Features />
    <TransactionalSection />
    <EmailBuilderPreview />
    <FaqSection />
    <CtaSection />
  </div>
</template>
