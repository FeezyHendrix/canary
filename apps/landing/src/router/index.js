import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Pricing from "@/pages/Pricing.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Canary - Open-Source Email Template Designer",
      description:
        "Drag, drop, and deploy production-ready email templates in seconds. Canary is a developer-first, self-hosted platform to design pixel-perfect email templates visually.",
    },
  },
  {
    path: "/pricing",
    name: "Pricing",
    component: Pricing,
    meta: {
      title: "Pricing - Canary",
      description:
        "Simple pricing, full control. Choose the plan that fits your email template workflow — from free to pro.",
    },
  },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  document.title = to.meta.title || "Canary";
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag && to.meta.description) {
    descriptionTag.setAttribute("content", to.meta.description);
  }
});

export default router;
