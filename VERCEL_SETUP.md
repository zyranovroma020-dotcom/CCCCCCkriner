# Настройка Environment Variables для Vercel

## Обязательные переменные окружения:

1. **TELEGRAM_BOT_TOKEN**
   - Значение: `8592848269:AAE4nTP3hBDLTCYMfWcwqNvGOh34_39SObo`
   - Описание: Токен Telegram бота для отправки уведомлений

## Как добавить в Vercel:

1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте новую переменную:
   - **Key**: `TELEGRAM_BOT_TOKEN`
   - **Value**: `8592848269:AAE4nTP3hBDLTCYMfWcwqNvGOh34_39SObo`
   - **Environment**: Production, Preview, Development
4. Нажмите Save
5. Переразверните проект (Redeploy)

## Проверка:

После добавления токена умные оповещения должны:
- Находить совпадения
- Отправлять уведомления в Telegram
- Добавлять монеты в кулдаун на 24 часа

## Примечание:

Токен взят из файла `server/.env.example` и используется для отправки уведомлений в Telegram.
