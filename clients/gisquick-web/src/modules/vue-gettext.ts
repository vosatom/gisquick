import { translate } from 'vue-gettext'

const instance = {
  $gettext: translate.gettext,
  $ngettext: translate.ngettext,
  $gettextInterpolate: translate.gettextInterpolate,
  $pgettext: translate.pgettext,
  $npgettext: translate.npgettext,
}

export function useGettext() {
  return instance;
}
