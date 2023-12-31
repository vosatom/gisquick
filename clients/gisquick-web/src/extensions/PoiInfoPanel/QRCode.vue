<template>
  <img :src="qrcode" />
</template>

<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
const props = defineProps<{ content: string }>()

const qrcode = useQRCode(() => props.content)
</script>
