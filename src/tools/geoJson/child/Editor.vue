<script setup lang="ts">
import type { EditorValue } from '@/types/editor'
import VanillaJsonEditor from '@/components/VanillaJsonEditor.vue'
import $eventBus from '@/plugins/EventBus'
import { debounce } from 'lodash-es'

const editor = useComponentRef(VanillaJsonEditor)
let geoJson: any = {
  type: 'FeatureCollection',
  features: [],
}

const updateEditorDebounce = debounce(updateEditor, 500)

onMounted(() => {
  $eventBus.on('updateEditor', updateEditorDebounce)
})

onBeforeUnmount(() => {
  $eventBus.off('updateEditor', updateEditorDebounce)
})

const onChangeDebounce = debounce(onChange, 500)

function onChange(val: EditorValue) {
  try {
    if (typeof val === 'string') {
      geoJson = JSON.parse(val)
    }
    else {
      geoJson = val
    }
    $eventBus.emit('updateGeojsonLayer', geoJson)
  }
  catch (e) {}
}

function updateEditor(val: EditorValue) {
  editor.value?.update(val)
}
</script>

<template>
  <VanillaJsonEditor
    ref="editor"
    class="edit-data-json"
    :config="{
      mode: 'text',
    }"
    :content="geoJson"
    @change="onChangeDebounce"
  />
</template>

<style scoped lang="scss">
.geoJsonContainer {
  height: 100%;
}
</style>
