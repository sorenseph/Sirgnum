<script setup lang="ts">
import { ref, onMounted } from 'vue';

const indices = ref([
  { name: 'S&P/BMV IPC', value: 57421.30, change: 0.45, up: true, chartData: [40, 45, 42, 48, 55, 52, 58, 60, 57, 62] },
  { name: 'S&P 500', value: 5088.80, change: 0.03, up: true, chartData: [50, 52, 51, 54, 53, 56, 58, 57, 59, 60] },
  { name: 'NASDAQ', value: 15996.82, change: -0.28, up: false, chartData: [60, 58, 59, 56, 54, 55, 52, 53, 50, 48] },
  { name: 'DOW JONES', value: 39131.53, change: 0.16, up: true, chartData: [45, 46, 47, 46, 48, 49, 50, 51, 51, 52] },
  { name: 'USD/MXN', value: 17.08, change: -0.12, up: true, chartData: [55, 54, 53, 52, 51, 52, 51, 50, 49, 48] }, // Appreciation is good for peso, but change is negative number
]);

const getPath = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 100;
    const step = width / (data.length - 1);

    const points = data.map((val, index) => {
        const x = index * step;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    });

    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
};

const getLinePath = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 100;
    const step = width / (data.length - 1);

    const points = data.map((val, index) => {
        const x = index * step;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-screen-xl mx-auto px-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumen de Mercado</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div v-for="index in indices" :key="index.name" class="flex flex-col p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="block text-xs font-bold text-gray-400">{{ index.name }}</span>
                        <span class="block text-lg font-bold text-gray-900 dark:text-white">{{ index.value.toLocaleString() }}</span>
                    </div>
                    <span :class="index.change > 0 || (index.name === 'USD/MXN' && index.change < 0) ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-500 bg-red-100 dark:bg-red-900/30'" class="text-xs font-bold px-2 py-0.5 rounded">
                        {{ index.change > 0 ? '+' : '' }}{{ index.change }}%
                    </span>
                </div>
                
                <!-- Mini Chart -->
                <div class="h-10 w-full relative">
                    <svg viewBox="0 0 100 40" class="w-full h-full overflow-visible" preserveAspectRatio="none">
                         <!-- Gradient Defs -->
                        <defs>
                            <linearGradient :id="`gradient-${index.name}`" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" :stop-color="index.up ? '#10B981' : '#EF4444'" stop-opacity="0.2"/>
                                <stop offset="100%" :stop-color="index.up ? '#10B981' : '#EF4444'" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <!-- Area -->
                        <path :d="getPath(index.chartData)" :fill="`url(#gradient-${index.name})`" class="opacity-50" />
                        <!-- Line -->
                        <path :d="getLinePath(index.chartData)" fill="none" :stroke="index.up ? '#10B981' : '#EF4444'" stroke-width="2" vector-effect="non-scaling-stroke" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
