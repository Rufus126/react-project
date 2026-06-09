import "./SnakeGame.css";
import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 48;

const SnakeGame = () => {
  const [gameSpeed, setGameSpeed] = useState(220);
  const [level, setLevel] = useState(1);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const speed = Math.max(50, gameSpeed - (level - 1) * 10);
  const [obstacles, setObstacles] = useState([]);
  const [direction, setDirection] = useState("RIGHT");
  const [pause, setPause] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [snakeColor, setSnakeColor] = useState("rgb(4, 0, 255)");
  const [manualColor, setManualColor] = useState("#0000ff");
  // High score initialization
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("highScore")) || 0;
  });

  // Base random coordinator
  const getRandomGrid = useCallback(() => {
    let min = 1;
    let max = GRID_SIZE;
    let x = Math.floor(Math.random() * (max - min + 1) + min);
    let y = Math.floor(Math.random() * (max - min + 1) + min);
    return [x, y];
  }, []);

  // Helper to check if a coordinate hits any item in an array
  const isCollidingWithArray = (target, array) => {
    return array.some((item) => target[0] === item[0] && target[1] === item[1]);
  };

  // Safe coordination generator that avoids the snake and obstacles
  const getSafeCoordinates = useCallback(
    (currentSnake, currentObstacles) => {
      let coords = getRandomGrid();
      let attempts = 0;
      // Keep generating new positions if it hits the snake or existing obstacles
      while (
        (isCollidingWithArray(coords, currentSnake) ||
          isCollidingWithArray(coords, currentObstacles)) &&
        attempts < 100
      ) {
        coords = getRandomGrid();
        attempts++;
      }
      return coords;
    },
    [getRandomGrid],
  );

  const [food, setFood] = useState(() => [15, 15]); // Set fixed starting food to avoid initial render dependency

  const [snakeDots, setSnakeDots] = useState([
    [1, 1],
    [2, 1],
  ]);

  // Generate unique obstacles avoiding the snake's current footprint
  const generateObstacles = useCallback(
    (lvl, currentSnake) => {
      const count = Math.max(0, (lvl - 2) * 3);
      const newObstacles = [];

      for (let i = 0; i < count; i++) {
        let coords = getRandomGrid();
        let attempts = 0;
        while (
          (isCollidingWithArray(coords, currentSnake) ||
            isCollidingWithArray(coords, newObstacles)) &&
          attempts < 100
        ) {
          coords = getRandomGrid();
          attempts++;
        }
        newObstacles.push(coords);
      }
      return newObstacles;
    },
    [getRandomGrid],
  );

  // Unified frame physics loop
  const moveSnake = useCallback(() => {
    setSnakeDots((prevDots) => {
      if (gameOver || pause) return prevDots;

      let dots = [...prevDots];
      let head = dots[dots.length - 1];

      // Mutate direction safely based on reference lock
      switch (direction) {
        case "RIGHT":
          head = [head[0] + 1, head[1]];
          break;
        case "LEFT":
          head = [head[0] - 1, head[1]];
          break;
        case "DOWN":
          head = [head[0], head[1] + 1];
          break;
        case "UP":
          head = [head[0], head[1] - 1];
          break;
        default:
          break;
      }

      // 1. Wall Collisions
      if (
        head[0] < 1 ||
        head[1] < 1 ||
        head[0] > GRID_SIZE ||
        head[1] > GRID_SIZE
      ) {
        setGameOver(true);
        setPause(true);
        return prevDots;
      }

      // 2. Self Collisions
      if (isCollidingWithArray(head, dots)) {
        setGameOver(true);
        setPause(true);
        return prevDots;
      }

      // 3. Obstacle Collisions
      if (isCollidingWithArray(head, obstacles)) {
        setGameOver(true);
        setPause(true);
        return prevDots;
      }

      let newDots = [...dots, head];
      const ateFood = head[0] === food[0] && head[1] === food[1];

      if (ateFood) {
        // Handle Score Updates & Level progressions safely down inside state updates
        setScore((prevScore) => {
          const nextScore = prevScore + 1;
          const nextLevel = Math.floor(nextScore / 5) + 1;

          if (nextLevel !== level) {
            setLevel(nextLevel);
            if (nextLevel >= 3) {
              setObstacles(generateObstacles(nextLevel, newDots));
            } else {
              setObstacles([]);
            }
          }
          return nextScore;
        });

        // Regenerate safe food position
        setFood(getSafeCoordinates(newDots, obstacles));
      } else {
        newDots.shift();
      }

      return newDots;
    });
  }, [
    direction,
    food,
    obstacles,
    gameOver,
    pause,
    level,
    generateObstacles,
    getSafeCoordinates,
  ]);

  // Handle Game Over sync variations for High Score saving
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score);
    }
  }, [gameOver, score, highScore]);

  // Interval Game clock loop ticker
  useEffect(() => {
    if (pause || gameOver) return;

    const interval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(interval);
  }, [moveSnake, pause, gameOver, speed]);

  // KEYBOARD
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
          break;
        case "ArrowDown":
          setDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
          break;
        case "ArrowLeft":
          setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
          break;
        case "ArrowRight":
          setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // TOUCH CONTROLS
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      // Threshold minimum distance check for genuine swipes
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
        else if (dx < 0)
          setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
      } else {
        if (dy > 0) setDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
        else if (dy < 0)
          setDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // RESTART
  const restartGame = () => {
    const freshSnake = [
      [1, 1],
      [2, 1],
    ];
    setSnakeDots(freshSnake);
    setDirection("RIGHT");
    setScore(0);
    setLevel(1);
    setObstacles([]);
    setFood(getSafeCoordinates(freshSnake, []));
    setGameOver(false);
    setPause(false);
  };

  return (
    <div className="game-container">
      <h2 className="score-text">
        Score: {score} | 🏆 High Score: {highScore} | Lvl: {level}
      </h2>

      <button
        className="pause-btn"
        onClick={() => setPause(!pause)}
        disabled={gameOver}
      >
        {pause ? "START ▶" : "PAUSE ⏸"}
      </button>
      <div className="color-picker-container">
        <label>Snake Color 🎨</label>

        <input
          type="color"
          value={manualColor}
          onChange={(e) => {
            setManualColor(e.target.value);
            setSnakeColor(e.target.value);
          }}
        />
      </div>
      <div className="speed-control-container">
        <label>Snake Speed ⚡ : {speed}</label>

        <input
          type="range"
          min="80"
          max="400"
          step="10"
          value={gameSpeed}
          onChange={(e) => setGameSpeed(Number(e.target.value))}
        />
      </div>
      <div className="snake-board">
        {snakeDots.map((dot, index) => (
          <div
            key={index}
            className="snake-dot"
            style={{
              gridColumnStart: dot[0],
              gridRowStart: dot[1],
              background: snakeColor,
            }}
          />
        ))}

        {obstacles.map((obs, index) => (
          <div
            key={index}
            className="obstacle"
            style={{
              gridColumnStart: obs[0],
              gridRowStart: obs[1],
            }}
          />
        ))}

        <div
          className="food-dot"
          style={{
            gridColumnStart: food[0],
            gridRowStart: food[1],
          }}
        />

        {gameOver && (
          <div className="game-over">
            <h1>GAME OVER 💀</h1>
            <p>Score: {score}</p>
            <p>High Score: {highScore}</p>
            <button onClick={restartGame}>Restart 🔁</button>
          </div>
        )}
      </div>

      {/* MOBILE TOUCH CONTROLS */}
      {/* MOBILE TOUCH CONTROLS */}
      <div className="mobile-controls">
        <button
          onTouchStart={() =>
            setDirection((prev) => (prev !== "DOWN" ? "UP" : prev))
          }
        >
          ⬆
        </button>

        <div className="middle-controls">
          <button
            onTouchStart={() =>
              setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev))
            }
          >
            ⬅
          </button>

          <button
            onTouchStart={() =>
              setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev))
            }
          >
            ➡
          </button>
        </div>

        <button
          onTouchStart={() =>
            setDirection((prev) => (prev !== "UP" ? "DOWN" : prev))
          }
        >
          ⬇
        </button>
      </div>
    </div>
  );
};

export default SnakeGame;
