<template>
  <div id="app">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <header>
      <HeaderNavbar />
    </header>
    <router-view />
    <footer>
      <!-- <FooterNavbar /> -->
    </footer>
  </div>
</template>

<script>
import '@/common-styles.css';
import HeaderNavbar from './components/HeaderNavbar.vue';
// import FooterNavbar from './components/FooterNavbar.vue';
export default {
  name: 'App',
  components: {
    HeaderNavbar
    // FooterNavbar,
  }
};
</script>

<style>
  #app {
    font-family:
      'SimSun',
      'STSong',
      'KaiTi',
      'STKaiti',
      Georgia,
      Times New Roman,
      serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50; /* 3333333 */
  }
</style>
