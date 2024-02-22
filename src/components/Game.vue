<template>
  <div>
    <div class="header">
      <button class="btn" @click="goBack"><i class="fas fa-arrow-left"></i> Zpět</button>
      <button class="btn" @click="fetchMaps">Vygeneruj obrázek!</button>
    </div>
    <div v-if="zobrazitCervenyBod" class="cerveny-bod"
      :style="{ left: bodX + 'px', top: bodY + 'px' }" />
    <div v-if="zobrazitModryBod" class="modry-bod"
      :style="{ left: bodXShow + 'px', top: bodYShow + 'px' }" />

    <div class="center">
      <h2>Místo na mapě {{ jmenoMapy }}</h2>
      <img id="picturePlaceID" :src="placeImage" />
      <h2>Mapa</h2>
      <img id="pictureMapID" :src="mapImage" @click="zobrazCervenyBod" />
      <button class="btn" @click="confirmChoice">Potvrdit volbu</button>
    </div>
  </div>
</template>
  
<script>
import axios from 'axios';
import Maps from '@/Classes/Maps.js';
import Users from '@/Classes/Users.js';

export default {
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
      zobrazCaru: false
    };
  },
  methods: {
    goBack() {
      this.$emit('goBackGame', true)
    },
    async fetchMaps() {
      this.zobrazitCervenyBod = false
      this.zobrazitModryBod = false
      this.zobrazCaru = false
      this.lockSelection = false
      try {
        if (this.isMapGenerating) return;
        this.isMapGenerating = true;

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
      finally {
        this.isMapGenerating = false;
      }
    },
    confirmChoice() {
      if(this.lockSelection) return;
      this.zobrazitModryBod = true

      const points = this.calculatePoints()
      confirm('Gratuluji, získal jsi ' + points + ' bodů!')

      this.lockSelection = true;
    },
    calculateLengthAndMaxSize() {
      const difX = Number(this.bodX) - Number(this.bodXShow);
      const difY = Number(this.bodY) - Number(this.bodYShow);
      const sum = Number(Math.pow(difX, 2)) + Number(Math.pow(difY, 2));
      
      const length = Math.sqrt(sum);

      const imageElement = document.getElementById("pictureMapID");
      const rect = imageElement.getBoundingClientRect();

      const maxSizeSum = Math.pow(rect.height, 2) + Math.pow(rect.width, 2);
      const maxSize = Math.sqrt(maxSizeSum);

      return [length, maxSize];
    },
    calculatePoints() {
      const a = 18 / 1300;
      const b = -1834 / 1300;
      const c = 46700 / 1300;
      const vzdalenost = this.calculateLengthAndMaxSize()[0];
      const maximalniVzdalenost = this.calculateLengthAndMaxSize()[1];
      const pomer = vzdalenost / maximalniVzdalenost;

      if(pomer > 0.5) return 0;
      if(pomer < 0.15) return 1000;
      if(pomer > 0.15 && pomer < 0.25) return 800;

      const points = a * pomer * pomer + b * pomer + c; //y = ax^2 + bx + c
      if (points <= 0) return 0;
      return Math.round(points);
    },
    zobrazCervenyBod(event) {
      if (this.lockSelection) return;
      this.zobrazCaru = true
      
      const poziceObrazku = this.getImageCoordinates();

      this.bodXShow = this.mapa.poziceX + poziceObrazku[0];
      this.bodYShow = this.mapa.poziceY + poziceObrazku[1];

      this.bodX = Number(event.clientX) - 2;
      this.bodY = Number(event.clientY) + Number(window.scrollY) - 2;

      this.zobrazitCervenyBod = true;
    },

    getImageCoordinates() {
      const imageElement = document.getElementById("pictureMapID");
      const rect = imageElement.getBoundingClientRect();
      const imgX = rect.left + window.scrollX;
      const imgY = rect.top + window.scrollY;
      return [imgX, imgY];
    }
  }
};
</script>

<style scoped>

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #90C944; /* Změněno na odpovídající barvu */
  padding: 10px 20px;
  width: 100%;
  color: #fff;
  box-sizing: border-box;
  margin-bottom: 20px; /* Přidáno pro oddělení od následujícího obsahu */
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
  max-width: 300px; /* Přidáno omezení na maximální šířku obsahu */
  width: 100%; /* Přidáno pro zajištění, že obsah zabere maximální dostupnou šířku */
  text-align: center;
}

/* Společné styly pro tlačítka */
button {
  background-color: #90C944; /* Barva tlačítek */
  color: #fff;
  padding: 10px 20px; /* Zvětšeno pro lepší použitelnost */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px; /* Přidáno mezera mezi tlačítky */
}

button:hover {
  background-color: #A6D245; /* Barva tlačítka při najetí myší */
}

/* Styly pro cerveny a modry bod */
.cerveny-bod, .modry-bod {
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

/* Styly pro obrázky */
img {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}

/* Styly pro labely */
label {
  display: block;
  margin-bottom: 5px;
}

/* Styly pro tlačítko "Potvrdit volbu" */
.confirm-button {
  display: block;
  margin: 20px auto;
}

img {
  max-width: 300px;
  height: auto;
}
.center {
  display: flex;
  flex-direction: column; /* Obsah bude uspořádán ve sloupci */
  justify-content: center; /* Vertikální vycentrování obsahu */
  align-items: center; /* Horizontální vycentrování obsahu */
}
</style>