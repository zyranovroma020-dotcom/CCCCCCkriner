import React, { useRef, useEffect, useState } from 'react';
import s from './DensityMap.module.css';

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
  showSmallCircle: boolean;
  smallCircleRange: number;
  showLargeCircle: boolean;
  largeCircleRange: number;
}

interface DensityMapProps {
  coins: CoinData[];
  settings: Settings;
}

export const DensityMap: React.FC<DensityMapProps> = ({ coins, settings }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredCoin, setHoveredCoin] = useState<CoinData | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        setDimensions({ width: svgRef.current.clientWidth, height: svgRef.current.clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Функция для расчета плотности
  const calculateDensity = (coin: CoinData) => {
    const volumeScore = Math.log10(coin.volume24h + 1) / 10;
    const volatilityScore = coin.volatility24h / 100;
    const priceChangeScore = Math.abs(coin.priceChange24h) / 100;
    
    return (volumeScore * 0.5 + volatilityScore * 0.3 + priceChangeScore * 0.2) * 100;
  };

  // Создаем данные для карты с расчетной плотностью
  const mapData = coins.map(coin => ({
    ...coin,
    density: calculateDensity(coin)
  }));

  // Генерируем случайные позиции для монет
  const generatePositions = (count: number) => {
    const positions = [];
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 50 + Math.random() * Math.min(centerX, centerY) * 0.7;
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return positions;
  };

  const coinPositions = generatePositions(mapData.length);

  const getDensityColor = (density: number) => {
    if (density > 70) return '#22c55e'; // зеленый
    if (density > 40) return '#f59e0b'; // желтый
    return '#ef4444'; // красный
  };

  const getDistanceFromCenter = (x: number, y: number) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  };

  const getDistancePercent = (distance: number) => {
    const maxRadius = Math.min(dimensions.width, dimensions.height) / 2;
    return (distance / maxRadius) * 100;
  };

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div className={s.densityMapContainer}>Загрузка...</div>;
  }

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius1Percent = Math.min(dimensions.width, dimensions.height) * 0.01; // 1%
  const radius2Percent = Math.min(dimensions.width, dimensions.height) * 0.02; // 2%

  return (
    <div className={s.densityMapContainer}>
      {/* Легенда */}
      <div className={s.legend}>
        <div className={s.legendItem}>
          <div className={s.legendColor} style={{ backgroundColor: '#3b82f6' }} />
          <span>Время разъедания</span>
        </div>
        <div className={s.legendItem}>
          <div className={s.legendColor} style={{ backgroundColor: '#8b5cf6' }} />
          <span>Расстояние от спреда (%)</span>
        </div>
        <div className={s.legendItem}>
          <div className={s.legendColor} style={{ backgroundColor: '#22c55e' }} />
          <span>Лонговая плотность</span>
        </div>
        <div className={s.legendItem}>
          <div className={s.legendColor} style={{ backgroundColor: '#ef4444' }} />
          <span>Шортовая плотность</span>
        </div>
      </div>

      {/* Карта */}
      <div className={s.mapContainer}>
        <svg
          ref={svgRef}
          className={s.map}
          width={dimensions.width}
          height={dimensions.height}
        >
          {/* Круги 1% и 2% */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius1Percent}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
          <text
            x={centerX + radius1Percent + 5}
            y={centerY}
            fill="rgba(255, 255, 255, 0.5)"
            fontSize="10"
          >
            1%
          </text>

          <circle
            cx={centerX}
            cy={centerY}
            r={radius2Percent}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
          <text
            x={centerX + radius2Percent + 5}
            y={centerY}
            fill="rgba(255, 255, 255, 0.5)"
            fontSize="10"
          >
            2%
          </text>

          {/* Монеты */}
          {mapData.map((coin, index) => {
            const pos = coinPositions[index];
            const distance = getDistanceFromCenter(pos.x, pos.y);
            const distancePercent = getDistancePercent(distance);
            
            return (
              <g key={coin.symbol}>
                {/* Линия от центра к монете */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
                
                {/* Блок монеты */}
                <rect
                  x={pos.x - 30}
                  y={pos.y - 15}
                  width={60}
                  height={30}
                  fill="#1a1a1a"
                  stroke={getDensityColor(coin.density)}
                  strokeWidth="2"
                  rx="4"
                />
                
                {/* Символ монеты */}
                <text
                  x={pos.x}
                  y={pos.y - 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {coin.symbol}
                </text>
                
                {/* Процент */}
                <text
                  x={pos.x}
                  y={pos.y + 8}
                  textAnchor="middle"
                  fill={getDensityColor(coin.density)}
                  fontSize="8"
                >
                  {coin.density.toFixed(1)}%
                </text>
                
                {/* Объем */}
                <text
                  x={pos.x}
                  y={pos.y + 18}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="7"
                >
                  ${(coin.volume24h / 1000000).toFixed(1)}M
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Панель управления */}
      <div className={s.controls}>
        <button className={s.controlBtn}>⚙️ Настройки</button>
        <button className={s.controlBtn}>🔍 Увеличить</button>
        <button className={s.controlBtn}>🔄 Обновить</button>
      </div>
    </div>
  );
};
