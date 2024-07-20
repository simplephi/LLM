import Vue from 'vue'
import Vuex from 'vuex'

var URL = 'http://localhost:3000/';
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    
    url : {
      URL_APP : URL,

    },
    
  },
  mutations: {

    getStorage(state){
      var get_profile = JSON.parse(localStorage.profile);
    },
  
  },
  actions: {
  },
  modules: {
  }
})
