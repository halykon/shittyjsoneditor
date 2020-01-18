<template>
  <v-app>
    <v-content>
    <v-toolbar dense flat class=titlebar>
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->

      <v-toolbar-title>{{title}}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon class=icon @click="minimize()">
        <v-icon>minimize</v-icon>
      </v-btn>

      <v-btn icon class=icon @click="maximize()">
        <v-icon>tab</v-icon>
      </v-btn>

      <v-btn icon class=icon @click="close()">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
      <Main />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Main from './components/Main.vue'
import { remote } from 'electron'

@Component({
  components: {
    Main
  }
})
export default class App extends Vue {

  title: string = ''

  minimize () {
    const window = remote.BrowserWindow.getFocusedWindow()
    window!.minimize()
  }
  maximize () {
    const window = remote.BrowserWindow.getFocusedWindow()
    window!.maximize()
  }
  close () {
    const window = remote.BrowserWindow.getFocusedWindow()
    window!.close()
    localStorage.clear()
  }

  created () {
    this.title = document.title
  }

}
</script>

<style lang='sass'>
.titlebar
  -webkit-app-region: drag
  -webkit-user-select: none
.icon
  -webkit-app-region: no-drag

::-webkit-scrollbar
  width: 5px
  height: 5px

::-webkit-scrollbar-button
  width: 0px
  height: 0px

::-webkit-scrollbar-thumb
  background: #5e5e5e
  border: 0px none #ffffff
  border-radius: 50px

::-webkit-scrollbar-thumb:hover
  background: #828282

::-webkit-scrollbar-thumb:active
  background: #333333

::-webkit-scrollbar-track
  background: #333333
  border: 0px none #ffffff
  border-radius: 50px

::-webkit-scrollbar-track:hover
  background: #666666

::-webkit-scrollbar-track:active
  background: #666666

::-webkit-scrollbar-corner
  background: transparent
</style>
