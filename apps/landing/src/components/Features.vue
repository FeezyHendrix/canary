<script setup>
const infrastructures = [
  {
    id: 1,
    h3: "Smart Queuing",
    p: "Asynchronous sending via a robust job queue ensures your app stays fast, even during high-volume bursts",
  },
  {
    id: 2,
    h3: "Resilience by Default",
    p: "Automatic retries with exponential backoff handle temporary provider outages gracefully",
  },
  {
    id: 3,
    h3: "Full Observability",
    p: "Track every job status in real-time. Know exactly when an email was queued, sent, or if it failed",
  },
];

const security = [
  {
    id: 1,
    h3: "Enterprise Auth",
    p: "Secure access via Google or GitHub OAuth",
  },
  {
    id: 2,
    h3: "Granular Permissions",
    p: "Role-based access control (RBAC) ensures only authorized users can modify production templates",
  },
  {
    id: 3,
    h3: "Multi-Tenancy",
    p: "Organize your work into multiple teams under a single user account perfect for agencies or multi-product companies",
  },
];
const integration = [
  {
    id: 1,
    h3: "API-First Design",
    p: "Fully documented OpenAPI/Swagger endpoints for every action",
  },
  {
    id: 2,
    h3: "Storage Flexibility",
    p: "Support for S3-compatible storage (AWS or local MinIO) for your image assetss",
  },
  {
    id: 3,
    h3: "Webhook Hooks",
    p: "Trigger actions in your own app based on email delivery events",
  },
];
</script>

<template>
  <div
    class="mx-4 flex-col items-center rounded-[40px] border border-[#EDEDED] bg-[url('/images/features-gradient-mobile.png')] bg-size-[100%_100%] bg-no-repeat pb-25 max-md:flex md:mx-10 md:bg-[url('/images/features-gradient.png')]"
  >
    <!-- ENGINEERED FOR 99.9% DELIVERABILITY -->
    <div
      class="flex flex-col-reverse max-md:px-2 md:mr-15 md:ml-10 md:flex-row md:gap-10 lg:mr-20 xl:mr-40 xl:gap-0"
    >
      <!-- FEATURE TEXT -->
      <div class="mt-5 md:mt-20 md:flex-1 xl:max-w-lg">
        <div>
          <h3 class="text-sm font-bold tracking-widest">
            Reliable Infrastructure
          </h3>

          <h1
            class="mt-1 text-[32px] font-medium max-md:leading-8 md:mt-2 md:text-4xl xl:text-5xl"
          >
            Engineered for 99.9% Deliverability
          </h1>

          <p class="mt-2 font-medium md:text-sm xl:text-base">
            Sending the email is only half the battle. Canary manages the
            "noisy" parts of email infrastructure so you don't have to
          </p>
        </div>

        <div class="mt-10 flex flex-col gap-4 md:gap-2 xl:mt-12">
          <div
            v-for="item in infrastructures"
            :key="item.id"
            class="flex gap-1 rounded-xl bg-[#7B00D80A] p-5"
          >
            <div class="shrink-0">
              <img src="/images/logo-2.png" alt="" class="h-5.5 w-5" />
            </div>
            <div class="text-sm xl:text-base">
              <h3 class="font-bold">
                {{ item.h3 }}
              </h3>
              <p class="font-medium">{{ item.p }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FEATURE IMAGE -->
      <div class="mt-10 flex justify-end md:mt-26 md:flex-1">
        <img
          src="/images/stream-illustration.png"
          alt="Email delivery queue and real-time tracking"
          class="h-82 max-md:w-full md:h-117.5"
        />
      </div>
    </div>

    <!-- BUILT FOR COLLABORATION, SECURED FOR SCALE -->
    <div
      class="flex flex-col max-md:mt-10 max-md:px-2 md:mr-10 md:ml-7 md:flex-row md:gap-10"
    >
      <!-- FEATURE IMAGE -->
      <div class="mt-15 md:mt-30 md:flex-1">
        <img
          src="/images/store-illustration.png"
          alt="Team collaboration and access management"
          class="h-48 w-full md:h-94.5"
        />
      </div>

      <!-- FEATURE TEXT -->
      <div class="mt-5 justify-end md:flex-1 xl:max-w-lg">
        <div>
          <h3 class="text-sm font-bold tracking-widest">
            Security & Team Management
          </h3>
          <h1
            class="mt-1 text-[32px] font-medium max-md:leading-8 md:mt-2 md:text-4xl xl:text-5xl"
          >
            Built for Collaboration, Secured for Scale
          </h1>
          <p class="mt-2 font-medium md:text-sm xl:text-base">
            Canary isn't just a solo tool; it's a team workspace
          </p>
        </div>
        <div class="mt-10 flex flex-col gap-4 md:mt-12 md:gap-2">
          <div
            v-for="item in security"
            :key="item.id"
            class="flex gap-1 rounded-xl bg-[#7B00D80A] p-5"
          >
            <div class="shrink-0">
              <img src="/images/logo-2.png" alt="" class="size-5 h-5.5 w-5" />
            </div>
            <div class="text-sm xl:text-base">
              <h3 class="font-bold">
                {{ item.h3 }}
              </h3>
              <p class="font-medium">{{ item.p }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- INTEGRATES WITH YOUR STACK IN MINUTES -->
    <div
      class="flex flex-col-reverse max-md:px-2 md:mr-12 md:ml-10 md:flex-row lg:mr-20 xl:mr-40"
    >
      <!-- FEATURE TEXT -->
      <div class="mt-5 md:flex-1 xl:max-w-lg">
        <div>
          <h3 class="text-sm font-bold tracking-widest">
            The Developer API & Integrations
          </h3>
          <h1
            class="mt-1 text-[32px] font-medium max-md:leading-8 md:mt-2 md:text-4xl xl:text-5xl"
          >
            Integrates with Your Stack in Minutes
          </h1>
          <p class="mt-2 font-medium md:text-sm xl:text-base">
            Canary lives where your data lives. Whether you use AWS S3 for
            images or Postmark for delivery, Canary bridges the gap
          </p>
        </div>
        <div class="mt-10 flex flex-col gap-4 md:mt-12 md:gap-2">
          <div
            v-for="item in integration"
            :key="item.id"
            class="flex gap-1 rounded-xl bg-[#7B00D80A] p-5"
          >
            <div class="shrink-0">
              <img src="/images/logo-2.png" alt="" class="h-5.5 w-5" />
            </div>
            <div class="text-sm xl:text-base">
              <h3 class="font-bold">
                {{ item.h3 }}
              </h3>
              <p class="font-medium">{{ item.p }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FEATURE IMAGE -->
      <div class="mt-10 flex justify-end md:mt-6 md:flex-1">
        <img
          src="/images/query-illustration.png"
          alt="API integration and developer workflow"
          class="h-82 max-md:w-full md:h-117.5"
        />
      </div>
    </div>
  </div>
</template>
5
