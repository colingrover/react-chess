import Board from './components/Board.jsx';
import {useChessGame} from './hooks/useChessGame.js';
import EvalBar from './components/EvalBar.jsx';

export default function App() {
    const {
        boardSnapshot,
        selectedSquare,
        moveOptions,
        suggestedMove,
        draggedPiece,
        dragPosition,
        winChance,
        showHint,
        autoplayBlack,
        check,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        requestHint,
        getTurn,
        setAutoplayBlack,
    } = useChessGame();

    const turn = getTurn();

    return (
        <div className="main-container">
            <h1>Work in Progress Still...</h1>
            {check ? <span>Check!</span> : <br/>}
            <p>{turn[0].toUpperCase() + turn.slice(1)}'s turn</p>
            <Board 
                board={boardSnapshot}
                selectedSquare={selectedSquare}
                highlighted={moveOptions}
                suggestedMove={suggestedMove}
                showHint={showHint}
                draggedPiece={draggedPiece}
                dragPosition={dragPosition}
                handlePointerDown={handlePointerDown}
                handlePointerMove={handlePointerMove}
                handlePointerUp={handlePointerUp}
            />
            <br/>
            < EvalBar percentage = {winChance} />
            <br/>
            <label>
                Computer plays black: 
                <input type="checkbox" checked={autoplayBlack} onChange={(e) => setAutoplayBlack(e.target.checked)}>
                </input>
            </label>
            <br/>
            <button type="button" onClick={requestHint}>
                Hint
            </button>
            {showHint && suggestedMove?.san && <p>Suggested move: {suggestedMove.san}</p>}
        </div>
    )
}
