import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "convert",
      component: () => import("./pages/ConvertPage.vue"),
    },
    {
      path: "/split",
      name: "split",
      component: () => import("./pages/SplitPage.vue"),
    },
  ],
});

export default router;
