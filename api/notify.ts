export async function POST(request) {
  try {
    const { telegramChatId, text } = await request.json()

    if (!telegramChatId || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing telegramChatId or text' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Отправляем сообщение в Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text()
      console.error('Telegram API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram message' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in notify API:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
