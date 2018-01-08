const JobsComponent = Vue.component('Jobs', {
    template: '#jobs',
    data() {
        return {
            jobs: []
        }
    },
    created: function () {
        this.getJobs();
    },
    methods: {
        getJobs() {
            this.$http.get(managementPath + '/api/schedule').then((response) => {
                if (response.status === 200) {
                    this.$data.jobs = response.body;
                } else {
                    console.error(response);
                }
            });
        },
    }
});

Vue.component('jobs-list', {
    props: ['job', 'index'],
    template: `
    <tr>
        <td>{{ index }}</td>
        <td>{{ job.name }}</td>
        <td>{{ job.cronTime }}</td>
        <td>{{ job.requestMethod }} {{ job.requestURL }}</td>
        <td>{{ job.timezone }}</td>
        <td>{{ job.running }}</td>
    </tr>
    `
})