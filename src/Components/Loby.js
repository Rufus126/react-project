import SnakeGame from "./SnakeGame";
import "./Loby.css";
function Loby() {
  return (
    <div className="loby-1">
      <button className="SnakeGame-btn" onClick={() => {
        document.querySelector('.SnakeGamePopupOverlay').style.display = 'block';
        document.querySelector('.SnakeGamePopupContent').style.display = 'block';
      }}>
        SNAKEGAME🐍
      </button>
      <div className="SnakeGamePopupOverlay"></div>
      <div className="SnakeGamePopupContent">
        <center>
          <h1>Are you ready to play snake game?</h1>
          <button className="Yes-btn" onClick={() => {
        document.querySelector('.SnakeGamePopupOverlay').style.display = 'none';
        document.querySelector('.SnakeGamePopupContent').style.display = 'none';
        document.querySelector('.SnakeGameContainer').style.display = 'block';
      }}>Yes</button>
          <h3>Or</h3>
          <button className="No-btn" onClick={() => {
        document.querySelector('.SnakeGamePopupOverlay').style.display = 'none';
        document.querySelector('.SnakeGamePopupContent').style.display = 'none';
      }}>No</button>
        </center>
      </div>
      <div className="SnakeGameContainer">
        <button className="back-btn" onClick={() => {
        document.querySelector('.SnakeGameContainer').style.display = 'none';
      }}>BACK🔙</button>
        <SnakeGame />
      </div>
    </div>
  );
}
export default Loby;
