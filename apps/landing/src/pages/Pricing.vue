<script setup>
import { ref } from "vue";
import Navbar from "@/components/Navbar.vue";

const plans = [
  {
    name: "Community",
    description: "Self-hosted, open source",
    price: "$0",
    period: "forever",
    buttonText: "Get Started",
    buttonLink: "https://github.com/FeezyHendrix/canary",
    buttonClass:
      "bg-white border border-gray-300 text-[#0A0A0A] hover:bg-gray-50",
    cardClass: "border border-gray-200",
    features: [
      "Unlimited templates",
      "Unlimited emails (your provider)",
      "Visual drag-and-drop editor",
      "REST API access",
      "6 email providers supported",
      "Docker deployment",
      "Community support",
    ],
  },
  {
    name: "Pro",
    description: "Managed hosting, zero ops",
    price: "$29",
    period: "month",
    buttonText: "Start Free Trial",
    buttonLink: "#",
    buttonClass: "bg-[#7B00D8] text-white hover:bg-[#6a00ba] shadow-sm",
    cardClass: "border-2 border-[#7B00D8] relative shadow-sm",
    isPopular: true,
    features: [
      "Everything in Community",
      "Managed cloud hosting",
      "Automatic updates",
      "Priority email support",
      "Team collaboration (5 members)",
      "99.9% uptime SLA",
      "Advanced analytics",
    ],
  },
  {
    name: "Enterprise",
    description: "For teams at scale",
    price: "Custom",
    period: "",
    buttonText: "Contact Us",
    buttonLink: "#",
    buttonClass:
      "bg-white border border-gray-300 text-[#0A0A0A] hover:bg-gray-50",
    cardClass: "border border-gray-200",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated infrastructure",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated support",
      "On-premise deployment",
    ],
  },
];

const tableData = [
  {
    category: "Templates",
    features: [
      {
        name: "Template limit",
        community: "Unlimited",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      { name: "Visual editor", community: true, pro: true, enterprise: true },
      { name: "HTML templates", community: true, pro: true, enterprise: true },
      {
        name: "Template variables",
        community: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Sending",
    features: [
      {
        name: "Email providers",
        community: "6",
        pro: "6",
        enterprise: "Custom",
      },
      { name: "REST API", community: true, pro: true, enterprise: true },
      { name: "SMTP relay", community: true, pro: true, enterprise: true },
      { name: "Webhooks", community: true, pro: true, enterprise: true },
      { name: "PDF attachments", community: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Infrastructure",
    features: [
      {
        name: "Self-hosted",
        community: true,
        pro: "Optional",
        enterprise: "Optional",
      },
      { name: "Cloud hosted", community: false, pro: true, enterprise: true },
      { name: "Auto updates", community: false, pro: true, enterprise: true },
      {
        name: "Uptime SLA",
        community: false,
        pro: "99.9%",
        enterprise: "99.99%",
      },
    ],
  },
  {
    category: "Team",
    features: [
      {
        name: "Team members",
        community: "1",
        pro: "5",
        enterprise: "Unlimited",
      },
      {
        name: "Role-based access",
        community: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    features: [
      {
        name: "Community support",
        community: true,
        pro: true,
        enterprise: true,
      },
      { name: "Email support", community: false, pro: true, enterprise: true },
      {
        name: "Priority support",
        community: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

const faqs = ref([
  {
    question: "Is Canary really free?",
    answer:
      "Yes. Canary is open-source under AGPL-3.0. Self-host it forever at no cost. The paid plans are for teams who want managed hosting.",
    isOpen: false,
  },
  {
    question: "Can I switch plans anytime?",
    answer: "Yes. Upgrade, downgrade, or cancel anytime. No contracts.",
    isOpen: false,
  },
  {
    question: "What email providers are supported?",
    answer:
      "SendGrid, Resend, Mailgun, Amazon SES, Postmark, and any SMTP server.",
    isOpen: false,
  },
  {
    question: "Do I need to pay to use the API?",
    answer:
      "No. The REST API is available on all plans including the free self-hosted Community plan.",
    isOpen: false,
  },
  {
    question: "What's included in enterprise?",
    answer:
      "Custom integrations, dedicated infrastructure, SLA guarantees, and priority support. Contact us to discuss your needs.",
    isOpen: false,
  },
]);

const toggleFaq = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen;
};
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-[#6B7280]">
    <div class="flex justify-center">
      <Navbar />
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-24 pb-24 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mx-auto mt-8 mb-16 max-w-3xl text-center md:mt-12">
        <h2
          class="mb-3 text-xs font-bold tracking-widest text-[#7B00D8] uppercase"
        >
          Pricing
        </h2>
        <h1
          class="mb-4 text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl"
        >
          Simple, transparent pricing
        </h1>
        <p class="text-xl text-[#6B7280]">
          Self-host for free. Or let us handle the infrastructure.
        </p>
      </div>

      <!-- Cards -->
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <div
          v-for="plan in plans"
          :key="plan.name"
          :class="['flex flex-col rounded-xl bg-white p-8', plan.cardClass]"
        >
          <div
            v-if="plan.isPopular"
            class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7B00D8] px-3 py-1 text-xs font-bold tracking-wide text-white uppercase"
          >
            Most Popular
          </div>

          <h3 class="mb-1 text-xl font-bold text-[#0A0A0A]">{{ plan.name }}</h3>
          <p class="mb-6 min-h-[40px] text-sm">{{ plan.description }}</p>

          <div class="mb-6 flex items-baseline gap-1">
            <span class="text-4xl font-bold text-[#0A0A0A]">{{
              plan.price
            }}</span>
            <span v-if="plan.period" class="font-medium text-[#6B7280]"
              >/ {{ plan.period }}</span
            >
          </div>

          <a
            :href="plan.buttonLink"
            :target="plan.buttonLink.startsWith('http') ? '_blank' : '_self'"
            :class="[
              'mb-8 w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors',
              plan.buttonClass,
            ]"
          >
            {{ plan.buttonText }}
          </a>

          <ul class="flex-1 space-y-4">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-start gap-3 text-sm text-[#0A0A0A]"
            >
              <svg
                class="h-5 w-5 shrink-0 text-[#7B00D8]"
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
              <span class="font-medium">{{ feature }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tagline -->
      <div class="mt-12 mb-24 text-center">
        <p class="text-sm font-medium">
          Open source &middot; Self-hostable &middot; No vendor lock-in
        </p>
      </div>

      <!-- Compare Table -->
      <div class="mx-auto mt-24 max-w-5xl">
        <h2 class="mb-12 text-center text-3xl font-bold text-[#0A0A0A]">
          Compare all features
        </h2>
        <div class="overflow-x-auto pb-4">
          <table class="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr>
                <th
                  class="w-2/5 border-b border-gray-200 px-6 py-4 font-semibold text-[#0A0A0A]"
                >
                  Feature
                </th>
                <th
                  class="w-1/5 border-b border-gray-200 px-6 py-4 text-center font-semibold text-[#0A0A0A]"
                >
                  Community
                </th>
                <th
                  class="w-1/5 border-b border-gray-200 px-6 py-4 text-center font-semibold text-[#0A0A0A]"
                >
                  Pro
                </th>
                <th
                  class="w-1/5 border-b border-gray-200 px-6 py-4 text-center font-semibold text-[#0A0A0A]"
                >
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody v-for="section in tableData" :key="section.category">
              <tr>
                <td
                  colspan="4"
                  class="bg-gray-50 px-6 py-4 font-bold text-[#0A0A0A]"
                >
                  {{ section.category }}
                </td>
              </tr>
              <tr v-for="feature in section.features" :key="feature.name">
                <td class="border-b border-gray-100 px-6 py-4 font-medium">
                  {{ feature.name }}
                </td>

                <!-- Community Col -->
                <td class="border-b border-gray-100 px-6 py-4 text-center">
                  <svg
                    v-if="feature.community === true"
                    class="inline-block h-5 w-5 text-[#7B00D8]"
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
                  <span
                    v-else-if="feature.community === false"
                    class="text-gray-300"
                    >—</span
                  >
                  <span v-else class="font-semibold text-[#0A0A0A]">{{
                    feature.community
                  }}</span>
                </td>

                <!-- Pro Col -->
                <td class="border-b border-gray-100 px-6 py-4 text-center">
                  <svg
                    v-if="feature.pro === true"
                    class="inline-block h-5 w-5 text-[#7B00D8]"
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
                  <span v-else-if="feature.pro === false" class="text-gray-300"
                    >—</span
                  >
                  <span v-else class="font-semibold text-[#0A0A0A]">{{
                    feature.pro
                  }}</span>
                </td>

                <!-- Enterprise Col -->
                <td class="border-b border-gray-100 px-6 py-4 text-center">
                  <svg
                    v-if="feature.enterprise === true"
                    class="inline-block h-5 w-5 text-[#7B00D8]"
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
                  <span
                    v-else-if="feature.enterprise === false"
                    class="text-gray-300"
                    >—</span
                  >
                  <span v-else class="font-semibold text-[#0A0A0A]">{{
                    feature.enterprise
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mx-auto mt-32 max-w-3xl">
        <h2 class="mb-10 text-center text-3xl font-bold text-[#0A0A0A]">
          Frequently asked questions
        </h2>
        <div class="space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <button
              @click="toggleFaq(index)"
              class="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50 focus:outline-none"
            >
              <span class="font-semibold text-[#0A0A0A]">{{
                faq.question
              }}</span>
              <svg
                :class="{ 'rotate-180': faq.isOpen }"
                class="ml-4 h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="faq.isOpen"
              class="px-6 pb-5 leading-relaxed text-[#6B7280]"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div
        class="mx-auto mt-32 mb-8 max-w-5xl rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center md:p-16"
      >
        <h2 class="mb-4 text-3xl font-bold text-[#0A0A0A]">
          Ready to start building?
        </h2>
        <p class="mb-8 text-lg">Deploy Canary in under 5 minutes.</p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="#"
            class="inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7B00D8] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6a00ba]"
          >
            Start for free
          </a>
          <a
            href="https://feezyhendrix.github.io/canary/"
            target="_blank"
            class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-gray-50"
          >
            Read the docs
          </a>
        </div>
      </div>
    </main>
  </div>
</template>
