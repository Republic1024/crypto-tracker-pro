"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bell, Sun, Moon, TrendingUp, TrendingDown, Star, Calculator, Newspaper, Zap } from 'lucide-react';

// TypeScript Type Definitions
interface CryptoData {
  price: number;
  change: number;
  volume: string;
  marketCap: string;
}

interface CryptoDataMap {
  [key: string]: CryptoData;
}

interface Alert {
  id: number;
  symbol: string;
  price: number;
  type: 'above' | 'below';
  timestamp: string;
}

interface Holding {
  id: number;
  symbol: string;
  amount: number;
  buyPrice: number;
  value: number;
  timestamp: string;
}

interface PriceHistoryPoint {
    time: string;
    [key: string]: number | string;
}

const CryptoTracker = () => {
  // Component State
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [alertPrice, setAlertPrice] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [addAmount, setAddAmount] = useState('');
  const [activeTab, setActiveTab] = useState('tracker');
  
  // Simulated cryptocurrency data
  const [cryptoData, setCryptoData] = useState<CryptoDataMap>({
    BTC: { price: 43250.50, change: 2.5, volume: '23.4B', marketCap: '845B' },
    ETH: { price: 2650.25, change: -1.2, volume: '12.8B', marketCap: '318B' },
    BNB: { price: 310.75, change: 3.8, volume: '1.2B', marketCap: '47B' },
    SOL: { price: 98.40, change: 5.2, volume: '2.1B', marketCap: '42B' },
    ADA: { price: 0.485, change: -0.8, volume: '520M', marketCap: '17B' },
    XRP: { price: 0.52, change: 1.5, volume: '1.8B', marketCap: '28B' },
    DOT: { price: 7.25, change: 2.1, volume: '180M', marketCap: '9B' },
    AVAX: { price: 36.80, change: 4.3, volume: '320M', marketCap: '14B' },
    LINK: { price: 14.90, change: -2.1, volume: '420M', marketCap: '8B' },
    MATIC: { price: 0.85, change: 6.7, volume: '310M', marketCap: '8B' }
  });

  // Historical price data (simulated)
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);

  // AI Recommendation Algorithm: Get top 5 recommendations
  const getTopRecommendations = () => {
    const cryptos = Object.entries(cryptoData);
    
    // Scoring algorithm: considers price change, volume, and market cap
    const scoredCryptos = cryptos.map(([symbol, data]) => {
      const volumeScore = parseFloat(data.volume.replace(/[^0-9.]/g, ''));
      const marketCapScore = parseFloat(data.marketCap.replace(/[^0-9.]/g, ''));
      const changeScore = Math.abs(data.change) * (data.change > 0 ? 1.2 : 0.8);
      
      const totalScore = (volumeScore * 0.3) + (marketCapScore * 0.4) + (changeScore * 0.3);
      
      return {
        symbol,
        ...data,
        score: totalScore,
        trend: data.change > 3 ? 'hot' : data.change > 0 ? 'up' : 'down'
      };
    });

    return scoredCryptos.sort((a, b) => b.score - a.score).slice(0, 5);
  };

  // AI Recommended Portfolio Allocation
  const getRecommendedPortfolio = () => {
    const recommendations = getTopRecommendations();
    return [
      { symbol: recommendations[0]?.symbol || 'BTC', allocation: 35, reason: 'Market leader, high stability' },
      { symbol: recommendations[1]?.symbol || 'ETH', allocation: 25, reason: 'Smart contract ecosystem' },
      { symbol: recommendations[2]?.symbol || 'BNB', allocation: 20, reason: 'Exchange token, strong utility' },
      { symbol: recommendations[3]?.symbol || 'SOL', allocation: 15, reason: 'High-performance blockchain' },
      { symbol: recommendations[4]?.symbol || 'ADA', allocation: 5, reason: 'Driven by academic research' }
    ];
  };

  // Effect to simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update crypto prices
      setCryptoData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const change = (Math.random() - 0.5) * 0.02;
          const cryptoKey = key as keyof CryptoDataMap;
          updated[cryptoKey].price = Math.max(0.001, updated[cryptoKey].price * (1 + change));
          updated[cryptoKey].change = updated[cryptoKey].change + (Math.random() - 0.5) * 0.5;
        });
        return updated;
      });
  
      // Update price history for the selected crypto
      setPriceHistory(prev => {
        const newPoint: PriceHistoryPoint = {
          time: new Date().toLocaleTimeString(),
          [selectedCrypto]: cryptoData[selectedCrypto]?.price || 0
        };
        return [...prev.slice(-20), newPoint];
      });
    }, 3000);
  
    return () => clearInterval(interval);
  }, [selectedCrypto, cryptoData]);

  // Effect to check for triggered price alerts
  useEffect(() => {
    alerts.forEach((alert: Alert) => {
      const currentPrice = cryptoData[alert.symbol]?.price;
      if (currentPrice && 
          ((alert.type === 'above' && currentPrice >= alert.price) ||
           (alert.type === 'below' && currentPrice <= alert.price))) {
        // In a real app, you would trigger a notification here
        console.log(`Price Alert: ${alert.symbol} has gone ${alert.type} $${alert.price}`);
      }
    });
  }, [cryptoData, alerts]);

  // Function to add a new price alert
  const addAlert = () => {
    if (alertPrice && selectedCrypto) {
      const newAlert: Alert = {
        id: Date.now(),
        symbol: selectedCrypto,
        price: parseFloat(alertPrice),
        type: parseFloat(alertPrice) > cryptoData[selectedCrypto].price ? 'above' : 'below',
        timestamp: new Date().toLocaleString()
      };
      setAlerts([...alerts, newAlert]);
      setAlertPrice('');
    }
  };

  // Function to add a holding to the portfolio
  const addToPortfolio = () => {
    if (addAmount && selectedCrypto) {
      const amount = parseFloat(addAmount);
      const price = cryptoData[selectedCrypto].price;
      const value = amount * price;
      
      const newHolding: Holding = {
        id: Date.now(),
        symbol: selectedCrypto,
        amount,
        buyPrice: price,
        value,
        timestamp: new Date().toLocaleString()
      };
      setPortfolio([...portfolio, newHolding]);
      setAddAmount('');
    }
  };

  // Memoized calculation for total portfolio value
  const portfolioValue = useMemo(() => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = cryptoData[holding.symbol]?.price || holding.buyPrice;
      return total + (holding.amount * currentPrice);
    }, 0);
  }, [portfolio, cryptoData]);

  // Memoized calculation for portfolio Profit and Loss (PnL)
  const portfolioPnL = useMemo(() => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = cryptoData[holding.symbol]?.price || holding.buyPrice;
      const currentValue = holding.amount * currentPrice;
      return total + (currentValue - holding.value);
    }, 0);
  }, [portfolio, cryptoData]);

  // Simulated news data
  const newsData = [
    { title: 'Bitcoin ETF Gains SEC Approval', time: '2 hours ago', impact: 'positive' },
    { title: 'Ethereum Completes Network Upgrade', time: '4 hours ago', impact: 'positive' },
    { title: 'Federal Reserve Interest Rate Decision Impacts Crypto Market', time: '6 hours ago', impact: 'negative' },
    { title: 'New DeFi Protocol Secures Major Investment', time: '8 hours ago', impact: 'positive' },
    { title: 'Regulatory Policy Update Affects Exchange Operations', time: '12 hours ago', impact: 'neutral' }
  ];

  const recommendations = getTopRecommendations();
  const recommendedPortfolio = getRecommendedPortfolio();
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f'];

  return (
    <div className={`min-h-screen font-sans transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 sticky top-0 z-10`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-yellow-500" />
            CryptoTracker Pro(Made by Republic)
          </h1>
          <div className="flex items-center gap-4">
            {/* Tab Navigation */}
            <nav className="hidden md:flex gap-2">
              {[
                { id: 'tracker', label: 'Tracker', icon: TrendingUp },
                { id: 'portfolio', label: 'Portfolio', icon: Calculator },
                { id: 'news', label: 'News', icon: Newspaper }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* AI Recommendations Area */}
        <section className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" />
            AI Smart Recommendations
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top 5 Recommended Coins */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🚀 Top 5 Recommended Coins</h3>
              <div className="space-y-2">
                {recommendations.map((crypto, index) => (
                  <div key={crypto.symbol} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-500">#{index + 1}</span>
                      <span className="font-semibold">{crypto.symbol}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        crypto.trend === 'hot' ? 'bg-red-500/20 text-red-400' :
                        crypto.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {crypto.trend === 'hot' ? '🔥 Hot' : crypto.trend === 'up' ? '📈 Up' : '📉 Down'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${crypto.price.toFixed(2)}</div>
                      <div className={`text-sm ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Portfolio */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Smart Portfolio</h3>
              <div className="space-y-3">
                {recommendedPortfolio.map((item, index) => (
                  <div key={item.symbol} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{item.symbol}</span>
                      <span className="font-bold">{item.allocation}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full mb-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${item.allocation}%`,
                          backgroundColor: colors[index] 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">{item.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main content based on active tab */}
        {activeTab === 'tracker' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Coin List & Alerts */}
            <div className="lg:col-span-1 space-y-6">
              {/* Coin List */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">Cryptocurrency List</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(cryptoData).map(([symbol, data]) => (
                    <button
                      key={symbol}
                      onClick={() => setSelectedCrypto(symbol)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedCrypto === symbol
                          ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                          : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100')
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{symbol}</div>
                          <div className="text-sm opacity-75">${data.price.toFixed(2)}</div>
                        </div>
                        <div className={`text-right font-medium text-sm ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Alerts */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Price Alerts
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="Set price"
                      className={`flex-1 p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={addAlert}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`p-2 rounded border-l-4 ${alert.type === 'above' ? 'border-green-500' : 'border-red-500'} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="text-sm">
                          {alert.symbol} {alert.type === 'above' ? '>' : '<'} ${alert.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chart & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Coin Details */}
              {selectedCrypto && cryptoData[selectedCrypto] && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold">{selectedCrypto}</h2>
                      <p className="text-4xl font-bold mt-2">${cryptoData[selectedCrypto].price.toFixed(2)}</p>
                      <div className={`flex items-center gap-2 mt-2 text-lg font-bold ${cryptoData[selectedCrypto].change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {cryptoData[selectedCrypto].change >= 0 ? <TrendingUp /> : <TrendingDown />}
                        {cryptoData[selectedCrypto].change.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <span className="text-sm opacity-75">24h Volume</span>
                        <div className="font-semibold">${cryptoData[selectedCrypto].volume}</div>
                      </div>
                      <div>
                        <span className="text-sm opacity-75">Market Cap</span>
                        <div className="font-semibold">${cryptoData[selectedCrypto].marketCap}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="time" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} domain={['dataMin', 'dataMax']} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            color: darkMode ? '#ffffff' : '#000000'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={selectedCrypto} 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Overview & Add Holding */}
            <div className="lg:col-span-1 space-y-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm opacity-75">Total Value</span>
                    <div className="text-2xl font-bold">${portfolioValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm opacity-75">Total P&L</span>
                    <div className={`text-xl font-bold ${portfolioPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">Add Holding</h3>
                <div className="space-y-4">
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    {Object.keys(cryptoData).map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Amount"
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={addToPortfolio}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Holdings List & Chart */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">My Holdings</h3>
                <div className="space-y-2">
                  {portfolio.map(holding => {
                    const currentPrice = cryptoData[holding.symbol]?.price || holding.buyPrice;
                    const currentValue = holding.amount * currentPrice;
                    const pnl = currentValue - holding.value;
                    
                    return (
                      <div key={holding.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{holding.symbol}</div>
                            <div className="text-sm opacity-75">
                              {holding.amount} @ ${holding.buyPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${currentValue.toFixed(2)}</div>
                            <div className={`text-sm ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {portfolio.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                      No holdings added yet.
                    </div>
                  )}
                </div>
              </div>

              {portfolio.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                           data={portfolio.map(holding => ({
                              name: holding.symbol,
                              value: holding.amount * (cryptoData[holding.symbol]?.price || holding.buyPrice)
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {portfolio.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            color: darkMode ? '#ffffff' : '#000000'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <h3 className="text-lg font-semibold mb-6">Crypto News</h3>
            <div className="space-y-4">
              {newsData.map((news, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  news.impact === 'positive' ? 'border-green-500 bg-green-500/10' :
                  news.impact === 'negative' ? 'border-red-500 bg-red-500/10' :
                  'border-gray-500 bg-gray-500/10'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{news.title}</h4>
                      <p className="text-sm opacity-75">{news.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      news.impact === 'positive' ? 'bg-green-500/20 text-green-400' :
                      news.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {news.impact === 'positive' ? 'Positive' : news.impact === 'negative' ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CryptoTracker;
