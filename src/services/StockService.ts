// specialized service for stock market simulation
export interface Stock {
    symbol: string;
    price: number;
    change: number; // percentage
    up: boolean;
}

const INITIAL_STOCKS = [
    { symbol: 'IPC', price: 53420.15 },
    { symbol: 'DOW JONES', price: 34500.73 },
    { symbol: 'S&P 500', price: 4450.32 },
    { symbol: 'NASDAQ', price: 13890.20 },
    { symbol: 'USD/MXN', price: 17.05 },
    { symbol: 'EUR/USD', price: 1.09 },
    { symbol: 'ORO', price: 1950.40 },
    { symbol: 'PETROLEO', price: 80.50 },
    { symbol: 'CETES 28', price: 11.25 },
    { symbol: 'BITCOIN', price: 42000.00 }
];

export class StockService {
    private stocks: Stock[];

    constructor() {
        this.stocks = INITIAL_STOCKS.map(s => ({
            ...s,
            change: 0,
            up: true
        }));
    }

    getStocks(): Stock[] {
        return this.stocks;
    }

    // Simulate market movement with random walk
    updateMarket() {
        this.stocks = this.stocks.map(stock => {
            // Volatility depends on asset type typically, but simplified here
            const volatility = stock.price > 1000 ? 0.0002 : 0.0005;
            const changePercent = (Math.random() - 0.5) * volatility;
            const newPrice = stock.price * (1 + changePercent);

            // Accumulated change for the "day" (simplified as just change from last tick for visual effect)
            const displayChange = parseFloat((changePercent * 100).toFixed(2));

            return {
                symbol: stock.symbol,
                price: parseFloat(newPrice.toFixed(2)),
                change: displayChange,
                up: displayChange >= 0
            };
        });
        return this.stocks;
    }
}

export const stockService = new StockService();
