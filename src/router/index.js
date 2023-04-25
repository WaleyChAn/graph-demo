import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// const demoRouter = {
//   path: '/',
//   redirect: '/chart_1',
//   name: 'demo',
//   component: () => import('@/views/demo'),
//   children: [
//     {
//       path: '/chart_1',
//       name: 'chart_1',
//       component: () => import('@/views/demo/pages/chart_1')
//     },
//     {
//       path: '/chart_1_n',
//       name: 'chart_1_n',
//       component: () => import('@/views/demo/pages/chart_1_n')
//     },
//     {
//       path: '/chart_2',
//       name: 'chart_2',
//       component: () => import('@/views/demo/pages/chart_2')
//     },
//     {
//       path: '/chart_3',
//       name: 'chart_3',
//       component: () => import('@/views/demo/pages/chart_3')
//     },
//     {
//       path: '/chart_4',
//       name: 'chart_4',
//       component: () => import('@/views/demo/pages/chart_4')
//     },
//     {
//       path: '/chart_5',
//       name: 'chart_5',
//       component: () => import('@/views/demo/pages/chart_5')
//     },
//     {
//       path: '/chart_6',
//       name: 'chart_6',
//       component: () => import('@/views/demo/pages/chart_6')
//     },
//     {
//       path: '/chart_7',
//       name: 'chart_7',
//       component: () => import('@/views/demo/pages/chart_7')
//     }
//   ]
// }

// const mapRouter = {
//   path: '/',
//   redirect: '/map/company',
//   name: 'map',
//   component: () => import('@/views/map/index'),
//   children: [
//     {
//       path: '/map/company',
//       name: 'company',
//       component: () => import('@/views/map/components/company')
//     },
//     {
//       path: '/map/dept',
//       name: 'dept',
//       component: () => import('@/views/map/components/dept')
//     },
//     {
//       path: '/map/project',
//       name: 'project',
//       component: () => import('@/views/map/components/project')
//     }
//   ]
// }

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/map/company',
      name: 'map',
      component: () => import('@/views/map'),
      children: [
        {
          path: '/map/company',
          name: 'company',
          component: () => import('@/views/map/components/company')
        },
        {
          path: '/map/dept',
          name: 'dept',
          component: () => import('@/views/map/components/dept')
        },
        {
          path: '/map/project',
          name: 'project',
          component: () => import('@/views/map/components/project')
        }
      ]
    }
  ]
})
