import './assets/main.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Material from '@primeuix/themes/material'
import Nora from '@primeuix/themes/nora'
import ToastService from 'primevue/toastservice';

import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';
import FileUpload from 'primevue/fileupload';
import Card from 'primevue/card';

// import 'primevue/resources/primevue.min.css'; // Core styling
import Lara from '@primeuix/themes/lara'
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // PrimeFlex for layout utilities


import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Material,
        options: {
            prefix: 'p',
            darkModeSelector: 'system'
        },
        // Custom theme overrides
        semantic: {
            colorScheme: {
                light: {
                    surface: {
                        0: '#ffffff',
                        50: '#f8fafc',
                        100: '#f1f5f9',
                        200: '#e2e8f0',
                        300: '#cbd5e1',
                        400: '#94a3b8',
                        500: '#64748b',
                        600: '#475569',
                        700: '#334155',
                        800: '#1e293b',
                        900: '#0f172a',
                        950: '#020617'
                    },
                    primary: {
                        color: '#3b82f6',
                        contrastColor: '#ffffff'
                    }
                },
                dark: {
                    surface: {
                        0: '#0f172a',
                        50: '#1e293b',
                        100: '#334155',
                        200: '#475569',
                        300: '#64748b',
                        400: '#94a3b8',
                        500: '#cbd5e1',
                        600: '#e2e8f0',
                        700: '#f1f5f9',
                        800: '#f8fafc',
                        900: '#ffffff',
                        950: '#ffffff'
                    },
                    primary: {
                        color: '#60a5fa',
                        contrastColor: '#1e293b'
                    }
                }
            }
        }
    }
})

app.use(ToastService)
// Register PrimeVue components
app.component('Button', Button);
app.component('Card', Card);
app.component('FileUpload', FileUpload);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Divider', Divider);
app.component('Toast', Toast);

app.mount('#app')
