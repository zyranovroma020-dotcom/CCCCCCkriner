import { useState, useEffect } from 'react'
import { useScreenerStore } from '../store/screener'
import type { CoinMetric } from '../types'
import s from './CoinFilters.module.css'

interface CoinFilters {
  volumeMin: number
  volumeMax: number
  priceChangeMin: number
  priceChangeMax: number
  volatilityMin: number
  volatilityMax: number
}

interface CoinFiltersProps {
  onFiltersChange: (filters: CoinFilters) => void
  onSearchChange: (search: string) => void
  coins: any[]
}

const DEFAULT_FILTERS: CoinFilters = {
  volumeMin: 0,
  volumeMax: 0,
  priceChangeMin: -100,
  priceChangeMax: 100,
  volatilityMin: 0,
  volatilityMax: 100
}

export function CoinFilters({ onFiltersChange, onSearchChange, coins }: CoinFiltersProps) {
  const { coinFilters: savedFilters, saveCoinFilters } = useScreenerStore()
  
  // Загружаем фильтры из localStorage при инициализации
  const [filters, setFilters] = useState<CoinFilters>(() => {
    try {
      const stored = localStorage.getItem('coin-filters')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {}
    return savedFilters || DEFAULT_FILTERS
  })
  
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return localStorage.getItem('coin-search-term') || ''
    } catch (e) {
      return ''
    }
  })
  
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return localStorage.getItem('coin-filters-expanded') === 'true'
    } catch (e) {
      return false
    }
  })

  // Calculate max values from current coins
  const maxVolume = Math.max(...coins.map(c => c.volume24hUsd), 1000000)
  const maxVolatility = Math.max(...coins.map(c => c.volatility24hPct), 100)

  useEffect(() => {
    onFiltersChange(filters)
    saveCoinFilters(filters)
    // Сохраняем в localStorage
    try {
      localStorage.setItem('coin-filters', JSON.stringify(filters))
    } catch (e) {}
  }, [filters, onFiltersChange, saveCoinFilters])

  useEffect(() => {
    onSearchChange(searchTerm)
    // Сохраняем поиск в localStorage
    try {
      localStorage.setItem('coin-search-term', searchTerm)
    } catch (e) {}
  }, [searchTerm, onSearchChange])

  useEffect(() => {
    // Сохраняем состояние expanded в localStorage
    try {
      localStorage.setItem('coin-filters-expanded', isExpanded.toString())
    } catch (e) {}
  }, [isExpanded])

  const handleFilterChange = (key: keyof CoinFilters, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
    // Очищаем localStorage
    try {
      localStorage.removeItem('coin-filters')
      localStorage.removeItem('coin-search-term')
    } catch (e) {}
  }

  // Функции для конвертации объема
  const volumeToMillions = (volume: number) => {
    return volume ? (volume / 1000000).toFixed(1) : ''
  }

  const volumeFromMillions = (millions: string) => {
    const num = parseFloat(millions)
    return isNaN(num) ? 0 : num * 1000000
  }

  return (
    <div className={s.coinFilters}>
      <div className={s.filtersHeader}>
        <input
          type="text"
          placeholder="🔍 Поиск монеты..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          className={s.searchInput}
        />
        <button 
          className={s.toggleFiltersBtn}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '📉 Фильтры' : '📊 Фильтры'}
        </button>
        {isExpanded && (
          <button 
            className={s.resetFiltersBtn}
            onClick={resetFilters}
          >
            🔄 Сброс
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={s.filtersContent}>
          <div className={s.filterGroup}>
            <label>Объём (24h) млн$:</label>
            <div className={s.rangeInputs}>
              <input
                type="number"
                placeholder="Мин"
                value={volumeToMillions(filters.volumeMin)}
                onChange={(e) => handleFilterChange('volumeMin', volumeFromMillions(e.target.value))}
                min="0"
                step="0.1"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Макс"
                value={volumeToMillions(filters.volumeMax)}
                onChange={(e) => handleFilterChange('volumeMax', volumeFromMillions(e.target.value))}
                min="0"
                max={volumeToMillions(maxVolume)}
                step="0.1"
              />
            </div>
          </div>

          <div className={s.filterGroup}>
            <label>Изменение цены (%):</label>
            <div className={s.rangeInputs}>
              <input
                type="number"
                placeholder="Мин"
                value={filters.priceChangeMin}
                onChange={(e) => handleFilterChange('priceChangeMin', Number(e.target.value))}
                min="-100"
                max="100"
                step="0.1"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Макс"
                value={filters.priceChangeMax}
                onChange={(e) => handleFilterChange('priceChangeMax', Number(e.target.value))}
                min="-100"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div className={s.filterGroup}>
            <label>Волатильность (%):</label>
            <div className={s.rangeInputs}>
              <input
                type="number"
                placeholder="Мин"
                value={filters.volatilityMin}
                onChange={(e) => handleFilterChange('volatilityMin', Number(e.target.value))}
                min="0"
                max={maxVolatility}
                step="0.1"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Макс"
                value={filters.volatilityMax}
                onChange={(e) => handleFilterChange('volatilityMax', Number(e.target.value))}
                min="0"
                max={maxVolatility}
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
