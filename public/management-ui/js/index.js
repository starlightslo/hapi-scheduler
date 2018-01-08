const routes = [
    { path: '/', component: JobsComponent },
    { path: '/jobs', component: JobsComponent },
    { path: '/logs', component: LogsComponent }
];

const router = new VueRouter({
    routes
});

const app = new Vue({
    router,
    data() {
        return {
            name: '',
            timezone: 0,
            cronTime: '* * * * *',
            method: 'GET',
            url: '',
            header: '',
            body: '',
            timezones: []
        }
    },
    created: function () {
        // Init data
        for (let i = -8; i <= 8; i++) {
            this.$data.timezones.push(i);
        }
        this.$data.timezone = 0;
    },
    methods: {
        createJob() {
            let data = {
                name: this.$data.name,
                cronTime: this.$data.cronTime,
                requestURL: this.$data.url,
                requestMethod: this.$data.method,
                requestBody: this.$data.body,
                requestHeader: this.$data.header,
                timeZone: this.$data.timezone
            };
            this.$http.post(managementPath + '/api/schedule', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                console.log(response);
            });
        },
        changeMethod(method) {
            this.$data.method = method;
        },
        changeTimezone(timezone) {
            this.$data.timezone = timezone;
        }
    }
}).$mount('#app');
