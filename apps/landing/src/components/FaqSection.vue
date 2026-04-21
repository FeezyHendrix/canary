<template>
  <section class="bg-white py-24">
    <div class="mx-auto max-w-3xl px-6 lg:px-8">
      <div class="mb-16">
        <h2
          class="text-sm font-semibold tracking-wider text-[#6B7280] uppercase"
        >
          FAQ
        </h2>
        <p
          class="mt-2 text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-4xl"
        >
          Common questions
        </p>
      </div>

      <div class="divide-y divide-[#E5E7EB]">
        <div v-for="(faq, index) in faqs" :key="index" class="py-6">
          <button
            @click="toggle(index)"
            class="flex w-full items-start justify-between text-left text-[#0A0A0A] focus:outline-none"
          >
            <span class="text-base leading-7 font-medium">{{
              faq.question
            }}</span>
            <span class="ml-6 flex h-7 items-center">
              <svg
                class="h-6 w-6 transform text-[#6B7280] transition-transform duration-200"
                :class="{ 'rotate-180': isOpen(index) }"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </button>
          <div
            v-show="isOpen(index)"
            class="mt-4 pr-12 transition-all duration-200"
          >
            <p class="text-base leading-7 text-[#6B7280]">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const faqs = [
  {
    question: "How does the free plan work?",
    answer:
      "Canary is open-source and free to self-host. There are no sending limits when you run it on your own infrastructure. Connect your own email provider and send unlimited emails.",
  },
  {
    question: "Will my emails actually render properly?",
    answer:
      "Yes. Canary's visual builder generates responsive HTML that's tested across 90+ email clients including Gmail, Outlook, Apple Mail, and Yahoo Mail.",
  },
  {
    question: "Can I use my own email provider?",
    answer:
      "Absolutely. Canary supports SendGrid, Resend, Mailgun, Amazon SES, Postmark, and any generic SMTP server. Switch providers anytime without changing your templates.",
  },
  {
    question: "How long does it take to get started?",
    answer:
      "Under 5 minutes. Clone the repo, run Docker Compose, and you're designing templates. No complex configuration required.",
  },
  {
    question: "What kind of emails can I build?",
    answer:
      "Any kind. Welcome emails, password resets, order confirmations, marketing newsletters, invoices with PDF attachments — Canary handles it all with a single visual editor.",
  },
  {
    question: "Can I use it with my existing codebase?",
    answer:
      "Yes. Canary provides a REST API with API key authentication. Send emails from any language — JavaScript, Python, Go, PHP, Ruby, or anything that can make HTTP requests.",
  },
];

const openIndex = ref(null);

const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};

const isOpen = (index) => openIndex.value === index;
</script>
