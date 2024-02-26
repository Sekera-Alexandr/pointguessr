<template>
  <!-- Hlavní div obsahující header a obsah -->
  <div>
    <!-- Horní lišta s tlačítkem Zpět -->
    <header>
      <div>
        <button class="btn" @click="goBack"><i class="fas fa-arrow-left"></i> Zpět</button>
      </div>
    </header>

    <!-- Kontejner pro obsah -->
    <div class="content-container">
      <!-- Obsahový div s formulářem pro vložení mapy -->
      <div class="content" id="parentID">
        <!-- Název mapy -->
        <label for="mapName" class="text-red-100">Název mapy: </label>
        <input v-model="mapName" type="text" id="mapName" required>

        <!-- Input pro obrázek místa -->
        <label for="placeImage">Obrázek místa:</label>
        <input type="file" id="placeImage" @change="uploadImage" accept="image/*" required>
        <img v-show="chosenPlace" id="picturePlaceID" src="#;"/> <!-- Zde se zobrazuje nahraný obrázek místa -->
        <p />

        <!-- Input pro obrázek mapy -->
        <label v-if="chosenPlace" for="mapImage">Obrázek mapy:</label>
        <input v-if="chosenPlace" type="file" id="mapImage" @change="uploadImage" accept="image/*" required>
        <img v-show="chosenPlace && chosenMap" id="pictureMapID" src="#;" @click="zobrazCervenyBod"/> <!-- Zde se zobrazuje nahraný obrázek mapy -->
        <div v-if="zobrazitCervenyBod && chosenMap" id="cervenyBodID" class="cerveny-bod"
          :style="{ left: bodXShow + 'px', top: bodYShow + 'px' }"></div> <!-- Červený bod -->
        <p />

        <label v-if="zobrazitCervenyBod" for="selectedArea">Oblast byla označena!</label>

        <!-- Tlačítko pro resetování označení -->
        <button @click="resetSelection" class="btn">Resetovat označení</button>
        <!-- Tlačítko pro potvrzení volby -->
        <button @click="insertMapComplete" class="btn primary">Potvrdit volbu</button>
      </div>
    </div>
  </div>
  <!-- Overlay pro uzamknutí aplikace -->
  <div v-if="isLoading" class="overlay"></div>
</template>

<script>
import axios from 'axios';
import Maps from '@/Classes/Maps.js';
import Users from '@/Classes/Users.js'

export default {

  // Emitované události
  emits: ["goBack"],

  // Propojení s uživatelem
  props: {
    user: {
      type: Users,
      required: true
    }
  },

  // Data komponenty
  data() {
    return {
      api: 'https://localhost:7296',
      mapName: '',
      varImageMap: null,
      varImagePlace: null,
      chosenMap: false,
      chosenPlace: false,
      zobrazitCervenyBod: false,
      bodX: 0,
      bodY: 0,
      bodXShow: 0,
      bodYShow: 0,
      neovX: 0,
      neovY: 0,
      zaznamMapy: null,
      isLoading: false
    };
  },

  methods: {

    // Metoda pro uložení volby
    async ulozitVolbu() {

      // Nastavení příznaku načítání
      this.isLoading = true;

      try {
        // Odeslání dat na server
        const response = await axios.post(this.api + '/Users/maps', this.zaznamMapy);
        confirm("Mapa " + this.mapName + " byla úspěšně vložena!")
      }
      catch (error) {
        console.error('Chyba při vytváření mapy:', error);
      }
      finally {
        this.resetSelection(); // Resetování výběru
        this.isLoading = false; // Resetování příznaku načítání
      }
    },

    // Návrat zpět
    goBack() {
      this.$emit('goBack', true)
    },

    // Potvrzení vložení mapy
    async insertMapComplete() {
      // Skrytí červeného bodu
      // Získání názvu mapy z inputu
      this.zobrazitCervenyBod = false;
      this.mapName = document.getElementById("mapName").value;

      // Ověření, zda uživatel zadal název mapy
      if (!this.mapName) {
        confirm("Musíte zadat název mapy!")
        return;
      }

      try {
        // Inicializace aplikace zaznamMapy, ve které jsou veškeré informace
        this.zaznamMapy = new Maps(this.mapName, this.varImageMap, this.varImagePlace, this.bodX, this.bodY, this.user.id);

        // Uložení volby mapy do databáze
        await this.ulozitVolbu()
      }
      catch (error) {
        confirm(error)
      }
    },

    // Nahrání obrázku do elementu img
    uploadImage(event) {
      //Vyhodnocení, zda-li se jedná o místo, nebo mapu
      var id = event.target.id;
      var place = (id == "placeImage");
      if (place) {
        id = "picturePlaceID";
        this.chosenPlace = true;
        this.chosenMap = false;
      }
      else {
        id = "pictureMapID";
        this.chosenMap = true;
      }

      // Uložení zvoleného obrázku do proměnné
      const file = event.target.files[0];

      var image = document.getElementById(id);
      image.src = URL.createObjectURL(file);

      // Jestliže uživatel nějaký soubor zvolil, uloží se do proměnné, která je spojena s elementem img
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      // HTTP žádost na obrázek, který se vrací jako blob
      // Blob je následně převeden na base64String a uložen do příslušné proměnné
      fetch(image.src)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result;
            place ? this.varImagePlace = base64String : this.varImageMap = base64String;
          };
          reader.readAsDataURL(blob);
        });
    },

    // Zobrazení červeného bodu
    zobrazCervenyBod(event) {
       // Zobrazení místa, kam jsme skutečně kliknuli
      this.bodXShow = Number(event.clientX) - 2;
      this.bodYShow = Number(event.clientY) + Number(window.scrollY) - 2;

      // Výpočet relativní pozice na obrázku, kam jsme kliknuli
      const pozice = this.GetCoordinates(event);
      
      this.bodX = pozice[0];
      this.bodY = pozice[1];

      this.zobrazitCervenyBod = true;
    },

    // Resetování výběru obrázků a názvu mapy
    resetSelection() {
      this.mapName = ''
      var placeImage = document.getElementById("placeImage");
      var picturePlaceID = document.getElementById("picturePlaceID");
      var mapImage = document.getElementById("mapImage");
      var pictureMapID = document.getElementById("pictureMapID");

      if (placeImage !== null) {
        picturePlaceID.src = null;
        placeImage.value = null;
      }
      this.chosenPlace = false;

      if (mapImage !== null) {
        pictureMapID.src = null;
        mapImage.value = null;
      }
      this.chosenMap = false;

      this.zobrazitCervenyBod = false;
      this.bodX = 0;
      this.bodY = this.bodX;
    },

    // Získání pozice obrázku mapy
    FindPosition() {
      const oElement = document.getElementById("pictureMapID")
      const posX = oElement.offsetLeft;
      const posY = oElement.offsetTop;

      return [posX, posY];
    },

    // Získání souřadnic bodu, kam jsme na obrázku kliknuli
    GetCoordinates(e) {
      var PosX = 0;
      var PosY = 0;
      var ImgPos = this.FindPosition(); // Najde pozici obrázku, kde se má vykreslovat mapa

      if (e.pageX || e.pageY) { // Kontrola, jestli existují vlastnosti pageX a pageY (kvůli podpoře prohlížeče)
        PosX = e.pageX;
        PosY = e.pageY;
      }

      // Pokud podpora neexistuje, musí se pozice vypočítat včetně odsazení
      else if (e.clientX || e.clientY) {
        PosX = e.clientX + document.body.scrollLeft
          + document.documentElement.scrollLeft;
        PosY = e.clientY + document.body.scrollTop
          + document.documentElement.scrollTop;
      }
      PosX = PosX - ImgPos[0];
      PosY = PosY - ImgPos[1];
      return [PosX, PosY];
    }
  }
};
</script>

<style>
img {
  max-width: 100%;
  height: auto;
}
.cerveny-bod {
  width: 5px;
  height: 5px;
  background-color: red;
  position: absolute;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Průhledný černý overlay */
  z-index: 9999;
  /* Zajištění, aby byl div overlay nad všemi ostatními prvky */
}

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

button.btn {
  background-color: #90C944;
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button.btn.primary {
  background-color: #A6D245;
}

button.btn:hover {
  background-color: #A6D245;
}
</style>