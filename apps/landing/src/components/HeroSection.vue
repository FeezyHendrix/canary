<script setup></script>

<template>
  <section
    class="relative overflow-hidden bg-white pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32"
  >
    <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
      <!-- Subtitle badge -->
      <div
        class="mb-8 inline-flex items-center justify-center rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 ring-1 ring-gray-200 ring-inset"
      >
        <span class="flex items-center gap-1.5">
          <svg
            class="size-4 text-[#7B00D8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.488l1.154 4.337c.14.531-.45.962-.894.676l-4.693-3.04a.562.562 0 00-.615 0l-4.693 3.04c-.444.286-1.034-.145-.894-.676l1.154-4.337a.563.563 0 00-1.81-.488L2.43 10.385c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          An open-source alternative to Resend
        </span>
      </div>

      <!-- Main Headline -->
      <h1
        class="text-5xl font-bold tracking-tight text-[#0A0A0A] sm:text-7xl lg:text-8xl"
      >
        One Platform.<br />
        <span class="text-gray-400">Infinite Templates.</span>
      </h1>

      <!-- Subtext -->
      <p
        class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl sm:leading-9"
      >
        Canary is the open-source email template designer built for developers.
        Design visually, send via API, self-host everything.
      </p>

      <!-- CTAs -->
      <div class="mt-10 flex items-center justify-center gap-x-4">
        <a
          href="https://app.canary.email/register"
          class="rounded-xl bg-[#7B00D8] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6A00B8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B00D8]"
        >
          Get Started
        </a>
        <a
          href="https://feezyhendrix.github.io/canary/"
          target="_blank"
          class="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0A0A0A] shadow-sm ring-1 ring-gray-200 transition-all ring-inset hover:bg-gray-50"
        >
          Documentation
        </a>
      </div>

      <!-- Code Snippet Area -->
      <div class="relative mx-auto mt-16 max-w-5xl sm:mt-24">
        <div
          class="grid grid-cols-1 items-start gap-4 text-left lg:grid-cols-3"
        >
          <!-- Code Card -->
          <div
            class="overflow-hidden rounded-2xl bg-[#0A0A0A] shadow-2xl ring-1 ring-white/10 lg:col-span-2"
          >
            <div
              class="flex items-center gap-4 border-b border-white/10 bg-white/5 px-4 py-3"
            >
              <div class="flex gap-1.5">
                <div class="size-3 rounded-full bg-gray-600"></div>
                <div class="size-3 rounded-full bg-gray-600"></div>
                <div class="size-3 rounded-full bg-gray-600"></div>
              </div>
              <div class="font-geist text-xs text-gray-400">send-email.ts</div>
            </div>
            <div class="overflow-x-auto p-6">
              <pre
                class="code-block text-sm"
              ><code class="language-typescript"><span class="token comment">// Send with Canary</span>
<span class="token keyword">await</span> canary<span class="token punctuation">.</span>emails<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  from<span class="token operator">:</span> <span class="token string">'hello@yourapp.com'</span><span class="token punctuation">,</span>
  to<span class="token operator">:</span> <span class="token string">'user@example.com'</span><span class="token punctuation">,</span>
  subject<span class="token operator">:</span> <span class="token string">'Welcome aboard!'</span><span class="token punctuation">,</span>
  templateId<span class="token operator">:</span> <span class="token string">'welcome-template'</span><span class="token punctuation">,</span>
  variables<span class="token operator">:</span> <span class="token punctuation">{</span> name<span class="token operator">:</span> <span class="token string">'Alex'</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span></code></pre>
            </div>
          </div>

          <!-- Response Card -->
          <div
            class="relative z-10 mt-4 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 lg:col-span-1 lg:mt-12 lg:-ml-8"
          >
            <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
              <div
                class="text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Response
              </div>
            </div>
            <div class="p-6">
              <pre
                class="code-block text-sm text-[#0A0A0A]"
              ><code><span class="token punctuation">{</span>
  <span class="token property">"id"</span><span class="token operator">:</span> <span class="token string">"em_9kX2mPvB"</span>
<span class="token punctuation">}</span></code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Timeline -->
      <div class="mx-auto mt-12 max-w-2xl sm:mt-16">
        <div
          class="mb-6 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
        >
          Delivery Timeline
        </div>
        <div class="flex items-start justify-between">
          <!-- Step 1: Queued -->
          <div class="flex w-16 flex-col items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
            <div class="flex flex-col items-center">
              <span class="text-xs text-[#6B7280]">Queued</span>
              <span class="font-mono text-sm text-[#0A0A0A]">0ms</span>
            </div>
          </div>

          <!-- Line -->
          <div class="mt-1.5 h-px flex-1 bg-gray-200"></div>

          <!-- Step 2: Sent -->
          <div class="flex w-16 flex-col items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
            <div class="flex flex-col items-center">
              <span class="text-xs text-[#6B7280]">Sent</span>
              <span class="font-mono text-sm text-[#0A0A0A]">84ms</span>
            </div>
          </div>

          <!-- Line -->
          <div class="mt-1.5 h-px flex-1 bg-gray-200"></div>

          <!-- Step 3: Delivered -->
          <div class="flex w-16 flex-col items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
            <div class="flex flex-col items-center">
              <span class="text-xs text-[#6B7280]">Delivered</span>
              <span class="font-mono text-sm text-[#0A0A0A]">240ms</span>
            </div>
          </div>

          <!-- Line -->
          <div class="mt-1.5 h-px flex-1 bg-gray-200"></div>

          <!-- Step 4: Opened -->
          <div class="flex w-16 flex-col items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
            <div class="flex flex-col items-center">
              <span class="text-xs text-[#6B7280]">Opened</span>
              <span class="font-mono text-sm text-[#0A0A0A]">1.2s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Bar -->
      <div
        class="mx-auto mt-16 max-w-4xl border-t border-gray-100 pt-10 sm:mt-20 sm:pt-16"
      >
        <dl class="grid grid-cols-1 gap-y-8 text-center sm:grid-cols-3">
          <div class="mx-auto flex max-w-xs flex-col gap-y-2">
            <dt class="text-base leading-7 text-gray-600">Delivery rate</dt>
            <dd
              class="order-first text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl"
            >
              99.9%
            </dd>
          </div>
          <div class="mx-auto flex max-w-xs flex-col gap-y-2">
            <dt class="text-base leading-7 text-gray-600">API latency</dt>
            <dd
              class="order-first text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl"
            >
              &lt;200ms
            </dd>
          </div>
          <div class="mx-auto flex max-w-xs flex-col gap-y-2">
            <dt class="text-base leading-7 text-gray-600">Regions</dt>
            <dd
              class="order-first text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl"
            >
              Global
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
