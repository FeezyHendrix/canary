<script setup></script>

<template>
  <div
    class="gap-6 max-md:flex-col max-md:items-center md:mr-20 md:ml-12 md:flex md:h-120 xl:ml-20 xl:h-128"
  >
    <div class="w-4/5 max-md:ml-4 md:mt-24 md:w-55/100 xl:w-3/5">
      <h1
        class="font-geist text-2xl font-semibold md:text-3xl lg:text-4xl xl:text-6xl"
      >
        <span class="font-tiempos font-normal text-[#7B00D8] italic"
          >Drag, drop, and deploy</span
        >
        production-ready email templates in
        <span class="font-tiempos font-normal text-[#7B00D8] italic"
          >seconds</span
        >
      </h1>

      <p class="mt-3 text-xs font-medium md:text-sm xl:w-7/10 xl:text-base">
        Stop hand-coding responsive HTML. Canary is a developer-first platform
        to design pixel-perfect templates visually, automate delivery via a
        robust API, and self-host on your own infrastructure with total provider
        flexibility
      </p>

      <div class="mt-6 flex gap-2">
        <button
          class="shadow-[inset_0_2px_4px_rgba(0,0,0,0.3) cursor-pointer rounded-lg bg-[#7B00D8] px-3 py-2 text-sm font-semibold text-white hover:bg-[#9310F6]"
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
    </div>

    <div class="flex h-full flex-1 max-md:mt-10">
      <img
        src="/images/illustrationDesktop.svg"
        alt="Canary email template builder interface"
        class="hidden h-full object-contain md:block"
      />
      <img src="/images/illustrationMobile.svg" alt="Canary email template builder interface" class="md:hidden" />
    </div>
  </div>
</template>
