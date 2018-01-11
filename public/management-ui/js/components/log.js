const LogsComponent = Vue.component('Logs', {
    template: '#logs',
    data() {
        return {
            logs: [],
            maxPage: 1
        }
    },
    created: function () {
        this.getLogs();
    },
    methods: {
        async getLogs() {
            this.$store.dispatch('getLogs', this.$route.params.page);
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
