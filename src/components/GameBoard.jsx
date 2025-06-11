import { createSignal, onMount } from 'solid-js'
import '../styles/GameBoard.scss'

const DIFFICULTY = [
  { size: 4, n: 6 },    // Пн
  { size: 5, n: 8 },    // Вт
  { size: 5, n: 10 },   // Ср
  { size: 6, n: 14 },   // Чт
  { size: 7, n: 18 },   // Пт
  { size: 5, n: 10 },   // Сб
  { size: 5, n: 10 },   // Вс
]
const today = new Date().getDay()
const { size: BOARD_SIZE, n: N } = DIFFICULTY[(today + 6) % 7]

function generateSnakePath(size) {
  const path = []
  for (let r = 0; r < size; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < size; c++) path.push([r, c])
    } else {
      for (let c = size - 1; c >= 0; c--) path.push([r, c])
    }
  }
  return path
}

const getNeighbors = (row, col, size) => [
  [row - 1, col],
  [row + 1, col],
  [row, col - 1],
  [row, col + 1]
].filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)

const GameBoard = (props) => {
  const [board, setBoard] = createSignal([])
  const [path, setPath] = createSignal([])
  const [isComplete, setIsComplete] = createSignal(false)
  const [errorCell, setErrorCell] = createSignal(null)
  const [isDragging, setIsDragging] = createSignal(false)

  const generateBoard = () => {
    let snake = generateSnakePath(BOARD_SIZE)
    const offset = Math.floor(Math.random() * snake.length)
    snake = [...snake.slice(offset), ...snake.slice(0, offset)]
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
    for (let i = 0; i < N; i++) {
      const [r, c] = snake[i]
      newBoard[r][c] = i + 1
    }
    setBoard(newBoard)
    setPath([])
    setIsComplete(false)
    setErrorCell(null)
    setIsDragging(false)
  }

  onMount(generateBoard)

  const isInPath = (row, col) => path().some(([r, c]) => r === row && c === col)
  const isCurrent = (row, col) => {
    const p = path()
    if (p.length === 0) return false
    const [lr, lc] = p[p.length - 1]
    return lr === row && lc === col
  }

  const handleMouseDown = (row, col) => {
    if (isComplete()) return
    if (board()[row][col] === 1) {
      setPath([[row, col]])
      setIsDragging(true)
      setErrorCell(null)
    }
  }

  const handleMouseEnter = (row, col) => {
    if (!isDragging() || isComplete()) return
    const currentPath = path()
    if (currentPath.length === 0) return
    const [lastRow, lastCol] = currentPath[currentPath.length - 1]
    const lastNum = board()[lastRow][lastCol]
    const cellNum = board()[row][col]
    if (
      currentPath.length > 1 &&
      currentPath[currentPath.length - 2][0] === row &&
      currentPath[currentPath.length - 2][1] === col
    ) {
      setPath(currentPath.slice(0, -1))
      setErrorCell(null)
      return
    }
    if (
      getNeighbors(lastRow, lastCol, BOARD_SIZE).some(([r, c]) => r === row && c === col) &&
      cellNum === lastNum + 1 &&
      !currentPath.some(([r, c]) => r === row && c === col)
    ) {
      setPath([...currentPath, [row, col]])
      setErrorCell(null)
      if (cellNum === N && currentPath.length + 1 === BOARD_SIZE * BOARD_SIZE) {
        setIsComplete(true)
        setIsDragging(false)
        if (props.onWin) props.onWin()
      }
      return
    }
    if (
      getNeighbors(lastRow, lastCol, BOARD_SIZE).some(([r, c]) => r === row && c === col) &&
      cellNum === null &&
      !currentPath.some(([r, c]) => r === row && c === col)
    ) {
      setPath([...currentPath, [row, col]])
      setErrorCell(null)
      return
    }
    if (
      cellNum === lastNum + 1 &&
      !getNeighbors(lastRow, lastCol, BOARD_SIZE).some(([r, c]) => r === row && c === col)
    ) {
      setErrorCell([row, col])
      setTimeout(() => setErrorCell(null), 400)
      return
    }
    if (!isInPath(row, col)) {
      setErrorCell([row, col])
      setTimeout(() => setErrorCell(null), 400)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (!isComplete() && (path().length === 0 || (path().length && (board()[path()[path().length-1][0]][path()[path().length-1][1]] !== N || path().length !== BOARD_SIZE * BOARD_SIZE)))) {
      setTimeout(() => setPath([]), 200)
    }
  }

  const isPathCell = (row, col) => {
    return board()[row][col] === null && isInPath(row, col)
  }

  return (
    <div class="game-board zip-board"
      onMouseLeave={handleMouseUp}
      >
      <div class="zip-difficulty">День: {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][(today+6)%7]} | Размер: {BOARD_SIZE}x{BOARD_SIZE} | Чисел: {N}</div>
      {board().map((rowArr, r) => (
        <div class="board-row" key={r}>
          {rowArr.map((num, c) => {
            const inPath = isInPath(r, c)
            const current = isCurrent(r, c)
            const error = errorCell() && errorCell()[0] === r && errorCell()[1] === c
            const pathCell = isPathCell(r, c)
            return (
              <div
                class={`zip-cell${inPath ? ' in-path' : ''}${current ? ' current' : ''}${error ? ' error' : ''}${num === 1 ? ' zip-start' : ''}${num === N ? ' zip-end' : ''}${pathCell ? ' zip-path-cell' : ''}`}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                onMouseUp={handleMouseUp}
                key={c}
              >
                {num}
              </div>
            )
          })}
        </div>
      ))}
      {isComplete() && <div class="zip-win">Победа! Путь использует все клетки!</div>}
      <button class="zip-restart" onClick={generateBoard}>Заново</button>
    </div>
  )
}

export default GameBoard 