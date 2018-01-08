const LogsComponent = Vue.component('Logs', {
    template: '#logs',
    data() {
        return {
            logs: []
        }
    },
    created: function () {
        this.getLogs();
    },
    methods: {
        getLogs() {
            this.$http.get(managementPath + '/api/log').then((response) => {
                if (response.status === 200) {
                    this.$data.logs = response.body;
                    console.log(this.$data.logs)
                } else {
                    console.error(response);
                }
            });
        },
    }
});

Vue.component('logs-list', {
    props: ['log', 'index'],
    template: `
    <tr>
        <td>{{ index }}</td>
        <td>{{ log.name }}</td>
        <td>{{ log.success }}</td>
        <td>{{ log.result }}</td>
        <td>{{ moment.unix(log.timestamp).format('YYYY/MM/DD HH:mm:ss') }}</td>
    </tr>
    `
})
