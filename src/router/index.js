import { createRouter, createWebHistory } from 'vue-router'

// 路由组件
const Dashboard = () => import('@/views/Dashboard.vue')
const StrategyList = () => import('@/views/StrategyList.vue')
const StrategyDetail = () => import('@/views/StrategyDetail.vue')
const UserAudit = () => import('@/views/UserAudit.vue')
const ModelWhitelist = () => import('@/views/ModelWhitelist.vue')
const StarCheckPermissions = () => import('@/views/StarCheckPermissions.vue')
const QuotaCheckPermissions = () => import('@/views/QuotaCheckPermissions.vue')
const Settings = () => import('@/views/Settings.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard' }
  },
  {
    path: '/strategies',
    name: 'StrategyList',
    component: StrategyList,
    meta: { title: 'Strategy Management' }
  },
  {
    path: '/strategies/:id',
    name: 'StrategyDetail',
    component: StrategyDetail,
    meta: { title: 'Strategy Detail' }
  },
  {
    path: '/model-permissions',
    name: 'ModelWhitelist',
    component: ModelWhitelist,
    meta: { title: 'Model Whitelist' }
  },
  {
    path: '/star-check-permissions',
    name: 'StarCheckPermissions',
    component: StarCheckPermissions,
    meta: { title: 'Star Check Permissions' }
  },
  {
    path: '/quota-check-permissions',
    name: 'QuotaCheckPermissions',
    component: QuotaCheckPermissions,
    meta: { title: 'Quota Check Permissions' }
  },
  {
    path: '/user-audit',
    name: 'UserAudit',
    component: UserAudit,
    meta: { title: 'User Audit' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: 'Settings' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Quota Manager`
  }
  next()
})

export default router