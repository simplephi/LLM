<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header_normal"  v-if="!checkLogin">
      <q-toolbar>
        
        <q-toolbar-title>
            Large Language Model
        </q-toolbar-title>
        <div>
       

            <q-btn
            style="color:white"
            label="Logout"
            @click="logout"

            />

        </div>
      </q-toolbar>
    </q-header>

   

    <q-page-container>
      <router-view/>
    </q-page-container>

    
  </q-layout>
</template>

<script>



export default {
  name: 'LayoutDefault',

  

  data () {
    return {
      leftDrawerOpen: false,
      text:'',
      dense : true,
    }
  },
  methods: {
    logout : function(){
        localStorage.removeItem('token');
        localStorage.removeItem('profile');
        this.$router.push('/login');
    },
  },
  computed: {
      checkLogin() {
          if (this.$route.name === 'login') {
              return true;
          } else {
              return false;
          }
      }
  },
}
</script>

<style>
.header_normal {
    background: linear-gradient(145deg,#206a50 15%,#153966 70%);
}
</style>
