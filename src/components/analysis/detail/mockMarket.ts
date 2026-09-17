import type { Instrument, InstrumentDetailData, MarketIndex } from "./types";

export type TaxonomyMarket = 'Stock' | 'Crypto' | 'Forex' | 'Commodity';
export type MarketTaxonomyEntry = { market: TaxonomyMarket; sector: string; subSector: string };

// CSV-derived coverage used to create deterministic demo instruments for every filter option.
export const marketTaxonomy: MarketTaxonomyEntry[] = [
 { market: 'Stock', sector: 'Technology', subSector: 'Software' }, { market: 'Stock', sector: 'Technology', subSector: 'Semiconductors' }, { market: 'Stock', sector: 'Technology', subSector: 'Hardware & Electronics' },
 { market: 'Stock', sector: 'Financials', subSector: 'Banks' }, { market: 'Stock', sector: 'Financials', subSector: 'Insurance' }, { market: 'Stock', sector: 'Financials', subSector: 'Capital Markets & Brokers' },
 { market: 'Stock', sector: 'Healthcare', subSector: 'Pharmaceuticals' }, { market: 'Stock', sector: 'Healthcare', subSector: 'Biotechnology' }, { market: 'Stock', sector: 'Healthcare', subSector: 'Medical Devices' },
 { market: 'Stock', sector: 'Consumer Cyclical', subSector: 'Automotive' }, { market: 'Stock', sector: 'Consumer Cyclical', subSector: 'Retail & E-commerce' }, { market: 'Stock', sector: 'Consumer Cyclical', subSector: 'Travel & Leisure' },
 { market: 'Stock', sector: 'Consumer Defensive', subSector: 'Food & Beverage' }, { market: 'Stock', sector: 'Consumer Defensive', subSector: 'Household & Personal Products' },
 { market: 'Stock', sector: 'Industrials', subSector: 'Aerospace & Defense' }, { market: 'Stock', sector: 'Industrials', subSector: 'Transportation & Logistics' }, { market: 'Stock', sector: 'Industrials', subSector: 'Machinery & Engineering' },
 { market: 'Stock', sector: 'Energy', subSector: 'Oil & Gas' }, { market: 'Stock', sector: 'Energy', subSector: 'Energy Equipment & Services' }, { market: 'Stock', sector: 'Utilities', subSector: 'Electric Utilities' },
 { market: 'Stock', sector: 'Real Estate', subSector: 'REITs' }, { market: 'Stock', sector: 'Basic Materials', subSector: 'Chemicals & Mining' },
 { market: 'Stock', sector: 'Communication Services', subSector: 'Telecom' }, { market: 'Stock', sector: 'Communication Services', subSector: 'Media & Entertainment' },
 { market: 'Crypto', sector: 'Currency / Payment', subSector: 'Store of Value' }, { market: 'Crypto', sector: 'Currency / Payment', subSector: 'Payments' }, { market: 'Crypto', sector: 'Smart Contract Platforms', subSector: 'Layer 1' }, { market: 'Crypto', sector: 'Scaling', subSector: 'Layer 2' },
 { market: 'Crypto', sector: 'DeFi', subSector: 'Decentralized Exchanges' }, { market: 'Crypto', sector: 'DeFi', subSector: 'Lending & Borrowing' }, { market: 'Crypto', sector: 'DeFi', subSector: 'Liquid Staking / Restaking' },
 { market: 'Crypto', sector: 'Stablecoins', subSector: 'Fiat-backed / Crypto-backed' }, { market: 'Crypto', sector: 'Exchange Tokens', subSector: 'CEX Ecosystem Tokens' }, { market: 'Crypto', sector: 'Oracle', subSector: 'Data Oracle Networks' },
 { market: 'Crypto', sector: 'AI & Data', subSector: 'AI / Compute / Data' }, { market: 'Crypto', sector: 'Gaming & Metaverse', subSector: 'Gaming / Virtual Worlds' }, { market: 'Crypto', sector: 'Meme', subSector: 'Meme Coins' }, { market: 'Crypto', sector: 'Privacy', subSector: 'Privacy Coins' }, { market: 'Crypto', sector: 'RWA', subSector: 'Real World Assets / Tokenization' }, { market: 'Crypto', sector: 'Infrastructure', subSector: 'Interoperability / Middleware' },
 { market: 'Forex', sector: 'Major', subSector: 'USD Major Pairs' }, { market: 'Forex', sector: 'Minor / Cross', subSector: 'EUR Crosses' }, { market: 'Forex', sector: 'Minor / Cross', subSector: 'GBP Crosses' }, { market: 'Forex', sector: 'Minor / Cross', subSector: 'JPY Crosses' },
 { market: 'Forex', sector: 'Exotic', subSector: 'Asia Emerging Markets' }, { market: 'Forex', sector: 'Exotic', subSector: 'EMEA Emerging Markets' }, { market: 'Forex', sector: 'Exotic', subSector: 'Latin America' }, { market: 'Forex', sector: 'Regional Basket', subSector: 'G10 Currencies' }, { market: 'Forex', sector: 'Regional Basket', subSector: 'Emerging Market FX' },
 { market: 'Commodity', sector: 'Energy', subSector: 'Crude Oil' }, { market: 'Commodity', sector: 'Energy', subSector: 'Natural Gas' }, { market: 'Commodity', sector: 'Energy', subSector: 'Refined Products' },
 { market: 'Commodity', sector: 'Precious Metals', subSector: 'Gold' }, { market: 'Commodity', sector: 'Precious Metals', subSector: 'Silver' }, { market: 'Commodity', sector: 'Precious Metals', subSector: 'Platinum Group' },
 { market: 'Commodity', sector: 'Industrial Metals', subSector: 'Copper' }, { market: 'Commodity', sector: 'Industrial Metals', subSector: 'Aluminum / Nickel / Zinc' }, { market: 'Commodity', sector: 'Agriculture', subSector: 'Grains' }, { market: 'Commodity', sector: 'Agriculture', subSector: 'Softs' }, { market: 'Commodity', sector: 'Agriculture', subSector: 'Oilseeds' }, { market: 'Commodity', sector: 'Livestock', subSector: 'Cattle' }, { market: 'Commodity', sector: 'Livestock', subSector: 'Hogs' },
];

export type StockCountry = { region: string; country: string; iso3: string; slug: string };

// TradingView stock-market coverage catalog supplied for the country filters.
const rows: [string, string, string, string][] = [
 ['North America','United States','USA','stocks-usa'], ['North America','Canada','CAN','stocks-canada'], ['North America','Mexico','MEX','stocks-mexico'],
 ['South America','Argentina','ARG','stocks-argentina'], ['South America','Brazil','BRA','stocks-brazil'], ['South America','Chile','CHL','stocks-chile'], ['South America','Colombia','COL','stocks-colombia'], ['South America','Peru','PER','stocks-peru'], ['South America','Venezuela','VEN','stocks-venezuela'],
 ['Europe','Austria','AUT','stocks-austria'], ['Europe','Belgium','BEL','stocks-belgium'], ['Europe','Bulgaria','BGR','stocks-bulgaria'], ['Europe','Croatia','HRV','stocks-croatia'], ['Europe','Cyprus','CYP','stocks-cyprus'], ['Europe','Czech Republic','CZE','stocks-czech'], ['Europe','Denmark','DNK','stocks-denmark'], ['Europe','Finland','FIN','stocks-finland'], ['Europe','France','FRA','stocks-france'], ['Europe','Germany','DEU','stocks-germany'], ['Europe','Greece','GRC','stocks-greece'], ['Europe','Hungary','HUN','stocks-hungary'], ['Europe','Iceland','ISL','stocks-iceland'], ['Europe','Ireland','IRL','stocks-ireland'], ['Europe','Italy','ITA','stocks-italy'], ['Europe','Luxembourg','LUX','stocks-luxembourg'], ['Europe','Netherlands','NLD','stocks-netherlands'], ['Europe','Norway','NOR','stocks-norway'], ['Europe','Poland','POL','stocks-poland'], ['Europe','Portugal','PRT','stocks-portugal'], ['Europe','Romania','ROU','stocks-romania'], ['Europe','Serbia','SRB','stocks-serbia'], ['Europe','Slovakia','SVK','stocks-slovakia'], ['Europe','Slovenia','SVN','stocks-slovenia'], ['Europe','Spain','ESP','stocks-spain'], ['Europe','Sweden','SWE','stocks-sweden'], ['Europe','Switzerland','CHE','stocks-switzerland'], ['Europe','Turkey','TUR','stocks-turkey'], ['Europe','United Kingdom','GBR','stocks-uk'],
 ['Middle East','Bahrain','BHR','stocks-bahrain'], ['Middle East','Israel','ISR','stocks-israel'], ['Middle East','Kuwait','KWT','stocks-kuwait'], ['Middle East','Qatar','QAT','stocks-qatar'], ['Middle East','Saudi Arabia','SAU','stocks-ksa'], ['Middle East','United Arab Emirates','ARE','stocks-uae'],
 ['Africa','Egypt','EGY','stocks-egypt'], ['Africa','Kenya','KEN','stocks-kenya'], ['Africa','Morocco','MAR','stocks-morocco'], ['Africa','Nigeria','NGA','stocks-nigeria'], ['Africa','South Africa','ZAF','stocks-south-africa'], ['Africa','Tunisia','TUN','stocks-tunisia'],
 ['Asia-Pacific','Australia','AUS','stocks-australia'], ['Asia-Pacific','Bangladesh','BGD','stocks-bangladesh'], ['Asia-Pacific','Mainland China','CHN','stocks-china'], ['Asia-Pacific','Hong Kong, China','HKG','stocks-hong-kong'], ['Asia-Pacific','India','IND','stocks-india'], ['Asia-Pacific','Indonesia','IDN','stocks-indonesia'], ['Asia-Pacific','Japan','JPN','stocks-japan'], ['Asia-Pacific','Malaysia','MYS','stocks-malaysia'], ['Asia-Pacific','New Zealand','NZL','stocks-new-zealand'], ['Asia-Pacific','Pakistan','PAK','stocks-pakistan'], ['Asia-Pacific','Philippines','PHL','stocks-philippines'], ['Asia-Pacific','Singapore','SGP','stocks-singapore'], ['Asia-Pacific','South Korea','KOR','stocks-korea'], ['Asia-Pacific','Sri Lanka','LKA','stocks-sri-lanka'], ['Asia-Pacific','Taiwan, China','TWN','stocks-taiwan'], ['Asia-Pacific','Thailand','THA','stocks-thailand'], ['Asia-Pacific','Vietnam','VNM','stocks-vietnam'],
];

export const stockCountries: StockCountry[] = rows.map(([region, country, iso3, slug]) => ({ region, country, iso3, slug }));

const seedInstruments:Instrument[]=[
 {symbol:'NVDA',name:'NVIDIA',market:'US Stocks',sector:'Technology',primaryMarket:'NASDAQ',region:'North America',country:'United States',subSector:'Semiconductors',price:138.85,change:3.42,volume:298.4,rvol:2.18,rsi:38.4,return1m:12.8,marketCap:3400,sentiment:78,signal:'LONG',confidence:82,pe:54.2},
 {symbol:'MSFT',name:'Microsoft',market:'US Stocks',sector:'Technology',primaryMarket:'NASDAQ',region:'North America',country:'United States',subSector:'Software',price:507.23,change:1.18,volume:22.1,rvol:1.72,rsi:42.1,return1m:6.4,marketCap:3770,sentiment:69,signal:'WATCH',confidence:68,pe:37.8},
 {symbol:'AAPL',name:'Apple',market:'US Stocks',sector:'Technology',primaryMarket:'NASDAQ',region:'North America',country:'United States',subSector:'Hardware & Electronics',price:231.34,change:.64,volume:51.2,rvol:1.58,rsi:39.7,return1m:5.7,marketCap:3490,sentiment:62,signal:'WATCH',confidence:64,pe:34.6},
 {symbol:'TSLA',name:'Tesla',market:'US Stocks',sector:'Consumer Cyclical',primaryMarket:'NASDAQ',region:'North America',country:'United States',subSector:'Automotive',price:332.41,change:-1.86,volume:110.6,rvol:1.91,rsi:56.8,return1m:-4.1,marketCap:1068,sentiment:43,signal:'NEUTRAL',confidence:51,pe:88.1},
 {symbol:'JPM',name:'JPMorgan Chase',market:'US Stocks',sector:'Financials',primaryMarket:'NYSE',region:'North America',country:'United States',subSector:'Banks',price:284.16,change:.88,volume:14.8,rvol:1.34,rsi:55.2,return1m:4.2,marketCap:810,sentiment:64,signal:'WATCH',confidence:62,pe:15.1},
 {symbol:'AMZN',name:'Amazon',market:'US Stocks',sector:'Consumer Cyclical',primaryMarket:'NASDAQ',region:'North America',country:'United States',subSector:'Retail & E-commerce',price:256.97,change:-.6,volume:29.4,rvol:1.46,rsi:49.8,return1m:2.9,marketCap:2770,sentiment:61,signal:'WATCH',confidence:63,pe:42.7},
 {symbol:'PTT',name:'PTT Public Company',market:'Stocks',sector:'Energy',primaryMarket:'SET',region:'Asia-Pacific',country:'Thailand',subSector:'Oil & Gas',price:31.25,change:-.42,volume:28.4,rvol:1.16,rsi:48.3,return1m:-1.7,marketCap:92,sentiment:46,signal:'NEUTRAL',confidence:45,pe:9.8},
 {symbol:'SHEL',name:'Shell',market:'Stocks',sector:'Energy',primaryMarket:'LSE',region:'Europe',country:'United Kingdom',subSector:'Oil & Gas',price:68.42,change:1.06,volume:9.8,rvol:1.28,rsi:57.6,return1m:3.8,marketCap:214,sentiment:59,signal:'WATCH',confidence:56,pe:11.4},
 {symbol:'BTC/USD',name:'Bitcoin',market:'Crypto',sector:'Currency / Payment',primaryMarket:'Crypto Spot',subSector:'Store of Value',price:108420,change:2.41,volume:48.7,rvol:1.86,rsi:47.1,return1m:8.9,marketCap:2150,sentiment:74,signal:'LONG',confidence:76},
 {symbol:'ETH/USD',name:'Ethereum',market:'Crypto',sector:'Smart Contract Platforms',primaryMarket:'Crypto Spot',subSector:'Layer 1',price:4371,change:3.16,volume:24.2,rvol:2.04,rsi:44.2,return1m:14.1,marketCap:527,sentiment:77,signal:'LONG',confidence:79},
 {symbol:'SOL/USD',name:'Solana',market:'Crypto',sector:'Smart Contract Platforms',primaryMarket:'Crypto Spot',subSector:'Layer 1',price:248.4,change:4.28,volume:18.9,rvol:2.31,rsi:58.7,return1m:21.6,marketCap:118,sentiment:81,signal:'LONG',confidence:78},
 {symbol:'BNB/USD',name:'BNB',market:'Crypto',sector:'Exchange Tokens',primaryMarket:'Crypto Spot',subSector:'CEX Ecosystem Tokens',price:982.4,change:1.82,volume:6.8,rvol:1.62,rsi:55.8,return1m:11.7,marketCap:142,sentiment:72,signal:'LONG',confidence:69},
 {symbol:'XRP/USD',name:'XRP',market:'Crypto',sector:'Currency / Payment',primaryMarket:'Crypto Spot',subSector:'Payments',price:2.47,change:2.54,volume:13.2,rvol:2.08,rsi:59.2,return1m:18.4,marketCap:146,sentiment:76,signal:'LONG',confidence:73},
 {symbol:'UNI/USD',name:'Uniswap',market:'Crypto',sector:'DeFi',primaryMarket:'Crypto Spot',subSector:'Decentralized Exchanges',price:12.84,change:1.74,volume:4.6,rvol:1.72,rsi:53.4,return1m:8.2,marketCap:7.7,sentiment:67,signal:'WATCH',confidence:64},
 {symbol:'DOGE/USD',name:'Dogecoin',market:'Crypto',sector:'Meme',primaryMarket:'Crypto Spot',subSector:'Meme Coins',price:.184,change:-1.12,volume:9.8,rvol:1.94,rsi:42.6,return1m:-3.1,marketCap:26,sentiment:48,signal:'NEUTRAL',confidence:42},
 {symbol:'EUR/USD',name:'Euro / US Dollar',market:'Forex',sector:'Major',primaryMarket:'FX Spot',subSector:'USD Major Pairs',price:1.1692,change:.34,volume:18.3,rvol:1.22,rsi:61.2,return1m:2.1,marketCap:80,sentiment:58,signal:'WATCH',confidence:59,fxCategory:'Major'},
 {symbol:'USD/JPY',name:'US Dollar / Yen',market:'Forex',sector:'Major',primaryMarket:'FX Spot',subSector:'USD Major Pairs',price:147.12,change:-.48,volume:15.1,rvol:1.41,rsi:43.7,return1m:-1.8,marketCap:72,sentiment:45,signal:'NEUTRAL',confidence:48,fxCategory:'Major'},
 {symbol:'GBP/USD',name:'British Pound / US Dollar',market:'Forex',sector:'Major',primaryMarket:'FX Spot',subSector:'USD Major Pairs',price:1.3421,change:.21,volume:11.4,rvol:1.18,rsi:56.3,return1m:1.4,marketCap:64,sentiment:56,signal:'WATCH',confidence:57,fxCategory:'Major'},
 {symbol:'AUD/USD',name:'Australian Dollar / US Dollar',market:'Forex',sector:'Major',primaryMarket:'FX Spot',subSector:'USD Major Pairs',price:.7231,change:.19,volume:10.7,rvol:1.12,rsi:54.1,return1m:1.1,marketCap:59,sentiment:55,signal:'WATCH',confidence:53,fxCategory:'Major'},
 {symbol:'USD/CHF',name:'US Dollar / Swiss Franc',market:'Forex',sector:'Major',primaryMarket:'FX Spot',subSector:'USD Major Pairs',price:.8034,change:-.16,volume:9.2,rvol:1.09,rsi:47.6,return1m:-.9,marketCap:52,sentiment:49,signal:'NEUTRAL',confidence:46,fxCategory:'Major'},
 {symbol:'EUR/GBP',name:'Euro / British Pound',market:'Forex',sector:'Minor / Cross',primaryMarket:'FX Spot',subSector:'EUR Crosses',price:.8712,change:.12,volume:6.1,rvol:1.04,rsi:52.8,return1m:.6,marketCap:31,sentiment:53,signal:'NEUTRAL',confidence:44,fxCategory:'Minor'},
 {symbol:'AUD/CAD',name:'Australian Dollar / Canadian Dollar',market:'Forex',sector:'Minor / Cross',primaryMarket:'FX Spot',subSector:'GBP Crosses',price:.9128,change:.27,volume:4.8,rvol:1.14,rsi:58.1,return1m:1.9,marketCap:24,sentiment:57,signal:'WATCH',confidence:52,fxCategory:'Minor'},
 {symbol:'NZD/JPY',name:'New Zealand Dollar / Yen',market:'Forex',sector:'Minor / Cross',primaryMarket:'FX Spot',subSector:'JPY Crosses',price:88.42,change:-.31,volume:3.6,rvol:1.02,rsi:41.9,return1m:-2.3,marketCap:18,sentiment:41,signal:'NEUTRAL',confidence:39,fxCategory:'Minor'},
 {symbol:'USD/TRY',name:'US Dollar / Turkish Lira',market:'Forex',sector:'Exotic',primaryMarket:'FX Spot',subSector:'EMEA Emerging Markets',price:34.18,change:1.62,volume:2.9,rvol:1.64,rsi:66.4,return1m:6.8,marketCap:9,sentiment:31,signal:'LONG',confidence:61,fxCategory:'Exotic'},
 {symbol:'USD/ZAR',name:'US Dollar / South African Rand',market:'Forex',sector:'Exotic',primaryMarket:'FX Spot',subSector:'EMEA Emerging Markets',price:17.92,change:-.84,volume:2.1,rvol:1.38,rsi:38.2,return1m:-3.6,marketCap:7,sentiment:36,signal:'WATCH',confidence:47,fxCategory:'Exotic'},
 {symbol:'USD/MXN',name:'US Dollar / Mexican Peso',market:'Forex',sector:'Exotic',primaryMarket:'FX Spot',subSector:'Latin America',price:18.61,change:.46,volume:2.4,rvol:1.21,rsi:54.7,return1m:2.7,marketCap:8,sentiment:52,signal:'NEUTRAL',confidence:43,fxCategory:'Exotic'},
 {symbol:'XAU/USD',name:'Gold Spot',market:'Commodity',sector:'Precious Metals',primaryMarket:'COMEX',subSector:'Gold',price:3456.8,change:.73,volume:12.8,rvol:1.36,rsi:52.5,return1m:4.6,marketCap:2400,sentiment:67,signal:'WATCH',confidence:65},
 {symbol:'XAG/USD',name:'Silver Spot',market:'Commodity',sector:'Precious Metals',primaryMarket:'COMEX',subSector:'Silver',price:39.42,change:1.14,volume:9.4,rvol:1.48,rsi:57.3,return1m:7.8,marketCap:1320,sentiment:69,signal:'LONG',confidence:67},
 {symbol:'WTI/USD',name:'WTI Crude Oil',market:'Commodity',sector:'Energy',primaryMarket:'NYMEX',subSector:'Crude Oil',price:68.42,change:-.91,volume:26.4,rvol:1.58,rsi:44.8,return1m:-2.4,marketCap:1850,sentiment:42,signal:'NEUTRAL',confidence:49},
 {symbol:'BRENT/USD',name:'Brent Crude Oil',market:'Commodity',sector:'Energy',primaryMarket:'ICE',subSector:'Crude Oil',price:72.18,change:-.64,volume:21.6,rvol:1.43,rsi:46.7,return1m:-1.6,marketCap:1960,sentiment:45,signal:'NEUTRAL',confidence:51},
 {symbol:'NATGAS/USD',name:'Natural Gas',market:'Commodity',sector:'Energy',primaryMarket:'NYMEX',subSector:'Natural Gas',price:2.8811,change:-1.2,volume:14.2,rvol:1.67,rsi:39.4,return1m:-4.8,marketCap:740,sentiment:35,signal:'WATCH',confidence:55},
 {symbol:'CORN/USD',name:'Corn Futures',market:'Commodity',sector:'Agriculture',primaryMarket:'CBOT',subSector:'Grains',price:462.25,change:.38,volume:7.1,rvol:1.17,rsi:51.6,return1m:1.2,marketCap:620,sentiment:54,signal:'WATCH',confidence:48},
 {symbol:'ADA/USD',name:'Cardano',market:'Crypto',sector:'Smart Contract Platforms',primaryMarket:'Crypto Spot',subSector:'Layer 1',price:.82,change:6.93,volume:8.4,rvol:1.94,rsi:61.3,return1m:18.2,marketCap:29,sentiment:73,signal:'LONG',confidence:71},
];

const taxonomyDemoInstruments: Instrument[] = marketTaxonomy.map((entry, index) => ({
 symbol: ['CRM','AMD','ORCL','ADBE','AVGO','BAC','GS','CME','PFE','AMGN','REGN','ABT','SYK','F','HD','BKNG','KO','PG','BA','UPS','CAT','XOM','SLB','NEE','PLD','RIO','VZ','NFLX','ARB/USD','AAVE/USD','LDO/USD','USDT/USD','LINK/USD','FET/USD','IMX/USD','XMR/USD','ONDO/USD','DOT/USD','EUR/JPY','EUR/AUD','GBP/JPY','GBP/AUD','AUD/JPY','USD/THB','USD/SGD','USD/CNH','USD/INR','USD/PLN','USD/HUF','USD/BRL','USD/CLP','DXY','CL1!','NG1!','RB1!','GC1!','SI1!','PL1!','HG1!','ALI1!','ZC1!','KC1!','ZS1!','LE1!','HE1!'][index % 64],
 name: `${entry.subSector} Basket`,
 market: entry.market === 'Stock' ? 'Stocks' : entry.market,
 region: entry.market === 'Stock' ? stockCountries[index % stockCountries.length].region : undefined,
 country: entry.market === 'Stock' ? stockCountries[index % stockCountries.length].country : undefined,
 sector: entry.sector,
 subSector: entry.subSector,
 primaryMarket: entry.market === 'Stock' ? 'NASDAQ' : entry.market === 'Crypto' ? 'Crypto Spot' : entry.market === 'Forex' ? 'FX Spot' : 'COMEX',
 price: Number((25 + index * 7.35).toFixed(4)), change: Number((((index % 9) - 4) * .27).toFixed(2)), volume: 4 + index * .6, rvol: 1 + (index % 8) * .14, rsi: 38 + (index % 25), return1m: Number((((index % 11) - 3) * 1.15).toFixed(2)), marketCap: 18 + index * 12, sentiment: 45 + (index % 40), signal: index % 3 === 0 ? 'LONG' : index % 3 === 1 ? 'WATCH' : 'NEUTRAL', confidence: 45 + (index % 45), fxCategory: entry.market === 'Forex' ? entry.sector === 'Major' ? 'Major' : entry.sector === 'Minor / Cross' ? 'Minor' : 'Exotic' : undefined, pe: entry.market === 'Stock' ? 12 + (index % 35) : undefined,
}));

export const instruments: Instrument[] = [...seedInstruments, ...taxonomyDemoInstruments];

const detailFactors = (instrument: Instrument): InstrumentDetailData['factors'] => {
 if (instrument.market === 'Forex') return [{ label: 'Base currency', value: instrument.symbol.split('/')[0] }, { label: 'Quote currency', value: instrument.symbol.split('/')[1] }, { label: 'Classification', value: instrument.fxCategory ?? 'Major' }, { label: 'Interest-rate differential', value: `${(instrument.change * 0.42).toFixed(2)}%` }, { label: 'Pip value', value: '$10 / standard lot' }, { label: 'Central-bank driver', value: 'Policy rate spread' }, { label: 'Economic calendar', value: 'CPI · rates · employment' }];
 if (instrument.market === 'Crypto') return [{ label: 'Network', value: instrument.subSector === 'Payments' ? 'XRPL' : `${instrument.name} network` }, { label: 'Circulating supply', value: `${(instrument.marketCap * 9.4).toFixed(1)}M units` }, { label: 'Total supply', value: 'Protocol-defined' }, { label: 'Fully diluted value', value: `$${(instrument.marketCap * 1.18).toFixed(1)}B` }, { label: 'Funding rate', value: `${(instrument.change * 0.018).toFixed(3)}%` }, { label: 'Open interest', value: `$${(instrument.volume * 0.74).toFixed(1)}B` }, { label: 'Liquidations 24h', value: `$${(instrument.volume * 0.021).toFixed(1)}B` }];
 if (instrument.market === 'Commodity') return [{ label: 'Contract family', value: instrument.subSector ?? 'Metals' }, { label: 'Production / inventory', value: 'Inventory series' }, { label: 'Inventory change', value: `${instrument.change >= 0 ? '+' : ''}${(instrument.change * 0.7).toFixed(2)}%` }, { label: 'Spot / futures spread', value: `${(instrument.change * 0.11).toFixed(2)}%` }, { label: 'Seasonality', value: 'Monthly pattern' }, { label: 'Macro drivers', value: 'USD · rates · supply' }];
 if (instrument.market === 'US Stocks' || instrument.market === 'Stocks') return [{ label: 'Sector', value: instrument.sector }, { label: 'Sub-sector', value: instrument.subSector ?? 'Unclassified' }, { label: 'Market cap', value: `$${instrument.marketCap}B` }, { label: 'P/E ratio', value: `${instrument.pe ?? 0}×` }, { label: 'EPS growth', value: `${(instrument.return1m * 1.8).toFixed(1)}%` }, { label: 'Dividend yield', value: `${Math.max(0, instrument.change * 0.18).toFixed(2)}%` }, { label: 'Analyst rating', value: instrument.signal === 'LONG' ? 'Strong buy' : 'Hold' }];
 return [{ label: 'Index family', value: instrument.name }, { label: 'Constituents', value: 'Constituent basket' }, { label: 'Sector breadth', value: instrument.change >= 0 ? 'Advancing' : 'Declining' }, { label: 'Market breadth', value: `${Math.round(48 + instrument.change * 4)}% positive` }, { label: 'Major contributors', value: 'Technology · Finance' }, { label: 'Major detractors', value: 'Energy · Utilities' }];
};

export const instrumentDetailData: Record<string, InstrumentDetailData> = Object.fromEntries(instruments.map(instrument => {
 const spread = Math.max(Math.abs(instrument.change) * 0.08, instrument.price * 0.0015);
 return [instrument.symbol, { quoteCurrency: instrument.market === 'Forex' ? instrument.symbol.split('/')[1] : 'USD', unit: instrument.market === 'Forex' ? 'quote' : instrument.market === 'Commodity' ? 'USD / unit' : instrument.market === 'Crypto' ? 'USD / coin' : 'points / share', dataSource: 'Marketsyde Market Data', marketStatus: instrument.market === 'Crypto' ? 'Open 24/7' : instrument.market === 'Forex' ? 'Open 24/5' : 'Open', open: instrument.price - instrument.change * 0.12, previousClose: instrument.price - instrument.change * 0.2, dayLow: instrument.price - spread, dayHigh: instrument.price + spread, historicalLow: instrument.price * 0.58, historicalHigh: instrument.price * 1.34, volumeType: instrument.market === 'Forex' ? 'Provider tick volume' : instrument.market === 'Crypto' ? '24h trading volume' : instrument.market === 'Commodity' ? 'Contracts / volume' : 'Shares / units traded', performance1d: instrument.change, performance1w: instrument.change * 1.8, performance1m: instrument.return1m, performance6m: instrument.return1m * 3.8, performanceYtd: instrument.return1m * 4.6, performance1y: instrument.return1m * 7.4, factors: detailFactors(instrument) } as InstrumentDetailData];
}));

// Global index benchmarks with sector-level breadth, used by the Market Indices screener.
export const marketIndices:MarketIndex[]=[
 {symbol:'SPX',name:'S&P 500',region:'United States',price:6842.15,change:.58,status:'Top Gainer',signal:'LONG',confidence:74,sectors:[
  {sector:'Tech',change:1.42},{sector:'Consumer',change:.61},{sector:'Healthcare',change:-.28},{sector:'Communication',change:.85},{sector:'Finance',change:.34},{sector:'Industrials',change:-.12},{sector:'Energy',change:-1.06},{sector:'Utilities',change:.19},
 ]},
 {symbol:'NDX',name:'Nasdaq 100',region:'United States',price:25840.32,change:1.24,status:'Top Gainer',signal:'LONG',confidence:81,sectors:[
  {sector:'Tech',change:2.18},{sector:'Consumer',change:.94},{sector:'Healthcare',change:-.41},{sector:'Communication',change:1.36},{sector:'Finance',change:.22},{sector:'Industrials',change:.08},{sector:'Energy',change:-.67},{sector:'Utilities',change:-.05},
 ]},
 {symbol:'DJI',name:'Dow Jones Industrial Average',region:'United States',price:47215.6,change:.12,status:'Neutral',signal:'WATCH',confidence:58,sectors:[
  {sector:'Tech',change:.44},{sector:'Consumer',change:.21},{sector:'Healthcare',change:.09},{sector:'Communication',change:-.18},{sector:'Finance',change:.62},{sector:'Industrials',change:.31},{sector:'Energy',change:-.84},{sector:'Utilities',change:.27},
 ]},
 {symbol:'UKX',name:'FTSE 100',region:'United Kingdom',price:9384.7,change:-.34,status:'Top Loser',signal:'WATCH',confidence:54,sectors:[
  {sector:'Tech',change:-.62},{sector:'Consumer',change:-.18},{sector:'Healthcare',change:.24},{sector:'Communication',change:-.47},{sector:'Finance',change:-.71},{sector:'Industrials',change:-.29},{sector:'Energy',change:.38},{sector:'Utilities',change:-.11},
 ]},
 {symbol:'US100C',name:'US Tech 100 Cash',region:'United States',price:25792.1,change:1.31,status:'New High',signal:'LONG',confidence:79,sectors:[
  {sector:'Tech',change:2.34},{sector:'Consumer',change:1.02},{sector:'Healthcare',change:-.36},{sector:'Communication',change:1.48},{sector:'Finance',change:.29},{sector:'Industrials',change:.14},{sector:'Energy',change:-.58},{sector:'Utilities',change:-.02},
 ]},
 {symbol:'NIFTY50',name:'India 50',region:'India',price:26140.85,change:-.92,status:'Top Loser',signal:'NEUTRAL',confidence:45,sectors:[
  {sector:'Tech',change:-1.18},{sector:'Consumer',change:-.42},{sector:'Healthcare',change:.16},{sector:'Communication',change:-.64},{sector:'Finance',change:-1.34},{sector:'Industrials',change:-.53},{sector:'Energy',change:.21},{sector:'Utilities',change:-.08},
 ]},
 {symbol:'DAX',name:'DAX 40',region:'Germany',price:24618.4,change:.21,status:'Neutral',signal:'WATCH',confidence:51,sectors:[
  {sector:'Tech',change:.38},{sector:'Consumer',change:.14},{sector:'Healthcare',change:-.06},{sector:'Communication',change:.09},{sector:'Finance',change:.47},{sector:'Industrials',change:.62},{sector:'Energy',change:-.29},{sector:'Utilities',change:.11},
 ]},
 {symbol:'N225',name:'Nikkei 225',region:'Japan',price:52318.9,change:-1.48,status:'New Low',signal:'WATCH',confidence:63,sectors:[
  {sector:'Tech',change:-2.04},{sector:'Consumer',change:-.88},{sector:'Healthcare',change:-.31},{sector:'Communication',change:-1.12},{sector:'Finance',change:-1.67},{sector:'Industrials',change:-.94},{sector:'Energy',change:.42},{sector:'Utilities',change:-.19},
 ]},
];

export const candles=Array.from({length:40},(_,i)=>{const drift=i*1.05+Math.sin(i/3)*8;return {t:i,price:102+drift+(i>26?i-26:0)*1.2,volume:30+Math.abs(Math.sin(i*.7))*38,rsi:36+Math.sin(i/4)*13+i*.2};});

// Deterministic OHLCV demo series used by the technical chart workspace.
export const technicalBars=Array.from({length:84},(_,i)=>{
 const base=118+i*.31+Math.sin(i/4.8)*4.1+Math.cos(i/11)*2.4+(i>54?(i-54)*.14:0);
 const open=base+Math.sin(i*1.7)*1.25;
 const close=base+Math.cos(i*1.31)*1.35;
 const high=Math.max(open,close)+.75+Math.abs(Math.sin(i*.83))*1.15;
 const low=Math.min(open,close)-.72-Math.abs(Math.cos(i*.77))*1.05;
 const volume=28+Math.abs(Math.sin(i*.54))*52+(i%13===0?24:0);
 const rsi=49+Math.sin(i/6.1)*17+Math.cos(i/13)*6;
 const macd=Math.sin(i/7)*2.2+(i-42)*.018;
 const signal=Math.sin((i-3)/7)*1.8+(i-42)*.016;
 return {time:`${String(9+Math.floor(i/12)).padStart(2,'0')}:${String((i%12)*5).padStart(2,'0')}`,open,high,low,close,volume,rsi,macd,signal,delta:(close-open)*volume*9};
});

export const mockNews=[
 {time:'10:42',source:'Reuters',headline:'Chip shares lead as AI infrastructure demand broadens',impact:'HIGH'},
 {time:'09:18',source:'Marketsyde AI',headline:'Relative volume moved into the top decile of its 20-day range',impact:'MED'},
 {time:'Yesterday',source:'SEC filing',headline:'Institutional ownership update detected for NVDA',impact:'LOW'},
];

export const mockOrderBook={
 asks:[[139.18,840],[139.12,1260],[139.05,920],[138.98,1670]],
 bids:[[138.84,1880],[138.78,1320],[138.70,2140],[138.62,980]],
};
