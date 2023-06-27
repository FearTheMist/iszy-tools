import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
  RouterOptions
} from 'vue-router'
import tools from '@/views/tools.json'
import { merge } from 'lodash-es'
import { useUserStore } from '@/stores/user'
import type { DefineComponent } from 'vue'
import type { ToolMenu } from '@/env'

const vueFiles = import.meta.glob('../views/**/*.vue') as Record<string, () => Promise<DefineComponent>>

const modules: Record<string, {
  path: string,
  component: () => Promise<DefineComponent> | DefineComponent
}> = {}

for (const key in vueFiles) {
  if (!key.includes('/child/')) {
    let tmpKey = key.slice(8, -4)
    let path = '/'
    if (tmpKey.endsWith('index')) {
      tmpKey = tmpKey.slice(0, -6)
    }
    if (tmpKey) {
      const tmp1 = tmpKey.split('/')
      path += tmp1[tmp1.length - 1]
    }
    modules[path] = { path, component: vueFiles[key] }
  }
}

let routes: RouteRecordRaw[] = []

const data: ToolMenu[] = [...tools, {
  children: [
    {
      name: '首页',
      link: '/',
      type: 'internal'
    },
    {
      name: '403',
      link: '/403',
      type: 'internal'
    },
    {
      name: '404',
      link: '/404',
      type: 'internal'
    },
    {
      name: '登录',
      link: '/login',
      type: 'internal'
    },
    {
      name: '重定向',
      link: '/redirect',
      type: 'internal'
    }
  ]
}]

// 加入所有工具路由
for (const tmp of data) {
  if (Array.isArray(tmp.children) && tmp.children.length > 0) {
    for (const tool of tmp.children) {
      if (!/^(http(s)?:\/\/)\w+\S+(\.\S+)+$/.test(tool.link)) {
        const path = (tmp.link || '') + (tool.link || '')
        if (modules[path]) {
          if (tool.type !== 'internal') {
            modules[path] = merge(modules[path], {
              name: tool.name,
              meta: {
                statistics: tool.statistics !== false,
                layout: tool.layout,
                type: 'tool',
                requiresAuth: tool.requiresAuth
              }
            })
          } else {
            modules[path] = merge(modules[path], {
              name: tool.name
            })
          }
          routes.push(modules[path])
        }
      }
    }
  }
}

// 加入固定页面路由
routes = routes.concat([
  {
    path: '/logout',
    name: '登出',
    beforeEnter (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
      if (navigator.onLine) {
        useUserStore().logout().then(() => {
          next(from.fullPath)
        })
      } else {
        next(from.fullPath)
      }
    }
  },
  {
    path: '/:any(.*)/:catchAll(.*)',
    name: 'redirect',
    beforeEnter (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
      if (to?.params?.catchAll) {
        next(to.params.catchAll as string)
      } else {
        next('/404')
      }
    }
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/404'
  }
] as RouteRecordRaw[])

const options: RouterOptions = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
}

const router = createRouter(options)

// 路由白名单
const whiteList = ['/login', '/logout']

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // 权限控制
  const isLogged = await useUserStore().checkToken()
  if (isLogged || whiteList.indexOf(to.path) !== -1 || !to.meta.requiresAuth) {
    document.title = getPageTitle(to.meta.title || to.name?.toString())
    if (to.name && to.meta.statistics) {
      let name:string
      if (typeof to.name === 'string') {
        name = to.name
      } else {
        name = to.name.toString()
      }
      useUserStore().access({ name, link: to.path })
    }
    next()
  } else {
    // other pages that do not have permission to access are redirected to the login page.
    next(`/login?redirect=${to.path}`)
  }
})

function getPageTitle (pageTitle: string | undefined | null) {
  if (pageTitle && pageTitle !== 'ISZY工具集合') {
    return `${pageTitle} - ISZY工具集合`
  }
  return 'ISZY工具集合'
}

export default router
