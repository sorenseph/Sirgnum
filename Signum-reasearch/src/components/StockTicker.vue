<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { stockService } from '../services/StockService';
import type { Stock } from '../services/StockService';

const stocks = ref<Stock[]>([]);
let intervalId: number | null = null;

const updateStocks = () => {
    stocks.value = stockService.updateMarket();
};

onMounted(() => {
    stocks.value = stockService.getStocks();
    // Update more frequently for "live" feel
    intervalId = window.setInterval(updateStocks, 3000);
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="bg-gray-900 text-white overflow-hidden py-2 border-b border-gray-800 sticky top-16 z-40">
    <!-- Double the list for seamless infinite scroll -->
    <div class="flex animate-marquee hover:pause-animation whitespace-nowrap">
      <div v-for="i in 2" :key="i" class="flex">
          <div v-for="(stock, index) in stocks" :key="`${i}-${stock.symbol}`" class="mx-6 flex items-center space-x-2">
            <span class="font-bold text-emerald-400">{{ stock.symbol }}</span>
            <span class="font-mono w-20 text-right">{{ stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            <span :class="stock.up ? 'text-green-400' : 'text-red-400'" class="text-xs flex items-center w-16 justify-end">
              <svg v-if="stock.up" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path></svg>
              <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 4.293 5.879a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"></path></svg>
              {{ stock.change > 0 ? '+' : '' }}{{ stock.change }}%
            </span>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 40s linear infinite;
  display: flex;
}

.pause-animation:hover {
    animation-play-state: paused;
}
</style>
