import vTooltip from './vTooltip'

export default {
  install(app) {
    app.directive('tooltip', vTooltip)
  },
}
