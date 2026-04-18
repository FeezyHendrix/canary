<template>
  <footer class="border-t border-[#E5E7EB] bg-[#FAFAFA] pt-16 pb-8">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div
        class="mb-12 flex flex-col items-start justify-between md:flex-row md:items-center"
      >
        <div class="mb-6 md:mb-0">
          <router-link to="/">
            <img
              src="/images/logo.png"
              alt="Canary logo"
              class="h-8 w-auto opacity-80 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
            />
          </router-link>
        </div>
        <div class="flex space-x-6">
          <a
            href="https://github.com/FeezyHendrix/canary"
            target="_blank"
            class="text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
          >
            <span class="sr-only">GitHub</span>
            <svg
              class="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
          <a
            href="https://twitter.com/canaborofficial"
            target="_blank"
            class="text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
          >
            <span class="sr-only">Twitter/X</span>
            <svg
              class="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"
              />
            </svg>
          </a>
        </div>
      </div>

      <div class="mb-12 h-px w-full bg-[#E5E7EB]"></div>

      <div class="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <h3
            class="mb-4 text-xs font-semibold tracking-wider text-[#0A0A0A] uppercase"
          >
            Get Started
          </h3>
          <ul class="space-y-3">
            <li>
              <a
                href="https://feezyhendrix.github.io/canary/"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Documentation</a
              >
            </li>
            <li>
              <a
                href="https://feezyhendrix.github.io/canary/"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >API Reference</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >SDKs</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Status</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="mb-4 text-xs font-semibold tracking-wider text-[#0A0A0A] uppercase"
          >
            Company
          </h3>
          <ul class="space-y-3">
            <li>
              <router-link
                to="/pricing"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Pricing</router-link
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Blog</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary/issues"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Contact</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >GitHub</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="mb-4 text-xs font-semibold tracking-wider text-[#0A0A0A] uppercase"
          >
            Tools
          </h3>
          <ul class="space-y-3">
            <li>
              <a
                href="https://feezyhendrix.github.io/canary/"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Email Editor</a
              >
            </li>
            <li>
              <a
                href="https://feezyhendrix.github.io/canary/"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Templates</a
              >
            </li>
            <li>
              <a
                href="https://feezyhendrix.github.io/canary/"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >SMTP</a
              >
            </li>
            <li>
              <a
                href="https://feezyhendrix.github.io/canary/"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >API</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="mb-4 text-xs font-semibold tracking-wider text-[#0A0A0A] uppercase"
          >
            Legal
          </h3>
          <ul class="space-y-3">
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Privacy</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Terms</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary/blob/master/LICENSE"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >License (AGPL-3.0)</a
              >
            </li>
            <li>
              <a
                href="https://github.com/FeezyHendrix/canary/security"
                target="_blank"
                class="text-sm text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >Security</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col items-center justify-between md:flex-row">
        <p class="text-sm text-[#6B7280]">&copy; {{ year }} Canary</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>
