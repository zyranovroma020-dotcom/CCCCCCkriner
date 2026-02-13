import React, { useState, useEffect } from 'react';
import { DensityMap } from '../components/DensityMap';
import { SettingsModal } from '../components/SettingsModal';
import { getTickersLinear } from '../api/bybit';
import s from './DensityMapPage.module.css';

interface CoinData {
  symbol: string;
  x: number;
  y: number;
  density: number;
  volume24h: number;
  priceChange24h: number;
  volatility24h: number;
}

interface Settings {
  dataUpdate: string;
  dataUpdateInterval: number;
  orderType: string;
  chartCandles: number;
  maxOrders: number;
  maxDistance: number;
  showSmallCircle: boolean;
  smallCircleRange: number;
  showLargeCircle: boolean;
  largeCircleRange: number;
  chartTimeframe: string;
  blacklist: string[];
}

const DEFAULT_SETTINGS: Settings = {
  dataUpdate: 'Автоматически',
  dataUpdateInterval: 5,
  orderType: 'Все ордера',
  chartCandles: 120,
  maxOrders: 100,
  maxDistance: 3,
  showSmallCircle: true,
  smallCircleRange: 1,
  showLargeCircle: true,
  largeCircleRange: 3,
  chartTimeframe: '5м',
  blacklist: []
};

export default function DensityMapPage() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('density-map-settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Загрузка данных о монетах
  const loadCoins = async () => {
    try {
      const res = await getTickersLinear();
      const processedCoins: CoinData[] = res.list
        .filter((t: any) => !settings.blacklist.includes(t.symbol))
        .slice(0, 100)
        .map((t: any, index: number) => {
          const prev = parseFloat(t.prevPrice24h) || parseFloat(t.lastPrice);
          const high = parseFloat(t.highPrice24h);
          const low = parseFloat(t.lowPrice24h);
          
          // Генерируем случайные координаты для демонстрации
          const angle = (index / 100) * Math.PI * 2;
          const radius = 50 + Math.random() * 150;
          const x = 200 + Math.cos(angle) * radius;
          const y = 200 + Math.sin(angle) * radius;
          
          return {
            symbol: t.symbol.replace('USDT', ''),
            x,
            y,
            density: 0,
            volume24h: parseFloat(t.turnover24h) || 0,
            priceChange24h: (parseFloat(t.price24hPcnt) || 0) * 100,
            volatility24h: prev ? ((high - low) / prev) * 100 : 0
          };
        });
      
      setCoins(processedCoins);
    } catch (error) {
      console.error('Failed to load coins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoins();
  }, []);

  // Слушаем изменения в localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('density-map-settings');
        if (stored) {
          const newSettings = JSON.parse(stored);
          setSettings(newSettings);
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Автоматическое обновление данных
  useEffect(() => {
    if (settings.dataUpdate === 'Автоматически') {
      const interval = setInterval(loadCoins, settings.dataUpdateInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.dataUpdate, settings.dataUpdateInterval, settings.blacklist]);

  // Перезагружаем данные если изменился черный список
  useEffect(() => {
    if (coins.length > 0) {
      loadCoins();
    }
  }, [settings.blacklist]);

  if (loading) {
    return (
      <div className={s.loadingContainer}>
        <div className={s.spinner}></div>
        <span>Загрузка карты плотностей...</span>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1>Карта плотностей</h1>
        <button 
          className={s.settingsBtn}
          onClick={() => setShowSettings(true)}
        >
          ⚙️ Настройки
        </button>
      </div>

      <div className={s.content}>
        <DensityMap coins={coins} settings={settings} />
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
