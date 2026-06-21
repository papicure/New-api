import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import CardGrid from './components/CardGrid.vue'
import FeatureCard from './components/FeatureCard.vue'
import PageBadge from './components/PageBadge.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PageBadge', PageBadge)
    app.component('CardGrid', CardGrid)
    app.component('FeatureCard', FeatureCard)
  },
} satisfies Theme
