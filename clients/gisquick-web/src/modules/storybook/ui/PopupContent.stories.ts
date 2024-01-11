import type { Meta, StoryObj } from '@storybook/vue3'

import PopupContent from '@/ui/PopupContent2.vue'

export default {
  title: 'UI Components/PopupContent',
  component: PopupContent,
  parameters: {
    layout: 'centered',
  },
  render: (args) => ({
    components: { PopupContent },
    setup() {
      return { args }
    },
    template: `<div style="width:500px;height:500px;"><scroll-area>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec congue dui nisl, eget porttitor arcu varius nec. Cras elit augue, dictum nec blandit sit amet, laoreet id odio. Aliquam erat volutpat. Cras eget enim justo. Nulla faucibus rhoncus neque sit amet facilisis. Morbi facilisis mauris augue, vitae facilisis massa dapibus fringilla. Sed non tristique sem. Aliquam ullamcorper id nibh id hendrerit. Morbi scelerisque est a arcu facilisis, pellentesque bibendum felis porttitor. Etiam porta euismod interdum. Suspendisse dictum efficitur fermentum. Nam gravida at erat sed aliquam.

    Nulla libero elit, rhoncus non eleifend at, congue quis dui. Ut cursus odio ac pharetra feugiat. Mauris maximus tellus nec ipsum porta, tempor ornare dolor cursus. Ut molestie aliquam purus, eget aliquet lectus efficitur eu. Aliquam a nunc tincidunt, semper mi dapibus, finibus velit. Duis nibh enim, gravida ut neque non, tempus viverra purus. Curabitur molestie eros eget arcu tempor laoreet. Ut vel massa vel massa venenatis posuere. Sed ac aliquam elit. Etiam sit amet leo id sem feugiat imperdiet non eget nibh. Vestibulum a mi pulvinar, imperdiet elit nec, convallis sapien. Quisque tempus mauris eget est volutpat consectetur. Aliquam dapibus ullamcorper ornare. Vivamus elementum in odio vitae lacinia. Integer volutpat dolor ut accumsan condimentum. Proin tincidunt id ipsum non eleifend.
    
    Maecenas viverra purus id sollicitudin finibus. Donec fringilla, leo ac ornare condimentum, dui dui consequat est, non convallis lorem odio et ex. Donec ultricies cursus neque imperdiet vestibulum. Nunc ligula dui, volutpat ut pharetra semper, tincidunt sit amet lorem. Vivamus vel auctor est, at pellentesque ex. Mauris urna ligula, lacinia et efficitur in, tempus congue libero. Morbi odio risus, tempor sit amet tempus et, viverra at mi. Maecenas pharetra, sem ut fringilla tempus, nunc libero elementum est, vel pretium leo risus sit amet ex. Vestibulum volutpat lobortis velit, sit amet ornare sapien dignissim sed. Maecenas commodo, enim non lobortis commodo, ex purus iaculis metus, eu pellentesque urna urna non mi. Donec euismod ipsum non felis luctus interdum. Nam id suscipit metus.
    <PopupContent v-bind="args">Long content inside</PopupContent>
    Nulla aliquam tincidunt est vitae viverra. Nulla placerat semper efficitur. Proin auctor consequat faucibus. Aenean imperdiet venenatis risus, sed dapibus magna mattis id. Nulla ut eros placerat erat ultricies ullamcorper. Aliquam consectetur diam eget pharetra condimentum. Duis eu maximus libero. Sed commodo porttitor urna ut egestas. Donec hendrerit tristique libero, placerat consectetur dolor sodales sit amet.
    Nulla aliquam tincidunt est vitae viverra. Nulla placerat semper efficitur. Proin auctor consequat faucibus. Aenean imperdiet venenatis risus, sed dapibus magna mattis id. Nulla ut eros placerat erat ultricies ullamcorper. Aliquam consectetur diam eget pharetra condimentum. Duis eu maximus libero. Sed commodo porttitor urna ut egestas. Donec hendrerit tristique libero, placerat consectetur dolor sodales sit amet.
    Nulla aliquam tincidunt est vitae viverra. Nulla placerat semper efficitur. Proin auctor consequat faucibus. Aenean imperdiet venenatis risus, sed dapibus magna mattis id. Nulla ut eros placerat erat ultricies ullamcorper. Aliquam consectetur diam eget pharetra condimentum. Duis eu maximus libero. Sed commodo porttitor urna ut egestas. Donec hendrerit tristique libero, placerat consectetur dolor sodales sit amet.
    
    Vestibulum rutrum ullamcorper lectus, a cursus magna vulputate a. Suspendisse aliquet fermentum sapien a elementum. In accumsan sodales nibh, a rutrum dui mollis at. Quisque non ligula porttitor, ultrices risus sed, ultrices eros. Mauris vel lacus ac enim porta congue ac nec massa. Donec iaculis ultricies nunc ac interdum. Suspendisse potenti. Ut elit dui, elementum ac eros eget, rhoncus tristique sapien. Sed pellentesque nibh vitae ipsum fermentum ornare. Phasellus sit amet sem gravida, lacinia dolor quis, gravida ante. Donec rutrum tortor eget ex efficitur posuere non iaculis nulla. Aenean justo metus, pretium ac enim et, commodo gravida lacus. Donec posuere nulla quam, semper aliquam nisi finibus convallis. Cras pellentesque euismod enim, id fringilla turpis consectetur at. Etiam imperdiet orci ac ligula semper scelerisque. Quisque consequat, nibh ac blandit consectetur, lacus justo dignissim lorem, in pretium lectus nunc non lorem.</scroll-area></div>`,
  }),

  args: {
    label: 'Label',
  },
} as Meta

type Story = StoryObj<typeof PopupContent>

export const Primary: Story = {
  args: {
    open: true,
  },
}
