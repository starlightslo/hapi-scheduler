Vue.config.devtools = true
const routes = [
    { path: '/', redirect: '/job/1' },
    { path: '/job', redirect: '/job/1' },
    { path: '/job/:page', component: JobsComponent },
    { path: '/log', redirect: '/log/1' },
    { path: '/log/:page', component: LogsComponent }
];

const router = new VueRouter({
    routes
});

const app = new Vue({
    router,
    store,
    data() {
        return {
            
        }
    },
    created: function () {
        
    },
    methods: {
        
    },
    events: {
        
    }
}).$mount('#app');
