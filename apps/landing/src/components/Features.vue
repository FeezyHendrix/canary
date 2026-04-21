<script setup>
import { ref } from "vue";

const activeCard2Tab = ref("Overview");
const activeCard3Tab = ref("REST API");
// Features section matching the 4-card grid layout spec
</script>

<template>
  <section class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="max-w-3xl">
        <h2
          class="text-sm font-semibold tracking-wider text-[#7B00D8] uppercase"
        >
          Features
        </h2>
        <p
          class="mt-2 text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl"
        >
          Built for the way you work
        </p>
      </div>

      <div class="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Card 01 -->
        <div
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <h3 class="text-xl font-semibold text-[#0A0A0A]">
            Templates that render everywhere
          </h3>
          <p class="mt-3 leading-relaxed text-[#6B7280]">
            We test across 90+ email clients. Your templates render perfectly in
            Gmail, Outlook, Apple Mail, and every client that matters.
          </p>
          <div
            class="mt-8 grid grid-cols-3 gap-4 border-b border-gray-100 pb-6"
          >
            <div>
              <div class="text-2xl font-bold text-[#0A0A0A]">98.2%</div>
              <div
                class="mt-1 text-xs font-medium tracking-wide text-[#6B7280] uppercase"
              >
                Inbox compatibility
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#0A0A0A]">90+</div>
              <div
                class="mt-1 text-xs font-medium tracking-wide text-[#6B7280] uppercase"
              >
                Client coverage
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#0A0A0A]">&lt;1s</div>
              <div
                class="mt-1 text-xs font-medium tracking-wide text-[#6B7280] uppercase"
              >
                Render time
              </div>
            </div>
          </div>
          <div
            class="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#0A0A0A]"
          >
            <div class="flex items-center gap-2">
              <svg
                class="h-4 w-4 text-[#7B00D8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              10 Block types
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="h-4 w-4 text-[#7B00D8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              6 Providers
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="h-4 w-4 text-[#7B00D8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              &lt;3s Delivery
            </div>
          </div>
        </div>

        <!-- Card 02 -->
        <div
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <h3 class="text-xl font-semibold text-[#0A0A0A]">
            One platform, not ten
          </h3>
          <p class="mt-3 mb-8 leading-relaxed text-[#6B7280]">
            Template design, API sending, delivery tracking — handle it all from
            one dashboard.
          </p>
          <div
            class="mt-auto rounded-lg border border-gray-100 bg-gray-50/50 p-4"
          >
            <div
              class="mb-4 flex items-center gap-4 border-b border-gray-200 pb-3"
            >
              <div
                @click="activeCard2Tab = 'Overview'"
                class="-mb-[14px] cursor-pointer pb-3 text-sm"
                :class="
                  activeCard2Tab === 'Overview'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Overview
              </div>
              <div
                @click="activeCard2Tab = 'Templates'"
                class="-mb-[14px] cursor-pointer pb-3 text-sm"
                :class="
                  activeCard2Tab === 'Templates'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Templates
              </div>
              <div
                @click="activeCard2Tab = 'Logs'"
                class="-mb-[14px] cursor-pointer pb-3 text-sm"
                :class="
                  activeCard2Tab === 'Logs'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Logs
              </div>
            </div>
            <div v-if="activeCard2Tab === 'Overview'">
              <div class="mb-4 grid grid-cols-2 gap-3">
                <div class="rounded border border-gray-100 bg-white p-3">
                  <div class="mb-1 text-xs text-[#6B7280]">Sent</div>
                  <div class="font-semibold text-[#0A0A0A]">24,891</div>
                </div>
                <div class="rounded border border-gray-100 bg-white p-3">
                  <div class="mb-1 text-xs text-[#6B7280]">Delivered</div>
                  <div class="font-semibold text-[#0A0A0A]">24,612</div>
                </div>
                <div class="rounded border border-gray-100 bg-white p-3">
                  <div class="mb-1 text-xs text-[#6B7280]">Opened</div>
                  <div class="font-semibold text-[#0A0A0A]">12,305</div>
                </div>
                <div class="rounded border border-gray-100 bg-white p-3">
                  <div class="mb-1 text-xs text-[#6B7280]">Clicked</div>
                  <div class="font-semibold text-[#0A0A0A]">3,841</div>
                </div>
              </div>
              <div
                class="relative flex h-20 items-end justify-between overflow-hidden rounded border border-gray-100 bg-white p-3"
              >
                <div
                  class="absolute top-3 left-3 text-xs font-medium text-[#6B7280]"
                >
                  Templates created — last 30 days
                  <span class="ml-1 font-semibold text-emerald-500">↑ 23%</span>
                </div>
                <div class="mt-6 flex h-8 w-full items-end gap-1 opacity-40">
                  <div class="h-[40%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                  <div class="h-[60%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                  <div class="h-[30%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                  <div class="h-[80%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                  <div class="h-[50%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                  <div class="h-[90%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                  <div class="h-[100%] w-full rounded-t-sm bg-[#7B00D8]"></div>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeCard2Tab === 'Templates'"
              class="flex h-[184px] flex-col gap-3"
            >
              <div
                class="flex items-center justify-between rounded border border-gray-100 bg-white p-3"
              >
                <span class="text-sm font-medium text-[#0A0A0A]"
                  >Welcome Email</span
                >
                <span
                  class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-500 uppercase"
                  >Active</span
                >
              </div>
              <div
                class="flex items-center justify-between rounded border border-gray-100 bg-white p-3"
              >
                <span class="text-sm font-medium text-[#0A0A0A]"
                  >Password Reset</span
                >
                <span
                  class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-500 uppercase"
                  >Active</span
                >
              </div>
              <div
                class="flex items-center justify-between rounded border border-gray-100 bg-white p-3"
              >
                <span class="text-sm font-medium text-[#0A0A0A]"
                  >Weekly Newsletter</span
                >
                <span
                  class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase"
                  >Draft</span
                >
              </div>
            </div>

            <div
              v-else-if="activeCard2Tab === 'Logs'"
              class="flex h-[184px] flex-col gap-3"
            >
              <div class="rounded border border-gray-100 bg-white p-3 text-sm">
                <div
                  class="mb-1 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase"
                >
                  10:42 AM
                </div>
                <div class="text-sm text-[#0A0A0A]">
                  Email sent to
                  <span class="font-mono text-xs text-[#6B7280]"
                    >j***@gmail.com</span
                  >
                </div>
              </div>
              <div class="rounded border border-gray-100 bg-white p-3 text-sm">
                <div
                  class="mb-1 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase"
                >
                  10:41 AM
                </div>
                <div class="text-sm text-[#0A0A0A]">
                  Email opened by
                  <span class="font-mono text-xs text-[#6B7280]"
                    >a***@hey.com</span
                  >
                </div>
              </div>
              <div class="rounded border border-gray-100 bg-white p-3 text-sm">
                <div
                  class="mb-1 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase"
                >
                  10:38 AM
                </div>
                <div class="text-sm text-[#0A0A0A]">
                  Email sent to
                  <span class="font-mono text-xs text-[#6B7280]"
                    >r***@yahoo.com</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 03 -->
        <div
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <h3 class="text-xl font-semibold text-[#0A0A0A]">
            Ship in minutes, not days
          </h3>
          <p class="mt-3 mb-6 leading-relaxed text-[#6B7280]">
            A clean REST API and visual builder. Design your template and start
            sending.
          </p>
          <div class="mt-auto">
            <div
              class="no-scrollbar mb-4 flex gap-4 overflow-x-auto border-b border-gray-100 pb-3"
            >
              <div
                @click="activeCard3Tab = 'REST API'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'REST API'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                REST API
              </div>
              <div
                @click="activeCard3Tab = 'SMTP'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'SMTP'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                SMTP
              </div>
              <div
                @click="activeCard3Tab = 'Node.js'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'Node.js'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Node.js
              </div>
              <div
                @click="activeCard3Tab = 'Python'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'Python'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Python
              </div>
              <div
                @click="activeCard3Tab = 'Go'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'Go'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Go
              </div>
              <div
                @click="activeCard3Tab = 'PHP'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'PHP'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                PHP
              </div>
              <div
                @click="activeCard3Tab = 'Ruby'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'Ruby'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                Ruby
              </div>
              <div
                @click="activeCard3Tab = 'cURL'"
                class="-mb-[13px] cursor-pointer pb-3 text-xs whitespace-nowrap"
                :class="
                  activeCard3Tab === 'cURL'
                    ? 'border-b-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280]'
                "
              >
                cURL
              </div>
            </div>
            <div class="overflow-hidden rounded-lg bg-[#0A0A0A]">
              <div
                class="flex border-b border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2"
              >
                <div class="font-mono text-[11px] text-gray-300">
                  <span v-if="activeCard3Tab === 'REST API'">send.ts</span>
                  <span v-else-if="activeCard3Tab === 'SMTP'">smtp.conf</span>
                  <span v-else-if="activeCard3Tab === 'Node.js'">send.js</span>
                  <span v-else-if="activeCard3Tab === 'Python'">send.py</span>
                  <span v-else-if="activeCard3Tab === 'Go'">send.go</span>
                  <span v-else-if="activeCard3Tab === 'PHP'">send.php</span>
                  <span v-else-if="activeCard3Tab === 'Ruby'">send.rb</span>
                  <span v-else-if="activeCard3Tab === 'cURL'">send.sh</span>
                </div>
                <div class="ml-4 font-mono text-[11px] text-gray-600">
                  <span
                    v-if="
                      activeCard3Tab === 'REST API' ||
                      activeCard3Tab === 'Node.js'
                    "
                    >package.json</span
                  >
                  <span v-else-if="activeCard3Tab === 'Python'"
                    >requirements.txt</span
                  >
                  <span v-else-if="activeCard3Tab === 'Go'">go.mod</span>
                  <span v-else-if="activeCard3Tab === 'PHP'"
                    >composer.json</span
                  >
                  <span v-else-if="activeCard3Tab === 'Ruby'">Gemfile</span>
                </div>
              </div>
              <pre
                class="overflow-x-auto p-4"
              ><code class="text-sm font-mono leading-relaxed text-gray-300"><template v-if="activeCard3Tab === 'REST API'"><span class="text-[#7B00D8]">await</span> canary.emails.<span class="text-blue-400">send</span>({
  from: <span class="text-emerald-400">'noreply@yourapp.com'</span>,
  to: <span class="text-emerald-400">'user@example.com'</span>,
  subject: <span class="text-emerald-400">'Hello'</span>,
  templateId: <span class="text-emerald-400">'welcome'</span>,
  variables: { name: <span class="text-emerald-400">'Alex'</span> }
});</template><template v-else-if="activeCard3Tab === 'SMTP'">HOST=smtp.canary.com
PORT=587
USER=api_key
PASS=cnry_your_api_key</template><template v-else-if="activeCard3Tab === 'Node.js'"><span class="text-[#7B00D8]">const</span> canary = <span class="text-blue-400">require</span>(<span class="text-emerald-400">'@canary/sdk'</span>);

canary.<span class="text-blue-400">init</span>(<span class="text-emerald-400">'cnry_your_api_key'</span>);

<span class="text-[#7B00D8]">await</span> canary.emails.<span class="text-blue-400">send</span>({
  to: <span class="text-emerald-400">'user@example.com'</span>,
  template: <span class="text-emerald-400">'welcome'</span>
});</template><template v-else-if="activeCard3Tab === 'Python'"><span class="text-[#7B00D8]">import</span> canary

client = canary.<span class="text-blue-400">Client</span>(api_key=<span class="text-emerald-400">'cnry_your_api_key'</span>)

client.emails.<span class="text-blue-400">send</span>(
    to=<span class="text-emerald-400">'user@example.com'</span>,
    template_id=<span class="text-emerald-400">'welcome'</span>
)</template><template v-else-if="activeCard3Tab === 'Go'"><span class="text-[#7B00D8]">package</span> main

<span class="text-[#7B00D8]">import</span> <span class="text-emerald-400">"github.com/canary/canary-go"</span>

<span class="text-[#7B00D8]">func</span> <span class="text-blue-400">main</span>() {
    client := canary.<span class="text-blue-400">NewClient</span>(<span class="text-emerald-400">"cnry_your_api_key"</span>)
    
    client.<span class="text-blue-400">Send</span>(&canary.Email{
        To:       <span class="text-emerald-400">"user@example.com"</span>,
        Template: <span class="text-emerald-400">"welcome"</span>,
    })
}</template><template v-else-if="activeCard3Tab === 'PHP'">$canary = <span class="text-[#7B00D8]">new</span> <span class="text-blue-400">Canary</span>(<span class="text-emerald-400">'cnry_your_api_key'</span>);

$canary->emails-><span class="text-blue-400">send</span>([
    <span class="text-emerald-400">'to'</span> => <span class="text-emerald-400">'user@example.com'</span>,
    <span class="text-emerald-400">'template'</span> => <span class="text-emerald-400">'welcome'</span>
]);</template><template v-else-if="activeCard3Tab === 'Ruby'">canary = Canary::Client.<span class="text-blue-400">new</span>(<span class="text-emerald-400">'cnry_your_api_key'</span>)

canary.emails.<span class="text-blue-400">send</span>(
  to: <span class="text-emerald-400">'user@example.com'</span>,
  template: <span class="text-emerald-400">'welcome'</span>
)</template><template v-else-if="activeCard3Tab === 'cURL'">curl -X POST https://api.canary.email/v1/send \
  -H <span class="text-emerald-400">"Authorization: Bearer cnry_your_api_key"</span> \
  -H <span class="text-emerald-400">"Content-Type: application/json"</span> \
  -d <span class="text-emerald-400">'{"to":"user@example.com","template":"welcome"}'</span></template></code></pre>
            </div>
          </div>
        </div>

        <!-- Card 04 -->
        <div
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <h3 class="text-xl font-semibold text-[#0A0A0A]">
            Know what's happening
          </h3>
          <p class="mt-3 mb-8 leading-relaxed text-[#6B7280]">
            Real-time delivery status and engagement analytics.
          </p>
          <div
            class="mt-auto rounded-lg border border-gray-100 bg-gray-50/50 p-5"
          >
            <div class="mb-6 space-y-4">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span class="font-medium text-[#0A0A0A]">Delivered</span>
                  <span class="font-mono text-xs text-[#6B7280]"
                    >j***@gmail.com</span
                  >
                </div>
                <span class="text-xs text-[#6B7280]">now</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span class="font-medium text-[#0A0A0A]">Opened</span>
                  <span class="font-mono text-xs text-[#6B7280]"
                    >a***@hey.com</span
                  >
                </div>
                <span class="text-xs text-[#6B7280]">2s</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-2 rounded-full bg-[#7B00D8]"></div>
                  <span class="font-medium text-[#0A0A0A]">Clicked</span>
                  <span class="font-mono text-xs text-[#6B7280]"
                    >m***@outlook.com</span
                  >
                </div>
                <span class="text-xs text-[#6B7280]">5s</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span class="font-medium text-[#0A0A0A]">Delivered</span>
                  <span class="font-mono text-xs text-[#6B7280]"
                    >r***@yahoo.com</span
                  >
                </div>
                <span class="text-xs text-[#6B7280]">8s</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-2 rounded-full bg-gray-400"></div>
                  <span class="font-medium text-[#0A0A0A]">Sent</span>
                  <span class="font-mono text-xs text-[#6B7280]"
                    >k***@proton.me</span
                  >
                </div>
                <span class="text-xs text-[#6B7280]">12s</span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 border-t border-gray-200 pt-4">
              <div>
                <div class="text-lg font-bold text-[#0A0A0A]">99.1%</div>
                <div
                  class="text-[10px] font-medium tracking-wider text-[#6B7280] uppercase"
                >
                  Delivered
                </div>
              </div>
              <div>
                <div class="text-lg font-bold text-[#0A0A0A]">52.3%</div>
                <div
                  class="text-[10px] font-medium tracking-wider text-[#6B7280] uppercase"
                >
                  Open rate
                </div>
              </div>
              <div>
                <div class="text-lg font-bold text-[#0A0A0A]">12.8%</div>
                <div
                  class="text-[10px] font-medium tracking-wider text-[#6B7280] uppercase"
                >
                  Click rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
