import { createSignal, onMount } from 'solid-js'
import GameBoard from './components/GameBoard'
import { initTelegramApp, isTelegramWebApp, showTelegramPopup } from './telegram'
import './styles/App.scss'

const LEVELS = [
  { target: 1000, moves: 30, name: 'Начальный' },
  { target: 2000, moves: 25, name: 'Продвинутый' },
  { target: 3000, moves: 20, name: 'Эксперт' },
  { target: 5000, moves: 15, name: 'Мастер' },
  { target: 10000, moves: 10, name: 'Легенда' }
]

const App = () => {
  const [score, setScore] = createSignal(0)
  const [gameStarted, setGameStarted] = createSignal(false)
  const [gameOver, setGameOver] = createSignal(false)
  const [movesLeft, setMovesLeft] = createSignal(30)
  const [isTelegram, setIsTelegram] = createSignal(false)
  const [currentLevel, setCurrentLevel] = createSignal(0)
  const [combo, setCombo] = createSignal(0)
  const [highScore, setHighScore] = createSignal(0)

  onMount(() => {
    const isTg = initTelegramApp()
    setIsTelegram(isTg)
    const savedHighScore = localStorage.getItem('zipHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  })

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setMovesLeft(LEVELS[currentLevel()].moves)
    setCombo(0)
  }

  const handleMatch = (matchCount) => {
    const level = LEVELS[currentLevel()]
    const basePoints = matchCount * 10
    const comboMultiplier = Math.max(1, combo() * 0.5)
    const points = Math.floor(basePoints * comboMultiplier)
    
    setScore(prev => {
      const newScore = prev + points
      if (newScore > highScore()) {
        setHighScore(newScore)
        localStorage.setItem('zipHighScore', newScore.toString())
      }
      return newScore
    })
    
    if (score() >= level.target) {
      if (currentLevel() < LEVELS.length - 1) {
        handleLevelComplete()
      } else {
        handleGameOver(true)
      }
    }
  }

  const handleLevelComplete = () => {
    showTelegramPopup(
      'Уровень пройден!',
      `Поздравляем! Вы набрали ${score()} очков!\nПереходим на следующий уровень!`
    )
    setCurrentLevel(prev => prev + 1)
    setMovesLeft(LEVELS[currentLevel() + 1].moves)
  }

  const handleMove = () => {
    setMovesLeft(prev => {
      const newMoves = prev - 1
      if (newMoves <= 0) {
        handleGameOver(false)
      }
      return newMoves
    })
  }

  const handleGameOver = (isWin) => {
    setGameOver(true)
    setGameStarted(false)
    showTelegramPopup(
      isWin ? 'Победа!' : 'Игра окончена!',
      `Ваш счет: ${score()}\nРекорд: ${highScore()}`
    )
  }

  return (
    <div class={`app ${isTelegram() ? 'telegram-app' : 'browser-app'}`}>
      <header class="header">
        <div class="header-left">
          <h1>LinkedIn Zip</h1>
          <div class="level">Уровень: {LEVELS[currentLevel()].name}</div>
        </div>
        <div class="game-stats">
          <div class="score">Счет: {score()}</div>
          <div class="high-score">Рекорд: {highScore()}</div>
          {gameStarted() && (
            <>
              <div class="moves">Ходы: {movesLeft()}</div>
              <div class="target">Цель: {LEVELS[currentLevel()].target}</div>
            </>
          )}
        </div>
      </header>

      <main class="game-container">
        {!gameStarted() && !gameOver() && (
          <div class="start-screen">
            <h2>LinkedIn Zip</h2>
            <p>Соединяйте одинаковые элементы, чтобы набрать очки!</p>
            <div class="level-info">
              <h3>Текущий уровень: {LEVELS[currentLevel()].name}</h3>
              <p>Цель: {LEVELS[currentLevel()].target} очков</p>
              <p>Ходов: {LEVELS[currentLevel()].moves}</p>
            </div>
            {!isTelegram() && (
              <p class="browser-note">
                Это браузер версия
              </p>
            )}
            <button class="start-button" onClick={startGame}>
              Начать игру
            </button>
          </div>
        )}

        {gameStarted() && (
          <div class="game-area">
            <GameBoard onMatch={handleMatch} onMove={handleMove} />
          </div>
        )}

        {gameOver() && (
          <div class="game-over">
            <h2>Игра окончена!</h2>
            <p>Ваш счет: {score()}</p>
            <p>Рекорд: {highScore()}</p>
            <button class="restart-button" onClick={startGame}>
              Играть снова
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
