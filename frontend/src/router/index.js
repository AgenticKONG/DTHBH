import { createRouter, createWebHistory } from 'vue-router';

// 修正路径引用（使用相对路径）
import HomePage from '../views/HomePage.vue'; // 确保文件名为HomePage.vue
import WorkGallery from '../views/WorkGallery.vue';
import TimelinePage from '../views/TimelinePage.vue';

// 组件使用相对路径（避免@别名问题）
import ThreeDExhibition from '../views/ThreeDExhibition.vue';
import ThreeDExhibitionNew from '../views/ThreeDExhibitionNew.vue';
import FriendsNetwork from '../views/FriendsNetwork.vue';
import WorkDetail from '../views/WorkDetail.vue';
import MapPage from '../views/MapPage.vue';

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/3d-exhibition',
    name: 'ThreeDExhibition',
    component: ThreeDExhibition
  },
  {
    path: '/3d-exhibition-new',
    name: 'ThreeDExhibitionNew',
    component: ThreeDExhibitionNew
  },
  {
    path: '/friends-network',
    name: 'FriendsNetwork',
    component: FriendsNetwork
  },
  {
    path: '/work',
    name: 'WorkDetail',
    component: WorkDetail
  },
  {
    path: '/gallery',
    name: 'WorkGallery',
    component: WorkGallery
  },
  {
    path: '/art-footprints',
    name: 'TimelinePage',
    component: TimelinePage
  },
  {
    path: '/map',
    name: 'MapPage',
    component: MapPage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
