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
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        requestHint,
        getTurn
    } = useChessGame();

    const turn = getTurn()

    return (
        <div className="main-container">
            <h1>Work in Progress Still...</h1>
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
            <button type="button" onClick={requestHint}>
                Hint
            </button>
            {showHint && showHint?.san && <p>Suggested move: {suggestedMove.san}</p>}
            <br/>
        </div>
    )
}
