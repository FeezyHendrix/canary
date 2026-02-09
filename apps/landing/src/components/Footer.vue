<template>
  <div class="bg-[#7B00D8] pb-6 text-center">
    <div class="flex items-center justify-between max-md:flex-col max-md:pt-14">
      <div class="mt-8 ml-9 hidden shrink-0 lg:block">
        <img src="/images/footer-img.png" alt="" role="presentation" class="h-72.5 w-104.5" />
      </div>

      <div class="mt-16 flex flex-1 justify-center">
        <div
          class="flex w-7/10 flex-col items-center text-center"
        >
          <img src="/images/logo-white.png" alt="Canary logo" class="h-12.5 w-52" />
          <p class="mt-6 text-base font-medium text-white">
            Empowering developers to own their email infrastructure with
            professional-grade design tools
          </p>
          <div class="mt-6 mb-15 flex gap-2 md:mb-0">
            <button
              class="shadow-[inset_0_-4px_4px_rgba(0,0,0,0.3)] cursor-pointer rounded-lg border-[#EBE6E6] bg-[#FFFFFF] px-3 py-2 text-sm font-semibold text-black hover:border-[#DED9D9] hover:bg-[#FAFAFA]"
            >
              Get Started
            </button>

            <a href="https://github.com/FeezyHendrix/canary" target="_blank"
              ><button
                class="flex cursor-pointer items-center gap-1 rounded-lg border border-[#EBE6E699] bg-[#7B00D8] px-3 py-2 font-semibold text-white hover:bg-[#9310F6]"
              >
                <span
                  ><img src="/icons/github-white.png" alt="GitHub" class="size-5"
                /></span>
                View On Github
              </button></a
            >
          </div>
        </div>
      </div>

      <div class="mt-8 mr-0 hidden shrink-0 lg:block">
        <img src="/images/footer-img.png" alt="" role="presentation" class="h-72.5 w-104.5" />
      </div>
    </div>
    <p class="mt-4 text-sm text-white">
      &#169; {{ year }} Canary | Built with 💛 for the developer community
    </p>
  </div>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style lang="scss" scoped></style>
