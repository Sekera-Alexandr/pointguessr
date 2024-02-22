<template>
  <div>
    <header>
      <div>
        <button class="btn" @click="goBack"><i class="fas fa-arrow-left"></i> Zpět</button>
      </div>
    </header>

    <div class="content-container">
      <div class="content" id="parentID">
        <label for="mapName" class="text-red-100">Název mapy: </label>
        <input v-model="mapName" type="text" id="mapName" required>

        <label for="placeImage">Obrázek místa:</label>
        <input type="file" id="placeImage" @change="uploadImage" accept="image/*" required>
        <img v-show="chosenPlace" id="picturePlaceID" src="#;"/>
        <p />

        <label v-if="chosenPlace" for="mapImage">Obrázek mapy:</label>
        <input v-if="chosenPlace" type="file" id="mapImage" @change="uploadImage" accept="image/*" required>
        <img v-show="chosenPlace && chosenMap" id="pictureMapID" src="#;" @click="zobrazCervenyBod"/>
        <div v-if="zobrazitCervenyBod && chosenMap" id="cervenyBodID" class="cerveny-bod"
          :style="{ left: bodXShow + 'px', top: bodYShow + 'px' }"></div>
        <p />

        <label v-if="zobrazitCervenyBod" for="selectedArea">Oblast byla označena!</label>

        <button @click="resetSelection" class="btn">Resetovat označení</button>
        <button @click="insertMapComplete" class="btn primary">Potvrdit volbu</button>
      </div>
    </div>
  </div>
  <div v-if="isLoading" class="overlay"></div>
</template>

<script>
import axios from 'axios';
import Maps from '@/Classes/Maps.js';
import Users from '@/Classes/Users.js'

export default {
  emits: ["goBack"],
  props: {
    user: {
      type: Users,
      required: true
    }
  },
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
    async ulozitVolbu() {
      this.isLoading = true;
      try {
        const response = await axios.post(this.api + '/Users/maps', this.zaznamMapy);
        confirm("Mapa " + this.mapName + " byla úspěšně vložena!")
      }
      catch (error) {
        console.error('Chyba při vytváření mapy:', error);
      }
      finally {
        this.resetSelection();
        this.isLoading = false;
      }
    },
    goBack() {
      this.$emit('goBack', true)
    },
    async insertMapComplete() {
      this.zobrazitCervenyBod = false;
      this.mapName = document.getElementById("mapName").value;

      if (!this.mapName) {
        confirm("Musíte zadat název mapy!")
        return;
      }
      try {
        this.zaznamMapy = new Maps(this.mapName, this.varImageMap, this.varImagePlace, this.bodX, this.bodY, this.user.id);

        await this.ulozitVolbu()
      }
      catch (error) {
        confirm(error)
      }
    },
    uploadImage(event) {
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
      const file = event.target.files[0];

      var image = document.getElementById(id);
      image.src = URL.createObjectURL(file);

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }

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
    zobrazCervenyBod(event) {
      this.bodXShow = Number(event.clientX) - 2;
      this.bodYShow = Number(event.clientY) + Number(window.scrollY) - 2;

      const pozice = this.GetCoordinates(event);
      
      this.bodX = pozice[0];
      this.bodY = pozice[1];

      this.zobrazitCervenyBod = true;
    },
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

    FindPosition() {
      const oElement = document.getElementById("pictureMapID")
      const posX = oElement.offsetLeft;
      const posY = oElement.offsetTop;

      return [posX, posY];
    },

    GetCoordinates(e) {
      var PosX = 0;
      var PosY = 0;
      var ImgPos = this.FindPosition(); // Najde pozici obrázku, kde se má vykreslovat mapa

      if (e.pageX || e.pageY) { // Kontrola, jestli existují vlastnosti pageX a pageY (kvůli podpoře prohlížeče)
        PosX = e.pageX;
        PosY = e.pageY;
      }
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