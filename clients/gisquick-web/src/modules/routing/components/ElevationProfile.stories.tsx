import type { Meta, StoryObj } from '@storybook/vue3'

import ElevationProfileComponent from './ElevationProfile.vue'

import Preview from '@/modules/storybook/Preview.vue'

export default {
  title: 'modules/services/Elevation Profile',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

type Story = StoryObj<typeof Preview>

export const ElevationProfile: Story = {
  render: (args) => ({
    components: { Preview, ElevationProfileComponent },
    setup() {
      return { args }
    },
    template: `<div style="width:400px;"><ElevationProfileComponent v-bind="args"/></div>`,
  }),

  args: {
    distances: [
      0, 86.91746533220935, 98.48543041420318, 105.09419478611466,
      287.87302501990825, 327.31698447306013, 349.61518432572046,
      369.35756578894524, 391.3035884085187, 425.66549838018204,
      451.13127396971964, 512.8239965654872, 592.9130358919019,
      660.9815590721535, 730.4443104221627, 752.7426417124519,
      770.5073246774858, 861.5239147052071, 1047.8242456717412,
      1058.1074048339483, 1288.921006581044, 1335.9701771777884,
      1383.805333728492, 1493.1120918624033, 1583.320276619234,
      1614.7421237192198, 1657.737904459073, 1703.4710148670747,
      1726.5109641024883, 1775.64574950263, 1829.7350768272568,
      1922.2820819105937, 1972.168959675233, 2022.950241736851,
      2093.6361703525836,
    ],
    elevations: [
      256.5, 247, 247, 247, 266, 263, 263, 263, 270, 270, 277, 284, 284, 271,
      270, 270, 270, 277, 296, 296, 302, 302, 302, 299, 294, 288, 288, 281, 281,
      281, 274, 287, 284, 297, 293,
    ],
  },
}
