import lottery from '../vue/lottery.vue';
import '/node_modules/bulma/css/bulma.min.css';

document.addEventListener('DOMContentLoaded', function () {
  const app = new lottery();
  app.$mount('#app')
});
