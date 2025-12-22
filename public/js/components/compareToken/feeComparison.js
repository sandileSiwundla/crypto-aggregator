// Default fee data for Aster and Hyperliquid
export const getDefaultFeeData = () => {
    return {
        'ASTER': {
            name: 'Aster',
            symbol: 'ASTER',
            description: 'Decentralized Perpetuals Exchange (Multi-Chain Aggregator)',
            feeRevenue24h: 25300000,      // $25.3M
            feeRevenue7d: 93500000,       // $93.5M
            makerFee: 0.005,              // 0.5% maker fee
            takerFee: 0.035,              // 3.5% taker fee
            feeDiscountInfo: '5% fee reduction when paying with ASTER tokens',
            recentVolume7d: 228000000000, // $228B trading volume in last 7 days
            note: 'Recently topped DeFi protocol fee rankings with high trading activity.',
            logo: '/tokens/aster.png'
        },
        'HYPE': {
            name: 'Hyperliquid',
            symbol: 'HYPE',
            description: 'On-Chain Order Book DEX (Layer 1)',
            feeRevenue24h: 3170000,       // $3.17M
            feeRevenue7d: null,
            makerFee: 0.0001,             // 0.01% maker fee
            takerFee: 0.035,              // 3.5% taker fee
            feeDiscountInfo: 'HIP-3 Growth Mode slashes taker fees by 90%+ for high-volume traders',
            recentVolume7d: 80500000000,  // $80.5B trading volume in last 7 days
            note: 'Focused on professional traders with fee recycling into HYPE token buybacks and burns.',
            logo: '/tokens/hyperliquid.png'
        }
    };
};
