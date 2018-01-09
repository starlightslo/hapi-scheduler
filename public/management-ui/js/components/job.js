const JobsComponent = Vue.component('Jobs', {
    template: '#jobs',
    data() {
        return {
            jobs: [],
            maxPage: 1,
        }
    },
    created: function () {
        this.getJobs(this.$route.params.page);
    },
    methods: {
        async getJobs(page) {
            let response = await this.$http.get(managementPath + '/api/job-size');
            if (response.status !== 200) {
                console.error(response);
                return;
            }

            this.$data.maxPage = response.body;
            page = (page > this.$data.maxPage) ? this.$data.maxPage : page;
            response = await this.$http.get(managementPath + '/api/job?page=' + page);
            if (response.status !== 200) {
                console.error(response);
                return;
            }

            this.$data.jobs = response.body;
        },
    }
});

Vue.component('jobs-list', {
    props: ['job', 'index'],
    template: `
    <tr>
        <td>{{ job.name }}</td>
        <td>{{ job.cronTime }}</td>
        <td>{{ job.requestMethod }} {{ job.requestURL }}</td>
        <td>{{ job.timezone }}</td>
        <td>{{ job.running }}</td>
    </tr>
    `
})