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
    } = useChessGame();

    return (
        <>
            <h1>Hello, world!</h1>
            <p>Not much to see yet :/</p>
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
