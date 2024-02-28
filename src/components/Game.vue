<template>
  <!-- Hlavní div obsahující tlačítka a obrázky -->
  <div>
    <!-- Horní lišta s tlačítky -->
    <div class="header">
      <button class="btn" @click="goBack"><i class="fas fa-arrow-left"></i> Zpět</button>
      <button class="btn" @click="fetchMaps">Vygeneruj obrázek!</button>
    </div>

    <!-- Tělo obsahu s obrázky a labely -->
    <div v-if="firstLoad" class="center">
      <div class="misto">
        <!-- Label a obrázek pro místo na mapě -->
        <h2>Místo na mapě {{ jmenoMapy }}</h2>
        <img class="misto-obrazek" id="picturePlaceID" :src="placeImage" />
      </div>
      <div class="mapa">
        <!-- Label a obrázek pro mapu -->
        <h2>Mapa</h2>
        <div class="black-bar">
          <img id="pictureMapID" class="mapa-obrazek" :src="mapImage" @click="zobrazCervenyBod" />
          <div v-if="zobrazitCervenyBod" id="cervenyBodID" class="cerveny-bod"
          :style="{ left: bodX + 'px', top: bodY + 'px' }"></div> <!-- Červený bod -->
          <div v-if="zobrazitModryBod" id="cervenyBodID" class="modry-bod"
          :style="{ left: bodXShow + 'px', top: bodYShow + 'px' }"></div> <!-- Modry bod -->
          <div v-if="zobrazCaru" class="line" :style="{ left: bodX + 'px', top: bodY + 'px', width: lineLength + 'px', transform: 'rotate(' + lineAngle + 'deg)' }"></div> <!-- Čára -->
        </div>
      </div>
    </div>

    <!-- Tlačítko pro potvrzení volby -->
    <button v-if="firstLoad" class="btn confirm-button" @click="confirmChoice">Potvrdit volbu</button>
  </div>
  <Dialog v-if="showDialogFlag" id="dial" :message="dialogMessage" @confirm="handleConfirm" @cancel="handleCancel"/>
</template>
  
<script>
import axios from 'axios';
import Maps from '@/Classes/Maps.js';
import Users from '@/Classes/Users.js';
import Dialog from '@/components/Dialog.vue'

export default {

  // Emitované události
  emits: ["goBackGame"],

  // Komponenty
  components: {
        Dialog
    },

  // Proměnné
  data() {
    return {
      api: 'https://localhost:7296',
      bodX: 0,
      bodY: 0,
      bodXShow: 0,
      bodYShow: 0,
      zobrazitCervenyBod: false,
      zobrazitModryBod: false,
      placeImage: '',
      mapImage: '',
      selectedPlace: null,
      mapa: null,
      isMapGenerating: false,
      jmenoMapy: '',
      lockSelection: false,
      zobrazCaru: false,
      firstLoad: false,
      showDialogFlag: false,
      dialogMessage: "Toto je zpráva v dialogu"
    };
  },
  methods: {

    // Metoda pro určení délky a úhlu čáry
calculateLine() {
  const deltaX = this.bodX - this.bodXShow;
  const deltaY = this.bodY - this.bodYShow;
  this.lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  this.lineAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 180;
},


    showDialog() {
      this.showDialogFlag = true;
    },
    handleConfirm() {
      this.showDialogFlag = false;
    },
    handleCancel() {
      this.showDialogFlag = false;
    },

    // Metoda pro návrat zpět
    goBack() {
      this.$emit('goBackGame', true)
    },

    // Metoda pro načtení mapy
    async fetchMaps() {
      // Resetování hodnot před načtením mapy
      this.zobrazitCervenyBod = false
      this.zobrazitModryBod = false
      this.zobrazCaru = false
      this.lockSelection = false

      try {
        // Ověření, zda se již mapa negeneruje
        if (this.isMapGenerating) return;
        this.isMapGenerating = true;

        // Získání mapy z API
        const response = await axios.get(this.api + '/Users/maps');
        this.mapa = new Maps(
          response.data.jmeno,
          response.data.imageMapa,
          response.data.imageMisto,
          response.data.poziceX,
          response.data.poziceY,
          response.data.userID
        );
        this.placeImage = this.mapa.imageMisto;
        this.mapImage = this.mapa.imageMapa;
        this.jmenoMapy = this.mapa.jmeno;
      }
      catch (error) {
        console.error('Chyba při načítání mapy:', error);
      }

      //Umožnění znovu generovat mapy
      finally {
        this.isMapGenerating = false;
        this.firstLoad = true
      }
    },

    prepareDialog(points) {
      this.showDialogFlag = true;
      this.dialogMessage = 'Gratuluji, získal jsi ' + points + ' bodů!';
    },

    // Metoda pro potvrzení volby
    confirmChoice() {
      // Ověření, zda nebyl bod již hádán
      if (this.lockSelection) return;
      this.zobrazitModryBod = true
      this.zobrazCaru = true

      // Výpočet bodů a zobrazení message boxu
      const points = this.calculatePoints();
      this.prepareDialog(points);

      this.lockSelection = true;
    },

    // Metoda pro výpočet (maximální) vzdálenosti
    calculateLengthAndMaxSize() {
      // Výpočet vektoru mezi dvěma body - oba body od sebe odečteme
      // Následně vypočítána délka vektoru
      const difX = Number(this.bodX) - Number(this.bodXShow);
      const difY = Number(this.bodY) - Number(this.bodYShow);
      const sum = Number(Math.pow(difX, 2)) + Number(Math.pow(difY, 2));
      //Délka vektoru = vzdálenost mezi dvěma body
      const length = Math.sqrt(sum);

      // Výpočet největší možné vzdálenosti obrázku
      // Dle Pythagorovy věty, a = výška obrázku, b = délka obrázku
      const imageElement = document.getElementById("pictureMapID");
      const rect = imageElement.getBoundingClientRect();
      const maxSizeSum = Math.pow(rect.height, 2) + Math.pow(rect.width, 2);
      const maxSize = Math.sqrt(maxSizeSum);

      return [length, maxSize];
    },

    // Metoda pro výpočet bodů
    calculatePoints() {
      // Koeficienty
      const a = 18 / 1300;
      const b = -1834 / 1300;
      const c = 46700 / 1300;

      // Metoda obsahuje vzdálenost na 1. pozici a maximální vzdálenost na 2.
      const vzdMax = this.calculateLengthAndMaxSize();
      const vzdalenost = vzdMax[0];
      const maximalniVzdalenost = vzdMax[1];

      const pomer = vzdalenost / maximalniVzdalenost;

      // Poměr vzdáleností:
      // Větší než 50 %, 0 bodů
      // Menší než 15 %, 1000 bodů
      // Mezi 15 % a 25 %, 800 bodů
      // Mezi 25 % a 50 %, rozdělení bodů podle kvadratické rovnice
      if (pomer > 0.5) return 0;
      if (pomer < 0.05) return 1000;
      if (pomer > 0.05 && pomer < 0.15) return 800;
      const points = a * pomer * pomer + b * pomer + c; //y = ax^2 + bx + c

      if (points <= 0) return 0;
      return Math.round(points);
    },

    // Metoda pro zobrazení červeného bodu
    zobrazCervenyBod(event) {
      // Ověření, zda je volba uzamčena
      if (this.lockSelection) return;

      // Získání pozice obrázku a následný výpočet umístění bodu na něm
      const poziceObrazku = this.getImageCoordinates();
      this.bodXShow = this.mapa.poziceX + poziceObrazku[0];
      this.bodYShow = this.mapa.poziceY + poziceObrazku[1];

      // Zobrazení místa, kam jsme skutečně kliknuli
      this.bodX = Number(event.clientX) - 2;
      this.bodY = Number(event.clientY) + Number(window.scrollY) - 2;
      this.zobrazitCervenyBod = true;
      // Spočítání délky a úhlu čáry
  this.calculateLine();
    },

    // Metoda pro získání souřadnic obrázku
    getImageCoordinates() {
      const imageElement = document.getElementById("pictureMapID");
      const rect = imageElement.getBoundingClientRect();

      // Počítá se i s odsazením na stránce, tj. jak moc uživatel scrolluje
      const imgX = rect.left + window.scrollX;
      const imgY = rect.top + window.scrollY;
      return [imgX, imgY];
    }
  }
};
</script>

<style scoped>

.line {
  position: absolute;
  height: 2px;
  background-color: #000;
  transform-origin: left center;
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
  margin-bottom: 20px;
}


.misto {
  width: 33%;
  display: flex;
  flex-direction: column;
  margin: 5px;
}

.mapa {
  width: 66%;
  display: flex;
  flex-direction: column;
}

.content-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  /* Přidáno omezení na maximální šířku obsahu */
  width: 100%;
  /* Přidáno pro zajištění, že obsah zabere maximální dostupnou šířku */
  text-align: center;
}

button {
  background-color: #90C944;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  background-color: #A6D245;
}

.cerveny-bod,
.modry-bod {
  width: 5px;
  height: 5px;
  position: absolute;
}

.cerveny-bod {
  background-color: red;
}

.modry-bod {
  background-color: blue;
}

img {
  height: auto;
}

label {
  display: block;
  margin-bottom: 5px;
}

.confirm-button {
  display: block;
  margin: 20px auto;
}

.center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.mapa-obrazek {
  max-width: 600px;
  object-fit: contain;
  background-color: black;
}
.misto-obrazek {
  max-width: 300px;
}
.black-bar {
  background-color: black;
  text-align: center;
}
</style>