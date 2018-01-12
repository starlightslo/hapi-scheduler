Vue.component('Page', {
    props: ['nowPage', 'maxPage', 'path'],
    template: `
    <div class="btn-group">
        <button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{ nowPage }}
        </button>
        <ul class="dropdown-menu dropdown-scrollable" role="menu">
            <li>
            <router-link class="dropdown-item" v-bind:to="path + '/' + page" v-for="page in maxPage">{{ page }}</router-link>
            </li>
        </ul>
    </div>
    `
});
