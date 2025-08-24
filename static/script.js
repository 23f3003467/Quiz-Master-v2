import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Navbar from './components/Navbar.js'
import Footer from './components/Footer.js'
// import Dashboard from './components/Dashboard.js'
import admindashboard from './pages/admindashboard.js'
import userdashboard from './pages/userdashboard.js'

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/user', component: userdashboard},
    {path: '/admin', component: admindashboard},
]


const router = new VueRouter({
    routes // routes: routes
})


router.beforeEach((to, from, next) => {
const auth = localStorage.getItem('auth_token');
if ((to.path === '/admin' && !auth) || (to.path === '/user' && !auth)) {
    next('/login'); // redirect to login if not authenticated
} else {
    next(); // allow
}
});
  

const app = new Vue({
    el: "#app",
    router, // router: router
    template: `
    <div class="container">
        <nav-bar :loggedIn = 'loggedIn' @logout="handleLogout"></nav-bar>
        <router-view :loggedIn = 'loggedIn' @login="handleLogin"></router-view>
        <foot></foot>
    </div>
    `,
    data: {
        loggedIn: false
    },
    components:{
        "nav-bar": Navbar,
        "foot": Footer
    },
    mounted(){
        if(localStorage.getItem('auth_token')){
            this.loggedIn=true
            const role=localStorage.getItem('roles')
            console.log(role)
            if(role === 'admin'){
                this.$router.push('/admin')
            }else{
                this.$router.push('/user') // redirect('/dashboard') in flask
            }
        }
    },
    methods:{
        handleLogout(){
            this.loggedIn = false
        },
        handleLogin(){
            this.loggedIn = true
        }
    }
}) 