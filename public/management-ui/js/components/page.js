Vue.component('Page', {
    props: ['nowPage', 'maxPage', 'path'],
    template: `
    <div class="btn-group">
        <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{ nowPage }}
        </button>
        <div class="dropdown-menu">
            <router-link class="dropdown-item" v-bind:to="path + '/' + page" v-for="page in maxPage">{{ page }}</router-link>
        </div>
    </div>
    `
});
