<template>
  <div class="dialog-overlay" v-if="isOpen">
    <div class="dialog-box">
      <p>{{ message }}</p>
      <div class="dialog-buttons">
        <button @click="confirm">Potvrdit</button>
        <button @click="cancel">Zrušit</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isOpen: true
    };
  },
  methods: {
    confirm() {
      this.$emit('confirm');
      this.closeDialog();
    },
    cancel() {
      this.$emit('cancel');
      this.closeDialog();
    },
    closeDialog() {
      this.isOpen = false;
    }
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* poloprůhledné černé pozadí */
  z-index: 999; /* zajistí, že dialog bude nad ostatními prvky */
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-box {
  background-color: #fff; /* bílé pozadí dialogového okna */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* přidán stín */
  max-width: 300px; /* maximální šířka */
  width: 100%; /* zajištění, že obsah zabere maximální dostupnou šířku */
  text-align: center; /* zarovnání textu */
}

.dialog-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  background-color: #90C944;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 10px;
}

button:hover {
  background-color: #A6D245;
}

button:focus {
  outline: none; /* odstraní modrou obrysovou značku, která se objeví po kliknutí */
}
</style>
