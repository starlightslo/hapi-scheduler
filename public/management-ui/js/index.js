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
        async createJob() {
            let data = {
                name: this.$data.name,
                cronTime: this.$data.cronTime,
                requestURL: this.$data.url,
                requestMethod: this.$data.method,
                requestBody: this.$data.body,
                requestHeader: this.$data.header,
                timezone: this.$data.timezone
            };
            const response = await this.$http.post(managementPath + '/api/job', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status !== 200) {
                console.error(response);
                return;
            }

            console.log(response.body);
        },
        changeMethod(method) {
            this.$data.method = method;
        },
        changeTimezone(timezone) {
            this.$data.timezone = timezone;
        }
    }
}).$mount('#app');
