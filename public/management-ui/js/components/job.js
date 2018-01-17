const JobsComponent = Vue.component('Jobs', {
    template: '#jobs',
    data() {
        return {
            
        }
    },
    created: function () {
        // Getting data
        this.$store.dispatch('getJobs', this.$route.params.page);
    },
    methods: {
        
    }
});

Vue.component('jobs-list', {
    props: ['job', 'index'],
    data: function() {
        return {
            _modalKeyStr: 'confirmModal'
        };
    },
    template: `
    <tr>
        <td>{{ job.name }}</td>
        <td>{{ job.cronTime }}</td>
        <td>{{ job.requestMethod }} {{ job.requestURL }}</td>
        <td>{{ job.timezone }}</td>
        <td>{{ job.running }}</td>
        <td>
            <button type="button" class="btn btn-outline-danger" data-toggle="modal" @click="showModal(job.id)">Delete</button>
            <DeleteConfirmModal v-bind:modalKey="getKey(job.id)" v-bind:jobName="job.name" v-bind:jobId="job.id"></DeleteConfirmModal>
        </td>
    </tr>
    `,
    methods: {
        getKey(jobId) {
            return this.$data._modalKeyStr + jobId;
        },
        showModal(jobId) {
            $('#' + this.$data._modalKeyStr + jobId).modal('show');
        }
    }
});

Vue.component('DeleteConfirmModal', {
    props: ['jobName', 'jobId', 'modalKey'],
    template: `
    <div class="modal fade" tabindex="-1" role="dialog" v-bind:id="modalKey">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Delete <span class="text-danger">{{ jobName }}</span>
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p>Are you sure want to delete <span class="text-danger">{{ jobName }}</span> job?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="deleteJob(jobId)">Delete</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            </div>
            </div>
        </div>
    </div>
    `,
    methods: {
        async deleteJob(jobId) {
            const success = await this.$store.dispatch('deleteJob', jobId);

            // Close modal
            this.closeNewJobModal();

            // Refresh data
            await this.$store.dispatch('getJobs', this.$route.params.page);
        },
        closeNewJobModal() {
            $('#' + this.modalKey).modal('hide');
        }
    }
})

Vue.component('JobModal', {
    props: ['title'],
    template: `
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{{ title }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form>
                    <div class="form-group row">
                        <label for="staticEmail" class="col-sm-2 col-form-label">Name</label>
                        <div class="col-sm-10">
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" v-model="name">
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="staticEmail" class="col-sm-2 col-form-label">Cron Time</label>
                        <div class="col-sm-10">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ timezone }}</button>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#" v-for="timezone in timezones" @click="changeTimezone(timezone)">{{ timezone }}</a>
                                    </div>
                                </div>
                                <input type="text" class="form-control" placeholder="* * * * *" v-model="cronTime">
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="staticEmail" class="col-sm-2 col-form-label">Request URL</label>
                        <div class="col-sm-10">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ method }}</button>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#" @click="changeMethod('GET')">GET</a>
                                        <a class="dropdown-item" href="#" @click="changeMethod('POST')">POST</a>
                                        <a class="dropdown-item" href="#" @click="changeMethod('PUT')">PUT</a>
                                        <a class="dropdown-item" href="#" @click="changeMethod('DELETE')">DELETE</a>
                                    </div>
                                </div>
                                <input type="text" class="form-control" placeholder="http://xxx.xxx.xxx" v-model="url">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="exampleFormControlTextarea1">Request Header</label>
                        <textarea class="form-control" id="" rows="3" v-model="header"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="exampleFormControlTextarea1">Request Body</label>
                        <textarea class="form-control" id="" rows="3" v-model="body"></textarea>
                    </div>
                    <div class="form-group" v-if="$store.state.errorMessage.length > 0">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error:</strong> {{ $store.state.errorMessage }}
                            <button type="button" class="close" @click="closeErrorMessage">
                                <span>&times;</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="createJob">Create</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            name: '',
            timezone: 0,
            cronTime: '* * * * * *',
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
            const data = {
                name: this.$data.name,
                cronTime: this.$data.cronTime,
                requestURL: this.$data.url,
                requestMethod: this.$data.method,
                requestBody: this.$data.body,
                requestHeader: this.$data.header,
                timezone: this.$data.timezone
            };
            const success = await this.$store.dispatch('createJob', data);
            if (!success) {
                return;
            }

            // Close modal
            this.closeNewJobModal();

            // Refresh data
            await this.$store.dispatch('getJobs', this.$route.params.page);
        },
        changeMethod(method) {
            this.$data.method = method;
        },
        changeTimezone(timezone) {
            this.$data.timezone = timezone;
        },
        closeNewJobModal() {
            $(this.$parent.$refs.newJobModal).modal('hide');
        },
        closeErrorMessage() {
            this.$store.dispatch('clearErrorMessage');
        }
    }
})