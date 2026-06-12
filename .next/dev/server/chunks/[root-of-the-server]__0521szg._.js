module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/single/[cryptoName]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
async function GET(request, { params }) {
    try {
        // Await params in Next.js 15+
        const { cryptoName } = await params;
        const searchName = cryptoName.toLowerCase();
        console.log('Fetching crypto:', searchName);
        // 1️⃣ Fetch all listings
        const listingsResponse = await fetch(`${BASE_URL}/cryptocurrency/listings/latest?limit=5000`, {
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY
            },
            next: {
                revalidate: 60
            } // Cache for 60 seconds
        });
        if (!listingsResponse.ok) {
            throw new Error(`Listings API failed: ${listingsResponse.status}`);
        }
        const listingsData = await listingsResponse.json();
        if (!listingsData?.data) {
            throw new Error('No data from CoinMarketCap');
        }
        // Find the cryptocurrency
        const crypto = listingsData.data.find((coin)=>coin.name?.toLowerCase() === searchName || coin.symbol?.toLowerCase() === searchName);
        if (!crypto) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Cryptocurrency "${cryptoName}" not found`
            }, {
                status: 404
            });
        }
        // 2️⃣ Fetch quote and info in parallel
        const [quoteRes, infoRes] = await Promise.all([
            fetch(`${BASE_URL}/cryptocurrency/quotes/latest?id=${crypto.id}&convert=USD`, {
                headers: {
                    'X-CMC_PRO_API_KEY': API_KEY
                }
            }),
            fetch(`${BASE_URL}/cryptocurrency/info?id=${crypto.id}`, {
                headers: {
                    'X-CMC_PRO_API_KEY': API_KEY
                }
            })
        ]);
        if (!quoteRes.ok || !infoRes.ok) {
            throw new Error('Failed to fetch quote or info');
        }
        const quoteData = await quoteRes.json();
        const infoData = await infoRes.json();
        // 3️⃣ Fetch ZAR exchange rate
        let usdToZar = null;
        try {
            const zarRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR');
            const zarData = await zarRes.json();
            usdToZar = zarData?.rates?.ZAR ?? null;
        } catch (err) {
            console.warn('Could not fetch ZAR rate:', err);
        }
        // Combine the data
        const coinData = {
            ...quoteData.data[crypto.id],
            ...infoData.data[crypto.id]
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            coin: coinData,
            usdToZar
        });
    } catch (error) {
        console.error('API Error:', error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch crypto data',
            details: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0521szg._.js.map