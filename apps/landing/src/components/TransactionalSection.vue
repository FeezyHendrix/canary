<script setup lang="ts">
// Transactional section highlighting the API and fast delivery
</script>

<template>
  <section class="bg-gray-50/50 py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h2
          class="text-sm font-semibold tracking-wider text-[#7B00D8] uppercase"
        >
          Transactional
        </h2>
        <p
          class="mt-2 text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl"
        >
          Templates your users are waiting for
        </p>
        <p class="mt-6 text-lg leading-8 text-[#6B7280]">
          Password resets, order confirmations, verification codes — deliver
          critical emails in under 3 seconds with beautiful templates.
        </p>
      </div>

      <div class="mt-16 sm:mt-20">
        <div
          class="no-scrollbar mb-10 flex justify-center gap-6 overflow-x-auto border-b border-gray-200 pb-4"
        >
          <div
            class="-mb-[18px] cursor-pointer border-b-2 border-[#0A0A0A] pb-4 text-sm font-semibold whitespace-nowrap text-[#0A0A0A]"
          >
            API
          </div>
          <div
            class="-mb-[18px] cursor-pointer pb-4 text-sm font-medium whitespace-nowrap text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
          >
            Use cases
          </div>
          <div
            class="-mb-[18px] cursor-pointer pb-4 text-sm font-medium whitespace-nowrap text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
          >
            Webhooks
          </div>
          <div
            class="-mb-[18px] cursor-pointer pb-4 text-sm font-medium whitespace-nowrap text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
          >
            Bounce handling
          </div>
        </div>

        <div
          class="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:flex"
        >
          <div
            class="border-b border-gray-200 p-8 lg:w-1/2 lg:shrink-0 lg:border-r lg:border-b-0 xl:p-12"
          >
            <h3 class="text-2xl font-bold text-[#0A0A0A]">
              One API call to send
            </h3>
            <p class="mt-4 text-base leading-relaxed text-[#6B7280]">
              A single POST request with your template. No SDKs required, but we
              have them if you want them.
            </p>
            <div class="mt-10 grid grid-cols-2 gap-4">
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div
                  class="mb-2 text-sm font-medium tracking-wider text-[#6B7280] uppercase"
                >
                  Response
                </div>
                <div class="text-3xl font-bold text-[#0A0A0A]">~120ms</div>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div
                  class="mb-2 text-sm font-medium tracking-wider text-[#6B7280] uppercase"
                >
                  Delivery
                </div>
                <div class="text-3xl font-bold text-[#0A0A0A]">~2.4s</div>
              </div>
            </div>
          </div>
          <div class="bg-[#0A0A0A] p-4 lg:w-1/2">
            <div
              class="mb-4 flex items-center justify-between px-2 font-mono text-xs text-gray-400"
            >
              <span>POST /api/v1/send</span>
              <span class="text-emerald-400">200 OK</span>
            </div>
            <pre
              class="font-mono text-sm leading-relaxed"
            ><code class="text-gray-300">{
  <span class="text-blue-300">"templateId"</span>: <span class="text-emerald-400">"password-reset"</span>,
  <span class="text-blue-300">"to"</span>: <span class="text-emerald-400">"user@example.com"</span>,
  <span class="text-blue-300">"subject"</span>: <span class="text-emerald-400">"Reset your password"</span>,
  <span class="text-blue-300">"variables"</span>: {
    <span class="text-blue-300">"resetLink"</span>: <span class="text-emerald-400">"https://app.example.com/reset/abc123"</span>
  }
}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
