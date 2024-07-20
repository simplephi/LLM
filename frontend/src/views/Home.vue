<template>
  
  <q-page class="q-pa-md">
  
    <div class="row">
      <div class="col-3">
        <q-card  >
          <q-card-section>
            <q-card-title>
              Idea
            </q-card-title>
            
            <q-input
              v-model="userInput"
              filled
              label="User Input"
              dense
              
              @keyup.enter="sendChat"
            />
            <q-card-actions align="right" class="idea-response-title">
              
              <q-btn
                label="Clear"
                color="deep-orange"
                dense
                :loading="isLoading.clearConversation" 
                @click="clearConversation"
                size="sm"
              />
              <q-btn
              label="Generate"
              color="secondary"
              dense
              :loading="isLoading.sendChat"
              @click="sendChat"
              size="sm"
            />
            </q-card-actions>
            
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
       
        
      </div>
      <div class="col-3">
        
       
        <q-card v-if="keyyy" id="keyword-container">
          <q-card-section>
            <q-card-title>
            Keywords ({{ banyakKey }})
            </q-card-title>
            <br/>
            <hr/>
            <q-card-text v-if="keywords.length">
              <ul>
                <li v-for="keyword in keywords" :key="keyword">{{ keyword }}</li>
              </ul>
            </q-card-text>
          </q-card-section>
        </q-card>
      </div>

    </div>

  <br/>
    
    <div class="row">
        <div class="col-3">
          <q-card v-if="assisten" id="assistant-container">
            <q-card-section >
              <q-card-title class="assistant-response-title">
                
                <q-card-title >
                  Responses
                  <q-btn
                    icon="refresh" 
                    color="brown"
                    dense
                    @click="sendChat"
                    size="sm"
                  ><q-tooltip class="bg-accent">More Responses</q-tooltip>
                  </q-btn>
                </q-card-title>
                <q-card-title>
                  <q-btn
                    label="Save Response"
                    color="primary"
                    dense
                    :loading="isLoading.saveToNeo4j"
                    @click="saveToNeo4j"
                    size="sm"
                  />
                </q-card-title>
              </q-card-title>
              <hr/>
              
              <q-card-section v-if="assistantResponse">{{ assistantResponse }}</q-card-section>

            </q-card-section>
      
           
          </q-card>

        </div>

    </div>
    

    <div  id="network-graph-container"></div>
    

    <!-- Tampilan untuk analisis (dummy) -->
    <q-card v-if="analis" id="analisis-container">
      <q-card-section>
        <q-card-title>
          History
        </q-card-title>
        <br/>
            <hr/>
        <q-card-section >
          <!-- Gunakan q-scroll-area untuk membuat scrolling horizontal -->
          
          
            <!-- Looping card disini -->
            <div v-for="(item, index) in analysisItems" :key="index" >

              <q-card style="display: inline-block; margin-right: 10px;">
                <q-card-section>
                  <q-card-title>
                    <span class="blurred-text">{{ item.waktu }}</span>
                    
                  </q-card-title>
                  
                  <q-card-section>
                  
                    {{ item.respon }}
                  
                  </q-card-section>
                  
                </q-card-section>
                <br>
              </q-card>
            </div>


        
        </q-card-section>
      </q-card-section>
    </q-card>


    <q-card v-if="analis" id="check-container">
          <q-card-section>
            <q-card-title>
              Analysis 
            </q-card-title>
            <br/>
            <hr/>
            <q-card-section v-if="hasilKataTerbanyak.length > 0">
              
                The 5 most (interrelated) words:
                <ul>
                  <li v-for="(kata, index) in hasilKataTerbanyak" :key="index">
                    {{ kata.kata }} ({{ kata.frekuensi }})
                  </li>
                </ul>
            </q-card-section>
          </q-card-section>
        </q-card>

  </q-page>

</template>


<script>

import Swal from 'sweetalert2';

const URL = "http://localhost:3000/";
const API_URL = URL + "commands";

export default {
  data() {
    return {
      userInput: '',
      assistantResponse: '',
      keywords: [],
      isLoading: {
        sendChat: false,
        saveToNeo4j: false,
        clearConversation: false,
      },
      waktu: '',
      analysisItems: [],
      banyakKey : 0,
      hasilKataTerbanyak: [],

      analis: false,
      assisten: false,
      keyyy: false


    }
  },
  methods: {

    async sendChat() {
      try {
        this.isLoading.sendChat = true;
        const response = await fetch(API_URL+'/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'whyyougonnabesorude ' + localStorage.token,
          },
          body: JSON.stringify({ message: this.userInput }),
        });

        const data = await response.json();
        this.assistantResponse = data.assistantResponse;
        this.keywords = data.keywords;

        console.log(this.keywords);

        this.banyakKey = data.keywords.length;

        // Tampilkan waktu hari ini dengan format yang diinginkan
        const currentDate = new Date();
        const formattedDate = this.formatDate(currentDate);

        this.waktu = formattedDate;

        // Tampilkan SweetAlert
        this.showAlert('Berhasil Generate!', 'success', 'Success!');

      } catch (error) {
        console.error('Error sending chat:', error);
        this.showAlert(error, 'error', 'Gagal!');
        this.isLoading.sendChat = false; 
      } finally {
        this.isLoading.sendChat = false;  // Nonaktifkan loading setelah selesai

        this.analis= true;
        this.assisten= true;
        this.keyyy= true;
        
      }
    },

    async saveToNeo4j() {
      try {
        this.isLoading.saveToNeo4j = true;
        const response = await fetch(API_URL+'/saveToNeo4j', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'whyyougonnabesorude ' + localStorage.token,
          },
          body: JSON.stringify({ data: this.assistantResponse }),
          
        });

        const data = await response.json();


        const newItem = {
          respon: this.assistantResponse,
          waktu: this.waktu
        };

        // Tambahkan item baru ke dalam array
        this.analysisItems.push(newItem);

        
        // Tampilkan SweetAlert
        this.showAlert('Berhasil Simpan ke Neo4J!', 'success', 'Success!');

        // Lanjutkan dengan mendapatkan semua grafik setelah penyimpanan selesai
        this.getAllGraphs();

      } catch (error) {
        console.error('Error saving to Neo4j:', error);
        this.showAlert(error, 'error', 'Gagal!');
      } finally {
        this.isLoading.saveToNeo4j = false;  // Nonaktifkan loading setelah selesai
      }
    },

    async clearConversation() {
      this.isLoading.clearConversation = true;
      try {
        const response = await fetch(API_URL+'/clearConversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'whyyougonnabesorude ' + localStorage.token,
          },
        });

        const data = await response.json();

        // Reset userInput, assistantResponse, dan keywords
        this.userInput = '';
        this.assistantResponse = '';
        this.keywords = [];
        this.analysisItems = [];
        this.hasilKataTerbanyak = [];

        this.analis= false;
        this.assisten= false;
        this.keyyy= false;

        const container = document.getElementById('network-graph-container');
        // Hapus semua isi elemen
        container.innerHTML = '';

        // Inisialisasi ulang chart
        this.createNetworkGraph([]);

        // console.log('Clear conversation success:', data);
        // Tampilkan SweetAlert
        this.showAlert('Berhasil Clear Conversation!', 'success', 'Success!');

      } catch (error) {
        console.error('Error clearing conversation:', error);
        this.showAlert(error, 'error', 'Gagal!');
      } finally {
        this.isLoading.clearConversation = false;  // Nonaktifkan loading setelah selesai
      }
    },

    async getAllGraphs() {
      try {
        this.isLoading.allGraphs = true;

        // Panggil route di server Node.js untuk mendapatkan semua graph
        const response = await fetch(API_URL+'/allGraphs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'whyyougonnabesorude ' + localStorage.token,
          },
        });

        const data = await response.json();
        
        const mappedData = [];
        const banyakkk = [];

        
        for (let i = 0; i < data.graphData.length; i++) {
          const innerArray = data.graphData[i].nodes;
          const mappedInnerArray = [];
          
          for (let j = 0; j < innerArray.length; j++) {
            const innerItem = innerArray[j];
            mappedInnerArray.push(innerItem.name);
            banyakkk.push(innerItem.name);
          }
          
          mappedData.push(mappedInnerArray);
        }


      // console.log(mappedData);

        if (data.success) {


          this.createNetworkGraph(mappedData);

          this.cariDanUrutkanKataTerbanyak(banyakkk);

        } else {
          console.error('Failed to fetch all graphs:', data.message);
          this.showAlert(data.message, 'error', 'Gagal!');
        }
      } catch (error) {
        console.error('Error fetching all graphs:', error);

        // Tampilkan SweetAlert kesalahan
        this.showAlert(error, 'error', 'Gagal!');
      } finally {
        this.isLoading.allGraphs = false;
      }
    },

    createNetworkGraph(data) {
      Highcharts.chart('network-graph-container', {
        chart: {
          type: 'networkgraph',
          // height: window.innerHeight,
          height: '800px',
        },
        title: {
          text: 'Network Graph'
        },
        plotOptions: {
          networkgraph: {
            keys: ["from", "to"],
            layoutAlgorithm: {
              enableSimulation: true,
              integration: "verlet",
              linkLength: 100
            }
          }
        },
        

        series: [{
          data: data,
          dataLabels: {
            enabled: true,
            linkFormat: '',
            allowOverlap: true
          },
          keys: ['from', 'to'],
          marker: {
            radius: 30
          },
        }],

        exporting: {
          buttons: {
              contextButton: {
                  align: 'center',
                  x: 90,
                  y: -5
              }
          }
        }

      });
    },

    cariDanUrutkanKataTerbanyak(arrayKata) {
      // Membuat objek untuk melacak frekuensi kata
      const frekuensiKata = {};

      // Mengiterasi melalui setiap kata dalam array
      arrayKata.forEach((kata) => {
        kata = kata.trim().toLowerCase();
        frekuensiKata[kata] = (frekuensiKata[kata] || 0) + 1;
      });

      // Mengubah objek ke dalam array
      const arrayFrekuensi = [];
      for (let kata in frekuensiKata) {
        if (frekuensiKata.hasOwnProperty(kata)) {
          arrayFrekuensi.push({ kata, frekuensi: frekuensiKata[kata] });
        }
      }

      // Mengurutkan array berdasarkan frekuensi secara descending
      arrayFrekuensi.sort((a, b) => b.frekuensi - a.frekuensi);

      // Mengambil 5 kata terbanyak
      this.hasilKataTerbanyak = arrayFrekuensi.slice(0, 5);
    },
    

    // TAMBAHANN

    showAlert(message, iconx, judul) {
      Swal.fire({
        icon: iconx,
        title: judul,
        text: message,
        showConfirmButton: false,
        timer: 1500
      });
    },

    formatDate(date) {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const day = days[date.getDay()];
      const month = date.toLocaleString('default', { month: 'long' });
      const formattedTime = this.formatTime(date);

      return `${day}, ${date.getDate()} ${month} ${date.getFullYear()} || ${formattedTime}`;
    },
    formatTime(date) {
      const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return date.toLocaleTimeString('id-ID', options);
    },




  },

  mounted () {
    // Inisialisasi grafik pada saat mounted
    this.createNetworkGraph([]);
  },

  
  
}
</script>


<style scoped>
  /* Import file desain.css */
  @import "../styles/desain.css";
</style>

