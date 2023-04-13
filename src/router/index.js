import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/chart_1',
      name: 'demo',
      component: () => import('@/views/demo'),
      children: [
        {
          path: '/chart_1',
          name: 'chart_1',
          component: () => import('@/views/demo/pages/chart_1')
        },
        {
          path: '/chart_2',
          name: 'chart_2',
          component: () => import('@/views/demo/pages/chart_2')
        },
        {
          path: '/chart_3',
          name: 'chart_3',
          component: () => import('@/views/demo/pages/chart_3')
        },
        {
          path: '/chart_4',
          name: 'chart_4',
          component: () => import('@/views/demo/pages/chart_4')
        },
        {
          path: '/chart_5',
          name: 'chart_5',
          component: () => import('@/views/demo/pages/chart_5')
        },
        {
          path: '/chart_6',
          name: 'chart_6',
          component: () => import('@/views/demo/pages/chart_6')
        },
        {
          path: '/chart_7',
          name: 'chart_7',
          component: () => import('@/views/demo/pages/chart_7')
        }
      ]
    }
  ]
})
