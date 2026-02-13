import React, { useState, useEffect } from 'react';
import s from './SettingsModal.module.css';

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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('density-map-settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [tempSettings, setTempSettings] = useState<Settings>(settings);
  const [newBlacklistItem, setNewBlacklistItem] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTempSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSettings(tempSettings);
    try {
      localStorage.setItem('density-map-settings', JSON.stringify(tempSettings));
    } catch (e) {}
    onClose();
  };

  const handleReset = () => {
    setTempSettings(DEFAULT_SETTINGS);
  };

  const addToBlacklist = () => {
    if (newBlacklistItem.trim() && !tempSettings.blacklist.includes(newBlacklistItem.trim().toUpperCase())) {
      handleSettingChange('blacklist', [...tempSettings.blacklist, newBlacklistItem.trim().toUpperCase()]);
      setNewBlacklistItem('');
    }
  };

  const removeFromBlacklist = (item: string) => {
    handleSettingChange('blacklist', tempSettings.blacklist.filter(i => i !== item));
  };

  const adjustValue = (key: keyof Settings, delta: number, min?: number, max?: number) => {
    const currentValue = tempSettings[key] as number;
    const newValue = Math.max(min || 0, Math.min(max || Infinity, currentValue + delta));
    handleSettingChange(key, newValue);
  };

  if (!isOpen) return null;

  return (
    <div className={s.overlay}>
      <div className={s.modal}>
        <div className={s.header}>
          <h2>Настройки</h2>
          <button className={s.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={s.content}>
          <div className={s.section}>
            <h3>Обновление данных</h3>
            <div className={s.field}>
              <label>Обновление данных</label>
              <select 
                value={tempSettings.dataUpdate}
                onChange={(e) => handleSettingChange('dataUpdate', e.target.value)}
              >
                <option>Автоматически</option>
                <option>Вручную</option>
              </select>
            </div>
            <div className={s.field}>
              <label>Интервал обновления данных (сек)</label>
              <div className={s.numberInput}>
                <button onClick={() => adjustValue('dataUpdateInterval', -1, 5)}>−</button>
                <input 
                  type="number" 
                  value={tempSettings.dataUpdateInterval}
                  onChange={(e) => handleSettingChange('dataUpdateInterval', Number(e.target.value))}
                  min="5"
                />
                <button onClick={() => adjustValue('dataUpdateInterval', 1, 5)}>+</button>
              </div>
            </div>
          </div>

          <div className={s.section}>
            <h3>Тип ордеров</h3>
            <div className={s.field}>
              <select 
                value={tempSettings.orderType}
                onChange={(e) => handleSettingChange('orderType', e.target.value)}
              >
                <option>Все ордера</option>
                <option>Лимитные</option>
                <option>Рыночные</option>
              </select>
            </div>
          </div>

          <div className={s.section}>
            <h3>График</h3>
            <div className={s.field}>
              <label>Количество свечей на графике</label>
              <div className={s.numberInput}>
                <button onClick={() => adjustValue('chartCandles', -10, 50, 1000)}>−</button>
                <input 
                  type="number" 
                  value={tempSettings.chartCandles}
                  onChange={(e) => handleSettingChange('chartCandles', Number(e.target.value))}
                  min="50"
                  max="1000"
                />
                <button onClick={() => adjustValue('chartCandles', 10, 50, 1000)}>+</button>
              </div>
            </div>
            <div className={s.field}>
              <label>Таймфрейм графика</label>
              <div className={s.timeframeButtons}>
                {['1м', '5м', '15м', '1ч', '4ч', '1д'].map(tf => (
                  <button 
                    key={tf}
                    className={tempSettings.chartTimeframe === tf ? s.active : ''}
                    onClick={() => handleSettingChange('chartTimeframe', tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={s.section}>
            <h3>Ордера</h3>
            <div className={s.field}>
              <label>Максимальное количество ордеров</label>
              <div className={s.numberInput}>
                <button onClick={() => adjustValue('maxOrders', -10, 1, 100)}>−</button>
                <input 
                  type="number" 
                  value={tempSettings.maxOrders}
                  onChange={(e) => handleSettingChange('maxOrders', Number(e.target.value))}
                  min="1"
                  max="100"
                />
                <button onClick={() => adjustValue('maxOrders', 10, 1, 100)}>+</button>
              </div>
            </div>
            <div className={s.field}>
              <label>Максимальная дистанция (%)</label>
              <div className={s.numberInput}>
                <button onClick={() => adjustValue('maxDistance', -1, 1, 10)}>−</button>
                <input 
                  type="number" 
                  value={tempSettings.maxDistance}
                  onChange={(e) => handleSettingChange('maxDistance', Number(e.target.value))}
                  min="1"
                  max="10"
                />
                <button onClick={() => adjustValue('maxDistance', 1, 1, 10)}>+</button>
              </div>
            </div>
          </div>

          <div className={s.section}>
            <h3>Масштаб карты</h3>
            <div className={s.field}>
              <label className={s.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={tempSettings.showSmallCircle}
                  onChange={(e) => handleSettingChange('showSmallCircle', e.target.checked)}
                />
                Показывать малый круг
              </label>
              {tempSettings.showSmallCircle && (
                <div className={s.numberInput}>
                  <button onClick={() => adjustValue('smallCircleRange', -0.1, 0.1, 10)}>−</button>
                  <input 
                    type="number" 
                    value={tempSettings.smallCircleRange}
                    onChange={(e) => handleSettingChange('smallCircleRange', Number(e.target.value))}
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                  <button onClick={() => adjustValue('smallCircleRange', 0.1, 0.1, 10)}>+</button>
                </div>
              )}
            </div>
            <div className={s.field}>
              <label className={s.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={tempSettings.showLargeCircle}
                  onChange={(e) => handleSettingChange('showLargeCircle', e.target.checked)}
                />
                Показывать большой круг
              </label>
              {tempSettings.showLargeCircle && (
                <div className={s.numberInput}>
                  <button onClick={() => adjustValue('largeCircleRange', -0.1, 0.1, 10)}>−</button>
                  <input 
                    type="number" 
                    value={tempSettings.largeCircleRange}
                    onChange={(e) => handleSettingChange('largeCircleRange', Number(e.target.value))}
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                  <button onClick={() => adjustValue('largeCircleRange', 0.1, 0.1, 10)}>+</button>
                </div>
              )}
            </div>
          </div>

          <div className={s.section}>
            <h3>Черный список</h3>
            <div className={s.field}>
              <div className={s.blacklistInput}>
                <input 
                  type="text" 
                  placeholder="Добавить монету"
                  value={newBlacklistItem}
                  onChange={(e) => setNewBlacklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToBlacklist()}
                />
                <button onClick={addToBlacklist}>Добавить</button>
              </div>
              <div className={s.blacklistList}>
                {tempSettings.blacklist.map(item => (
                  <div key={item} className={s.blacklistItem}>
                    <span>{item}</span>
                    <button onClick={() => removeFromBlacklist(item)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.resetBtn} onClick={handleReset}>Сбросить настройки</button>
          <div className={s.rightButtons}>
            <button className={s.cancelBtn} onClick={onClose}>Отмена</button>
            <button className={s.saveBtn} onClick={handleSave}>Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
};
