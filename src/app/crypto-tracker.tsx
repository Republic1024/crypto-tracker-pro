"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bell, BellOff, Sun, Moon, Plus, Minus, TrendingUp, TrendingDown, Star, Calculator, Newspaper, Zap } from 'lucide-react';

const CryptoTracker = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [alertPrice, setAlertPrice] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [addAmount, setAddAmount] = useState('');
  const [activeTab, setActiveTab] = useState('tracker');
  
  // 模拟加密货币数据
  const [cryptoData, setCryptoData] = useState({
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

  // 历史价格数据（模拟）
  const [priceHistory, setPriceHistory] = useState([]);

  // 智能推荐算法
  const getTopRecommendations = () => {
    const cryptos = Object.entries(cryptoData);
    
    // 综合评分算法：考虑价格变化、交易量、市值
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

  // 智能投资组合推荐
  const getRecommendedPortfolio = () => {
    const recommendations = getTopRecommendations();
    return [
      { symbol: recommendations[0]?.symbol || 'BTC', allocation: 35, reason: '市场领导者，稳定性高' },
      { symbol: recommendations[1]?.symbol || 'ETH', allocation: 25, reason: '智能合约生态系统' },
      { symbol: recommendations[2]?.symbol || 'BNB', allocation: 20, reason: '交易所代币，实用性强' },
      { symbol: recommendations[3]?.symbol || 'SOL', allocation: 15, reason: '高性能区块链' },
      { symbol: recommendations[4]?.symbol || 'ADA', allocation: 5, reason: '学术研究驱动' }
    ];
  };

  // 模拟实时价格更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const change = (Math.random() - 0.5) * 0.02;
          updated[key].price = Math.max(0.001, updated[key].price * (1 + change));
          updated[key].change = updated[key].change + (Math.random() - 0.5) * 0.5;
        });
        return updated;
      });

      // 更新价格历史
      setPriceHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          [selectedCrypto]: cryptoData[selectedCrypto]?.price || 0
        };
        return [...prev.slice(-20), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCrypto]);

  // 检查价格提醒
  useEffect(() => {
    alerts.forEach(alert => {
      const currentPrice = cryptoData[alert.symbol]?.price;
      if (currentPrice && 
          ((alert.type === 'above' && currentPrice >= alert.price) ||
           (alert.type === 'below' && currentPrice <= alert.price))) {
        // 模拟通知
        console.log(`价格提醒: ${alert.symbol} 已${alert.type === 'above' ? '超过' : '低于'} $${alert.price}`);
      }
    });
  }, [cryptoData, alerts]);

  // 添加价格提醒
  const addAlert = () => {
    if (alertPrice && selectedCrypto) {
      const newAlert = {
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

  // 添加到投资组合
  const addToPortfolio = () => {
    if (addAmount && selectedCrypto) {
      const amount = parseFloat(addAmount);
      const price = cryptoData[selectedCrypto].price;
      const value = amount * price;
      
      const newHolding = {
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

  // 计算投资组合总值
  const portfolioValue = useMemo(() => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = cryptoData[holding.symbol]?.price || holding.buyPrice;
      return total + (holding.amount * currentPrice);
    }, 0);
  }, [portfolio, cryptoData]);

  const portfolioPnL = useMemo(() => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = cryptoData[holding.symbol]?.price || holding.buyPrice;
      const currentValue = holding.amount * currentPrice;
      return total + (currentValue - holding.value);
    }, 0);
  }, [portfolio, cryptoData]);

  // 模拟新闻数据
  const newsData = [
    { title: 'Bitcoin ETF 获得 SEC 批准', time: '2小时前', impact: 'positive' },
    { title: '以太坊完成网络升级', time: '4小时前', impact: 'positive' },
    { title: '美联储加息决策影响加密货币市场', time: '6小时前', impact: 'negative' },
    { title: '新的 DeFi 协议获得大额投资', time: '8小时前', impact: 'positive' },
    { title: '监管政策更新影响交易所运营', time: '12小时前', impact: 'neutral' }
  ];

  const recommendations = getTopRecommendations();
  const recommendedPortfolio = getRecommendedPortfolio();
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-yellow-500" />
            CryptoTracker Pro
          </h1>
          <div className="flex gap-4">
            {/* Tab Navigation */}
            <div className="flex gap-2">
              {[
                { id: 'tracker', label: '追踪器', icon: TrendingUp },
                { id: 'portfolio', label: '投资组合', icon: Calculator },
                { id: 'news', label: '新闻', icon: Newspaper }
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
            </div>
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* AI 推荐区域 */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" />
            AI 智能推荐
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 推荐币种 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🚀 前5推荐币种</h3>
              <div className="space-y-2">
                {recommendations.map((crypto, index) => (
                  <div key={crypto.symbol} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-500">#{index + 1}</span>
                      <span className="font-semibold">{crypto.symbol}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        crypto.trend === 'hot' ? 'bg-red-100 text-red-600' :
                        crypto.trend === 'up' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {crypto.trend === 'hot' ? '🔥 热门' : crypto.trend === 'up' ? '📈 上涨' : '📉 下跌'}
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

            {/* 推荐投资组合 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 智能投资组合</h3>
              <div className="space-y-2">
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
        </div>

        {activeTab === 'tracker' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 左侧 - 币种列表和选择 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 币种选择 */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">加密货币列表</h3>
                <div className="space-y-2">
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
                        <div className="text-right">
                          <div className={`flex items-center gap-1 ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 价格提醒设置 */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  价格提醒
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="设置价格"
                      className={`flex-1 p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={addAlert}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  <div className="space-y-2">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`p-2 rounded border-l-4 ${alert.type === 'above' ? 'border-green-500' : 'border-red-500'} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="text-sm">
                          {alert.symbol} {alert.type === 'above' ? '高于' : '低于'} ${alert.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧 - 图表和详细信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 选中币种详情 */}
              {selectedCrypto && cryptoData[selectedCrypto] && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold">{selectedCrypto}</h2>
                      <p className="text-4xl font-bold mt-2">${cryptoData[selectedCrypto].price.toFixed(2)}</p>
                      <div className={`flex items-center gap-2 mt-2 ${cryptoData[selectedCrypto].change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {cryptoData[selectedCrypto].change >= 0 ? <TrendingUp /> : <TrendingDown />}
                        {cryptoData[selectedCrypto].change >= 0 ? '+' : ''}{cryptoData[selectedCrypto].change.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <span className="text-sm opacity-75">24h 交易量</span>
                        <div className="font-semibold">${cryptoData[selectedCrypto].volume}</div>
                      </div>
                      <div>
                        <span className="text-sm opacity-75">市值</span>
                        <div className="font-semibold">${cryptoData[selectedCrypto].marketCap}</div>
                      </div>
                    </div>
                  </div>

                  {/* 价格趋势图 */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="time" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
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
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 币种对比 */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">多币种对比</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(cryptoData).slice(0, 6).map(([symbol, data]) => (
                    <div key={symbol} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="font-semibold">{symbol}</div>
                      <div className="text-lg font-bold">${data.price.toFixed(2)}</div>
                      <div className={`text-sm ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 投资组合概览 */}
            <div className="lg:col-span-1 space-y-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">投资组合概览</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm opacity-75">总价值</span>
                    <div className="text-2xl font-bold">${portfolioValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm opacity-75">盈亏</span>
                    <div className={`text-xl font-bold ${portfolioPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 添加持仓 */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">添加持仓</h3>
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
                    placeholder="数量"
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={addToPortfolio}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    添加到投资组合
                  </button>
                </div>
              </div>
            </div>

            {/* 持仓列表和图表 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 持仓列表 */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-4">我的持仓</h3>
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
                              {holding.amount} 枚 @ ${holding.buyPrice.toFixed(2)}
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
                      还没有添加任何持仓
                    </div>
                  )}
                </div>
              </div>

              {/* 投资组合分布图 */}
              {portfolio.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className="text-lg font-semibold mb-4">投资组合分布</h3>
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
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            <h3 className="text-lg font-semibold mb-6">加密货币新闻</h3>
            <div className="space-y-4">
              {newsData.map((news, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  news.impact === 'positive' ? 'border-green-500 bg-green-50' :
                  news.impact === 'negative' ? 'border-red-500 bg-red-50' :
                  'border-gray-500 bg-gray-50'
                } ${darkMode ? 'bg-opacity-10' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{news.title}</h4>
                      <p className="text-sm opacity-75">{news.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      news.impact === 'positive' ? 'bg-green-100 text-green-600' :
                      news.impact === 'negative' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {news.impact === 'positive' ? '利好' : news.impact === 'negative' ? '利空' : '中性'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTracker;