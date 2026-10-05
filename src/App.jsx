import { useState } from 'react'
import Board from './components/Board.jsx';
import {useChessGame} from './hooks/useChessGame.js';

export default function App() {
    const {
        boardSnapshot,
        selectedSquare,
        moveOptions,
        draggedPiece,
        dragPosition,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        getTurn
    } = useChessGame();

    const turn = getTurn()

    return (
        <>
            <h1>Work in Progress Still...</h1>
            <p>{turn[0].toUpperCase() + turn.slice(1)}'s turn</p>
            <Board 
                board={boardSnapshot}
                selectedSquare={selectedSquare}
                highlighted={moveOptions}
                draggedPiece={draggedPiece}
                dragPosition={dragPosition}
                handlePointerDown={handlePointerDown}
                handlePointerMove={handlePointerMove}
                handlePointerUp={handlePointerUp}
            />
        </>
    )
}
