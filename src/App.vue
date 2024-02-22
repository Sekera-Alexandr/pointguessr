<script setup>
import LoginComp from './components/LoginComp.vue'
import MainScreen from './components/MainScreen.vue'
import MapInsertion from './components/MapInsertion.vue'
import Game from './components/Game.vue'

</script>

<script>
export default {
  data() {
    return {
      result: false,
      insertion: false,
      game: false,
      user: null
    }
  },
  methods: {
    handleUser(user){
      this.user = user
    },
    isLogged(data) {
      this.result = data
    },
    isInserting(data) {
      this.result = false
      this.insertion = data
      this.game = false
    },
    isGoingBack(data) {
      this.insertion = false
      this.result = data
    },
    isGoingBackGame(data) {
      this.game = false
    },
    isLoggingOut(data) {
      this.result = false
      this.insertion = false
      this.game = false
      this.user = null
    },
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
    <LoginComp v-if="!result && !insertion" @logged="isLogged($event)" @user="handleUser" />
    <MainScreen v-if="result && !insertion && !game" @playingGame="isPlayingGame($event)" @inserting="isInserting($event)" @loggingOut="isLoggingOut($event)" :user="user"/>
    <MapInsertion v-if="insertion" @goBack="isGoingBack($event)" :user="user"/>
    <Game v-if="game" @goBackGame="isGoingBackGame($event)"/>
  </main>

</template>