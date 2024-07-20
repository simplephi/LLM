<template>
  <div id="particles-js" :class="$q.dark.isActive ? 'dark_gradient' : 'normal_gradient'">
    <div class="row items-center loginku">
      <div class="col-11 col-md-3 fixed-center">
       

        <div class="putihTrans formLogin shadow-5">
          <br>
          <center><q-img src="img/logo.png" style="height: 150px;"/></center>
            <hr />
            

            <div v-if="errorMessage">
              <div  class="alertku shadow-2">
                <strong>Warning!</strong> {{ errorMessage }}.

              </div>
              <br>
            </div>
            <div class="row items-center">
              <div class="col text-h6 ellipsis">
                <center>Log in to Dashboard</center>
              </div>
            </div>
            <br/>
            <form @submit.prevent="btn_login()">
              <q-input v-model="user.username" outlined square :dense="true" class="bg-white" placeholder="Username">
                <template v-slot:prepend>
                  <q-icon name="account_circle" />
                </template>
              </q-input>
              <br />

              <q-input
                 v-model="user.password"
                outlined
                square
                :dense="true"
                class="bg-white"
                placeholder="Password"
                type="password"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
              </q-input>
              <br />

              <q-btn type="submit" push class="full-width" color="primary" icon-right="send" label="LOGIN" />
            </form>
           
        </div>
      </div>
    </div>
  </div>
</template>




<script>
  import Joi from "joi";
  const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
    password: Joi.string().min(6).required(),
  });

  export default {
    data : function(){
      return {

          errorMessage: '',
          user : {
            username : "",
            password : ""
          },

          url : {
            LOGIN_URL : "http://localhost:3000/auth/login",

          }
      }
    },
    watch: {
      user: {
          handler() {
              this.errorMessage = "";
          },
          deep: true
      }
    },
    methods: {
      btn_login : function(){

        

        this.errorMessage = '';
        if(this.validUser()){
          this.$store.commit("shoWLoading");
          const body = {
            username : this.user.username,
            password : this.user.password
          }
          fetch(this.url.LOGIN_URL, {
            method : 'POST',
            headers : {
              'content-type' : 'application/json',
            },
            body : JSON.stringify(body),
          }).then((response) => {
            
            console.log(response);
            
                if (response.ok) {
                    return response.json();
                    this.$store.commit("shoWLoading");
                }

                return response.json().then(error => {
                    throw new Error(error.message);
                    this.$store.commit("shoWLoading");
                });
            })
            .then((result) => {
              console.log("=============================");
              console.log(result);
              // menyimpan token yang tergenerate dari server
              localStorage.token = result.token;
              setTimeout(() => {
                this.$store.commit("hideLoading")
                this.$router.push('/');
                // location.reload();
              }, 1000);
            })
            .catch(error => {
              setTimeout(() => {
                this.$store.commit("hideLoading")
                this.errorMessage = error.message;
              }, 1000);
            });;
        }



      },

      
      validUser: function(){
        const result = Joi.validate(this.user, schema);
        if (result.error === null) {
          return true;
        }
        if (result.error.message.includes("username")) {
          this.errorMessage = "Username tidak valid";
        } else {
          this.errorMessage = "Username tidak valid2";
        }
        return false;
      },
    },
    mounted : function(){

      
      

    },
  };
</script>


<style>

.loginku {
  

  width:100%;
  height: 100%;
  background-image: url("../../../public/img/background.jpg");
 
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;


}

#particles-js {

  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
}
.normal_gradient {
  background: linear-gradient(145deg, rgb(74, 94, 137) 15%, #b61924 70%);
}
.dark_gradient {
  background: linear-gradient(145deg, rgb(11, 26, 61) 15%, #4c1014 70%);
}
.login-form {
  position: absolute;
}
</style>