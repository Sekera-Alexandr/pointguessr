<script setup>
import LoginComp from './components/LoginComp.vue'
import MainScreen from './components/MainScreen.vue'
import MapInsertion from './components/MapInsertion.vue'
import Game from './components/Game.vue'

</script>

<script>
export default {
  // Data komponenty
  data() {
    return {
      // Stav uživatele
      result: false,
      // Příznak pro vložení mapy
      insertion: false,
      // Příznak pro spuštění hry
      game: false,
      // Objekt uživatele
      user: null
    }
  },
  
  methods: {

    // Metoda pro zpracování přihlášení uživatele
    handleUser(user){
      this.user = user
    },

    // Metoda pro zpracování přihlášení
    isLogged(data) {
      this.result = data
    },

    // Metoda pro zpracování vložení mapy
    isInserting(data) {
      this.result = false
      this.insertion = data
      this.game = false
    },

    // Metoda pro zpracování akce "zpět" v případě vložení mapy
    isGoingBack(data) {
      this.insertion = false
      this.result = data
    },

    // Metoda pro zpracování akce "zpět" v případě hry
    isGoingBackGame(data) {
      this.game = false
    },

    // Metoda pro odhlášení uživatele
    isLoggingOut(data) {
      this.result = false
      this.insertion = false
      this.game = false
      this.user = null
    },

    // Metoda pro spuštění hry
    isPlayingGame()
    {
      this.game = true
    }
  }
}
</script>

<template>
  <header>
  </header>

  <main>
    <!-- Komponenta pro přihlášení uživatele -->
    <LoginComp v-if="!result && !insertion" @logged="isLogged($event)" @user="handleUser" id="3"/>
    <!-- Hlavní obrazovka s herním rozhraním -->
    <MainScreen v-if="result && !insertion && !game" @playingGame="isPlayingGame($event)" @inserting="isInserting($event)" @loggingOut="isLoggingOut($event)" :user="user"/>
    <!-- Komponenta pro vložení mapy -->
    <MapInsertion v-if="insertion" @goBack="isGoingBack($event)" :user="user"/>
    <!-- Komponenta pro hru -->
    <Game v-if="game" @goBackGame="isGoingBackGame($event)"/>
  </main>

</template>
