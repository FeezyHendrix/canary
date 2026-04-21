<script setup>
import { ref } from "vue";

const activeTab = ref("api");
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
            @click="activeTab = 'api'"
            :class="[
              '-mb-[18px] cursor-pointer pb-4 text-sm whitespace-nowrap transition-colors',
              activeTab === 'api'
                ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                : 'font-medium text-[#6B7280] hover:text-[#0A0A0A]',
            ]"
          >
            API
          </div>
          <div
            @click="activeTab = 'use-cases'"
            :class="[
              '-mb-[18px] cursor-pointer pb-4 text-sm whitespace-nowrap transition-colors',
              activeTab === 'use-cases'
                ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                : 'font-medium text-[#6B7280] hover:text-[#0A0A0A]',
            ]"
          >
            Use cases
          </div>
          <div
            @click="activeTab = 'webhooks'"
            :class="[
              '-mb-[18px] cursor-pointer pb-4 text-sm whitespace-nowrap transition-colors',
              activeTab === 'webhooks'
                ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                : 'font-medium text-[#6B7280] hover:text-[#0A0A0A]',
            ]"
          >
            Webhooks
          </div>
          <div
            @click="activeTab = 'bounce-handling'"
            :class="[
              '-mb-[18px] cursor-pointer pb-4 text-sm whitespace-nowrap transition-colors',
              activeTab === 'bounce-handling'
                ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                : 'font-medium text-[#6B7280] hover:text-[#0A0A0A]',
            ]"
          >
            Bounce handling
          </div>
        </div>

        <div
          class="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:flex"
        >
          <!-- API Tab -->
          <template v-if="activeTab === 'api'">
            <div
              class="border-b border-gray-200 p-8 lg:w-1/2 lg:shrink-0 lg:border-r lg:border-b-0 xl:p-12"
            >
              <h3 class="text-2xl font-bold text-[#0A0A0A]">
                One API call to send
              </h3>
              <p class="mt-4 text-base leading-relaxed text-[#6B7280]">
                A single POST request with your template. No SDKs required, but
                we have them if you want them.
              </p>
              <div class="mt-10 grid grid-cols-2 gap-4">
                <div
                  class="rounded-xl border border-gray-100 bg-gray-50/50 p-6"
                >
                  <div
                    class="mb-2 text-sm font-medium tracking-wider text-[#6B7280] uppercase"
                  >
                    Response
                  </div>
                  <div class="text-3xl font-bold text-[#0A0A0A]">~120ms</div>
                </div>
                <div
                  class="rounded-xl border border-gray-100 bg-gray-50/50 p-6"
                >
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
          </template>

          <!-- Use Cases Tab -->
          <div v-if="activeTab === 'use-cases'" class="w-full p-8 xl:p-12">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div class="mb-4 text-2xl">👋</div>
                <h4 class="font-bold text-[#0A0A0A]">Welcome Emails</h4>
                <p class="mt-2 text-sm text-[#6B7280]">
                  Onboard new users with branded templates
                </p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div class="mb-4 text-2xl">🔒</div>
                <h4 class="font-bold text-[#0A0A0A]">Password Resets</h4>
                <p class="mt-2 text-sm text-[#6B7280]">
                  Secure, instant delivery for account recovery
                </p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div class="mb-4 text-2xl">🧾</div>
                <h4 class="font-bold text-[#0A0A0A]">Order Confirmations</h4>
                <p class="mt-2 text-sm text-[#6B7280]">
                  Transaction receipts with dynamic data
                </p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div class="mb-4 text-2xl">⏱️</div>
                <h4 class="font-bold text-[#0A0A0A]">Verification Codes</h4>
                <p class="mt-2 text-sm text-[#6B7280]">
                  Time-sensitive OTP delivery under 3s
                </p>
              </div>
            </div>
          </div>

          <!-- Webhooks Tab -->
          <div v-if="activeTab === 'webhooks'" class="w-full p-8 xl:p-12">
            <h3 class="text-2xl font-bold text-[#0A0A0A]">
              Get notified in real-time.
            </h3>
            <p class="mt-2 mb-8 text-base text-[#6B7280]">
              We POST events to your endpoint as they happen.
            </p>
            <div class="rounded-xl bg-[#0A0A0A] p-6">
              <pre
                class="font-mono text-sm leading-relaxed"
              ><code class="text-gray-300">{
  <span class="text-blue-300">"event"</span>: <span class="text-emerald-400">"email.delivered"</span>,
  <span class="text-blue-300">"email_id"</span>: <span class="text-emerald-400">"em_9kX2mPvB"</span>,
  <span class="text-blue-300">"to"</span>: <span class="text-emerald-400">"user@example.com"</span>,
  <span class="text-blue-300">"timestamp"</span>: <span class="text-emerald-400">"2025-04-21T10:42:00Z"</span>
}</code></pre>
            </div>
          </div>

          <!-- Bounce handling Tab -->
          <div
            v-if="activeTab === 'bounce-handling'"
            class="w-full p-8 xl:p-12"
          >
            <div class="space-y-4">
              <div
                class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div class="flex items-center gap-3">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                  <span class="font-bold text-[#0A0A0A]">Hard bounce</span>
                </div>
                <span class="text-sm text-[#6B7280]"
                  >Auto-removed from list</span
                >
              </div>
              <div
                class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div class="flex items-center gap-3">
                  <div class="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                  <span class="font-bold text-[#0A0A0A]">Soft bounce</span>
                </div>
                <span class="text-sm text-[#6B7280]">Retry 3x over 72h</span>
              </div>
              <div
                class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div class="flex items-center gap-3">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                  <span class="font-bold text-[#0A0A0A]">Complaint</span>
                </div>
                <span class="text-sm text-[#6B7280]"
                  >Suppressed immediately</span
                >
              </div>
            </div>
            <p class="mt-8 text-center text-sm font-semibold text-[#0A0A0A]">
              0.3% average bounce rate
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
