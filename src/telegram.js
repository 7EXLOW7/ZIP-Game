export const initTelegramApp = () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready()
    window.Telegram.WebApp.expand()
    return true
  }
  return false
}

export const isTelegramWebApp = () => {
  return !!window.Telegram?.WebApp
}

export const showTelegramPopup = (title, message) => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showPopup({
      title,
      message,
      buttons: [{ type: 'ok' }]
    })
  } else {
    alert(`${title}\n${message}`)
  }
} 