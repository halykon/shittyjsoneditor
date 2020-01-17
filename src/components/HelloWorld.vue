<template>
  <v-container>
    <v-btn color="success" @click="openDiag()">Hello</v-btn>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { remote } from 'electron'
import { readFile } from 'fs'
import { promisify } from 'util'
const readFileAsync = promisify(readFile)

@Component
export default class HelloWorld extends Vue {
  json = null

  async openDiag () {
    const selectedFile = await remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON-Datei', extensions: ['json'] }
      ]
    })

    if (selectedFile.filePaths) {
      const file = await readFileAsync(selectedFile.filePaths[0], { encoding: 'utf-8' })
      this.json = JSON.parse(file)
    }
  }
}
</script>
