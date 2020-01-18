<template>
  <v-container fluid>
  <v-snackbar absolute top right multi-line :color="info.type" :value="info.text" :timeout="2000">{{info.text}}</v-snackbar>
    <v-row v-if="json === null">
      <v-col align="center">
        <v-btn color="warning" @click="openJson()" :loading="loading">Datei Öffnen</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="json === null">
      <v-col align="center">
        <v-btn color="success" @click="json = [{ name: 'Unbenannt', symptoms: ['Unbenannt'], category: 'Internistisch' }]" :loading="loading">Neue Datei</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="json" class=align>
      <v-col cols=4>
        <v-list height="553.5px" class="list">
          <v-list-item-group v-model="item" color="primary">
            <v-list-item v-for="(disease, i) in json" :key="i">
              <v-list-item-content class="list-item-content">
                 <v-list-item-title v-html="disease.name"></v-list-item-title>
                 <v-chip outlined :color="determineColor(disease.category)" small>{{disease.category}}</v-chip>
              </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
        </v-list>
        <v-btn block outlined color="success" class="add-disease" @click="addDisease()">Hinzufügen</v-btn>
      </v-col>
      <v-col cols=8>
        <v-form>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field label="Name" outlined v-model="json[item].name"></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-autocomplete label="Name" outlined v-model="json[item].category" :items="['Internistisch', 'Neurologisch', 'Chirurgisch', 'Traumata']"></v-autocomplete>
              </v-col>
              <v-col cols=2>
                <v-btn block style="height:66%" outlined color=success @click="saveJson()"><v-icon>save</v-icon></v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-simple-table height="420px" class=table fixed-header>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Symptom</th>
                        <th class="text-right">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(symptom, index) in json[item].symptoms" :key="index">
                        <td>{{ symptom }}</td>
                        <td class=text-right>
                          <v-btn icon @click="json[item].symptoms.splice(index, 1)">
                            <v-icon>delete</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <v-text-field
                  label="Neues Symptom"
                  class="add-symptom"
                  outlined
                  v-model="newSymptom"
                  append-icon="send"
                  @click:append="appendSymptom(newSymptom)"
                  @keyup.enter="appendSymptom(newSymptom)">
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { remote, OpenDialogReturnValue } from 'electron'
import { readFile, writeFile } from 'fs'
import { promisify } from 'util'
import { IDisease, TCategory } from '../types/disease'
import { homedir } from 'os'
import { join } from 'path'

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

@Component
export default class Main extends Vue {

  filePath: string = ''
  json: IDisease[] | null = null
  loading: boolean = false
  info = { type: '', text: '' }
  item: number = 0
  newSymptom: string = ''

  mounted () {
    if (localStorage.json) {
      this.json = JSON.parse(localStorage.json)
      this.json!.sort((a, b) => {
        if (a.category < b.category) return -1
        if (a.category > b.category) return 1
        return 0
      })
    }
    if (localStorage.filePath) {
      this.filePath = localStorage.filePaths[0]
    }
  }

  async openJson () {
    this.info = { type: '', text: '' }
    this.loading = true
    const selectedFile = await remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON-Datei', extensions: ['json'] }
      ]
    }).catch(e => { this.info = { type: 'error', text: e } }) as OpenDialogReturnValue

    if (selectedFile.canceled) {
      this.info = { type: 'error', text: 'Fehler beim Öffnen: Vom Benutzer abgebrochen.' }
      this.loading = false
    }

    if (selectedFile.filePaths && !selectedFile.canceled) {
      const file = await readFileAsync(selectedFile.filePaths[0], { encoding: 'utf-8' })
      this.filePath = selectedFile.filePaths[0]
      this.json = JSON.parse(file)
      this.json!.sort((a, b) => {
        if (a.category < b.category) return -1
        if (a.category > b.category) return 1
        return 0
      })
      localStorage.json = file
      localStorage.filePath = selectedFile.filePaths[0]

      this.loading = false
    }
  }

  appendSymptom (item: string) {
    if (this.json && this.json[this.item].symptoms) { this.json[this.item].symptoms.push(item) }
    this.newSymptom = ''
    localStorage.json = JSON.stringify(this.json)
  }

  determineColor (cat: TCategory) {
    switch (cat) {
      case 'Internistisch':
        return 'red'
      case 'Neurologisch':
        return 'yellow'
      case 'Chirurgisch':
        return 'green'
      case 'Traumata':
        return 'blue'
      default:
        break
    }
  }

  addDisease () {
    this.json!.push({ name: 'Unbenannt', symptoms: ['Unbenannt'], category: 'Internistisch' })
    this.item = this.json!.length - 1
    localStorage.json = JSON.stringify(this.json)
  }

  async saveJson () {
    this.loading = true
    if (this.filePath) {
      await writeFileAsync(join(this.filePath, 'krankheiten.json'), JSON.stringify(this.json))
        .catch(e => { this.info = { type: 'error', text: 'Fehler beim Speichern: ' + e } })
      this.info = { type: 'success', text: 'Erfolgreich gespeichert!' }
    }
    if (!this.filePath) {
      const path = await remote.dialog.showOpenDialog({ title: 'Datei Speichern', defaultPath: homedir(), properties: ['openDirectory'] })
      if (!path.canceled) {
        this.filePath = path.filePaths![0]
        this.saveJson()
      } else {
        this.info = { type: 'error', text: 'Fehler beim Speichern: Von Benutzer abgebrochen' }
      }
    }
  }

}
</script>

<style lang="sass" scoped>
.align
  align-self: flex-start

.add-symptom
  margin-top: 2% !important

.list-item-content
  display: -webkit-box !important
  flex-direction: row !important
  justify-content: space-between !important
  align-items: center !important

.add-disease
  margin-top: 4% !important
  height: 55px !important

.list
  border-radius: 0px 0px 5px 5px !important
  overflow-y: scroll
</style>
