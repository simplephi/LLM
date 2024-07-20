import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'


Vue.use(VueRouter);


function loggedInRedirectDashboard(to, from, next) {
  if (localStorage.token) {
    next('/');
  } else {
    next();
  }
}

function isLoggedIn(to, from, next) {
  if (localStorage.token) {
    next();
  } else {
    next('/login');
  }
}


const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/login.vue'),
    beforeEnter: loggedInRedirectDashboard,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: isLoggedIn,
  },

  


]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
})

export default router
