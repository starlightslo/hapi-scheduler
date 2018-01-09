const LogsComponent = Vue.component('Logs', {
    template: '#logs',
    data() {
        return {
            logs: [],
            maxPage: 1
        }
    },
    created: function () {
        this.getLogs(this.$route.params.page);
    },
    methods: {
        async getLogs(page) {
            let response = await this.$http.get(managementPath + '/api/logsize');
            if (response.status !== 200) {
                console.error(response);
                return;
            }
                
            this.$data.maxPage = response.body;
            page = (page > this.$data.maxPage) ? this.$data.maxPage : page;
            response = await this.$http.get(managementPath + '/api/log?page=' + page);
            if (response.status !== 200) {
                console.error(response);
                return;
            }

            this.$data.logs = response.body;
        },
    }
});

Vue.component('logs-list', {
    props: ['log', 'index'],
    template: `
    <tr>
        <td>{{ moment.unix(log.timestamp).format('YYYY/MM/DD HH:mm:ss') }}</td>
        <td>{{ log.name }}</td>
        <td>{{ log.success }}</td>
        <td>{{ log.result }}</td>
    </tr>
    `
})
