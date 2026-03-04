import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#2dd4bf',
        secondary: '#1a2f3f',
        accent: '#5eead4',
        error: '#ff9f8f',
        info: '#64ffda',
        success: '#40c4aa',
        warning: '#ffb86b',
        background: '#0b1a2e',
        surface: '#121e29',
      },
    },
    options: {
      customProperties: true,
    },
  },
});
