<script setup lang="ts">
import HeroSection from '../components/HeroSection.vue'
import ServicesSection from '../components/ServicesSection.vue'
import NewsletterForm from '../components/NewsletterForm.vue'
import StockTicker from '../components/StockTicker.vue'
import MarketOverview from '../components/MarketOverview.vue'
import LatestReportsCarousel from '../components/LatestReportsCarousel.vue'
import AboutSignumSection from '../components/AboutSignumSection.vue'
</script>

<template>
  <div>
    <StockTicker />
    <HeroSection />
    <MarketOverview />
    <AboutSignumSection />
    <ServicesSection />
    <LatestReportsCarousel />
    <NewsletterForm />
  </div>
</template>
