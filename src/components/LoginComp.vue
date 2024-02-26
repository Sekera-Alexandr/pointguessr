<template>
  <!-- Hlavní div obsahující header a obsah -->
  <div class="main">
    <!-- Checkbox pro přepínání mezi registrací a přihlášením -->
    <input type="checkbox" id="chk" aria-hidden="true">
    <!-- Sekce pro registraci -->
    <div class="signup">
      <form>
        <!-- Název formuláře pro registraci -->
        <label for="chk">Sign up</label>
        <!-- Políčka pro zadání uživatelského jména, emailu a hesla -->
        <input type="text" v-model="username" name="username" placeholder="User name" required>
        <input type="email" v-model="email" name="email" placeholder="Email" required>
        <input type="password" v-model="password" name="password" placeholder="Heslo" required>
        <!-- Tlačítko pro registraci uživatele -->
        <button type="button" @click="vytvoritUzivatele">Sign up</button>
      </form>
    </div>

    <!-- Sekce pro přihlášení -->
    <div class="login">
      <form>
        <!-- Název formuláře pro přihlášení -->
        <label for="chk" aria-hidden="true">Login</label>
        <!-- Políčka pro zadání uživatelského jména a hesla -->
        <input type="text" v-model="username" name="username" placeholder="User name" required>
        <input type="password" v-model="password" name="password" placeholder="Heslo" required>
        <!-- Tlačítko pro přihlášení uživatele -->
        <button type="button" @click="prihlasitUzivatele">Login</button>
      </form>
    </div>
  </div>
  <!-- Overlay pro uzamknutí aplikace -->
  <div v-if="isLoading" class="overlay"></div>
</template>

<script>
import axios from 'axios';
import Users from '@/Classes/Users.js';

export default {
  emits: ['logged', 'user'],
  data() {
    return {
      api: 'https://localhost:7296',
      isLogged: false,
      isLoggingIn: false,
      username: '',
      password: '',
      email: '',
      id: 0,
      isLoading: false
    }
  },
  methods: {

    // Metoda pro přihlášení uživatele
    logIntoAccount(user) {
      this.isLogged = true
      // Emitování události 'logged' s příznakem přihlášení
      this.$emit('logged', this.isLogged)
      // Emitování události 'user' s uživatelskými údaji
      this.$emit('user', user)
    },

    // Metoda pro vytvoření uživatele
    async vytvoritUzivatele() {
      if (this.isLoggingIn) return;
      this.isLoggingIn = true;
      this.isLoading = true;

      // Vytvoření uživatelských dat z formuláře
      const userData = new Users(this.username, this.email, this.password, 0);
      try {
        // Odeslání POST požadavku na server pro vytvoření uživatele
        const response = await axios.post(this.api + '/Users', userData);
        // Nastavení uživatelských dat podle odpovědi serveru
        this.username = response.data.username;
        this.email = response.data.email;
        this.password = this.email = response.data.password;
        this.id = response.data.id;
        this.isLoggingIn = false;

        // Zpracování odpovědi serveru pro případ, že uživatel s daným jménem nebo emailem již existuje
        if (!this.email) {
          confirm("Uživatel s tímto jménem nebo emailem již existuje!")
          return;
        }
        // Automatické přihlášení uživatele po úspěšném vytvoření účtu
        await this.prihlasitUzivatele();
      }
      catch (error) {
        console.error('Chyba při vytváření uživatele:', error);
        throw error;
      }
      finally {
        this.isLoggingIn = false;
        this.isLoading = false;
      }
    },

    // Metoda pro přihlášení uživatele
    async prihlasitUzivatele() {
      if (this.isLoggingIn) return;
      this.isLoggingIn = true;
      this.isLoading = true;

      // Vytvoření uživatelských dat pro přihlášení
      const userData = new Users(this.username, this.email, this.password, this.id);
      try {
        // Odeslání POST požadavku na server pro přihlášení uživatele
        const response = await axios.post(this.api + '/Users/login', userData);
        // Nastavení uživatelských údajů podle odpovědi serveru
        this.email = response.data.email;
        this.id = response.data.id;
        // Pokud bylo úspěšné přihlášení, emitování události pro přihlášení uživatele
        if (this.email) {
          userData.email = this.email;
          userData.id = this.id;
          this.logIntoAccount(userData);
        }
        else {
          confirm("Chybné uživatelské jméno nebo heslo!");
        }
      }
      catch (error) {
        console.error('Chyba při přihlašování uživatele:', error);
        throw error;
      }
      finally {
        this.isLoggingIn = false;
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Jost', sans-serif;
  background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
  background-image: url('https://png.pngtree.com/background/20230620/original/pngtree-blue-nervous-system-signals-transmitting-in-3d-render-picture-image_3851550.jpg');
}

.main {
  width: 350px;
  height: 500px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 5px 20px 50px #000;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.image-div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#chk {
  display: none;
}

.signup {
  position: relative;
  width: 100%;
  height: 100%;
}

label {
  color: #fff;
  font-size: 2.3em;
  justify-content: center;
  display: flex;
  margin: 60px;
  font-weight: bold;
  cursor: pointer;
  transition: .5s ease-in-out;
}

input {
  width: 60%;
  height: 20px;
  background: #e0dede;
  justify-content: center;
  display: flex;
  margin: 20px auto;
  padding: 10px;
  border: none;
  outline: none;
  border-radius: 5px;
}

button {
  width: 60%;
  height: 40px;
  margin: 10px auto;
  justify-content: center;
  display: block;
  color: #fff;
  background: #90C944;
  font-size: 1em;
  font-weight: bold;
  margin-top: 20px;
  outline: none;
  border: none;
  border-radius: 5px;
  transition: .2s ease-in;
  cursor: pointer;
}

button:hover {
  background: #A6D245;
}

.login {
  height: 460px;
  background: #eee;
  border-radius: 60% / 10%;
  transform: translateY(-180px);
  transition: .8s ease-in-out;
}

.login label {
  color: #90C944;
  transform: scale(.6);
}

#chk:checked~.login {
  transform: translateY(-500px);
}

#chk:checked~.login label {
  transform: scale(1);
}

#chk:checked~.signup label {
  transform: scale(.6);
}

.image-container {
  max-width: 300px;
}</style>