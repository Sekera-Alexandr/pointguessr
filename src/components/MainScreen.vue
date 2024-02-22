<template>
  <div>
    <header>
      <div>
        <span>Vítej, {{ user.username }}!</span>
      </div>
      <div>
        <button @click="logOut"><i class="fas fa-sign-out-alt"></i> Odhlásit se</button>
        <button @click="insertMap"><i class="fas fa-map-marker-alt"></i> Vložit mapu</button>
      </div>
    </header>

    <div class="content-container">
      <div class="content">
        <button type="submit" @click="playGame">Spustit hru</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      insertingMap: false
    }
  },
  methods: {
    insertMap() {
      this.insertingMap = true
      this.$emit('inserting', this.insertingMap)
    },
    logOut() {
      this.$emit('loggingOut', true)
    },
    playGame() {
      this.$emit('playingGame', true)
    }
  }
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #90C944;
  padding: 10px 20px;
  width: 100%;
  color: #fff;
  box-sizing: border-box;
}

.content-container {
  flex: 1; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

button {
  background-color: #90C944;
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #A6D245;
}

span {
  font-size: 20px;
}
</style>
