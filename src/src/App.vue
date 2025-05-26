<template>
  <header>
    <!-- Hero Section -->
    <div class="hero-section bg-gradient-to-br from-blue-600 to-purple-700 text-white py-8">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <div class="flex justify-content-center align-items-center mb-4">
            <i class="pi pi-shield text-6xl text-blue-100 mr-3"></i>
            <div>
              <h1 class="text-5xl font-bold mb-2">AI Phishing Detection</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <main>
    <PhishingDetection />
  </main>
  <footer>
  </footer>

</template>

<script>
import PhishingDetection from './components/PhishingDetection.vue';

export default {
  name: 'App',
  components: {
    PhishingDetection
  }
};
</script>

<style>
html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.app-footer {
  flex-shrink: 0;
}
</style>
