const store = new Vuex.Store({
    strict: true,
    state: {
        loading: true,
        errorMessage: '',
        maxPage: 1,
        jobs: [],
        logs: [],
        page: 999
    },
    mutations: {
        loading: (state, loading) => state.loading = loading,
        errorMessage: (state, message) => state.errorMessage = message,
        maxPage: (state, page) => state.maxPage = page,
        jobs: (state, jobs) => state.jobs = jobs,
        logs: (state, logs) => state.logs = logs,
        page: (state, page) => state.page = page
    },
    actions: {
        showLoading({ commit }) {
            commit('loading', true);
        },
        closeLoading({ commit }) {
            commit('loading', false);
        },
        setErrorMessage({ commit }, message) {
            commit('errorMessage', message);
        },
        async getJobs({ commit }, page) {
            commit('loading', true);
            let response = await Vue.http.get(managementPath + '/api/job-size');
            if (response.status !== 200) {
                commit('errorMessage', response);
                commit('loading', false);
                return;
            }

            const maxPage = response.body;
            commit('maxPage', maxPage);
            page = (page > maxPage) ? maxPage : page;
            response = await Vue.http.get(managementPath + '/api/job?page=' + page);
            if (response.status !== 200) {
                commit('errorMessage', response);
                commit('loading', false);
                return;
            }

            commit('jobs', response.body);
            commit('loading', false);
        },
        async getLogs({ commit }, page) {
            commit('loading', true);
            let response = await Vue.http.get(managementPath + '/api/log-size');
            if (response.status !== 200) {
                commit('errorMessage', response);
                commit('loading', false);
                return;
            }
            
            const maxPage = response.body;
            commit('maxPage', maxPage);
            page = (page > maxPage) ? maxPage : page;
            response = await Vue.http.get(managementPath + '/api/log?page=' + page);
            if (response.status !== 200) {
                commit('errorMessage', response);
                commit('loading', false);
                return;
            }

            commit('logs', response.body);
            commit('loading', false);
        },
        async createJob({ commit }, data) {
            commit('loading', true);
            const response = await Vue.http.post(managementPath + '/api/job', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status !== 200) {
                commit('errorMessage', response);
                commit('loading', false);
                return;
            }

            commit('loading', false);
        }
    }
});
