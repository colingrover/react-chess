import { useState, useRef, useCallback } from 'react';
import ChessGame from '../logic/chessGame.js';

export function useChessGame() {
    // 1. Maintain a persistent instance across renders using useRef
    const gameRef = useRef(null);
    if (!gameRef.current) {
        gameRef.current = new ChessGame();
    }

    // 2. Mirror the lightweight snapshot in React state to drive UI updates
    const [boardSnapshot, setBoardSnapshot] = useState(() => 
        gameRef.current.getBoardSnapshot()
    );

    const [selectedSquare, setSelectedSquare] = useState(null); // { rank, file }
    const [moveOptions, setMoveOptions] = useState(null); // 8x8 boolean grid

    // Helper to trigger a React render whenever the underlying engine state changes
    const updateUI = useCallback(() => {
        setBoardSnapshot(gameRef.current.getBoardSnapshot());
    }, []);

    // Update moveOptions to highlight available moves based on selected piece
    const getMoveOptions = useCallback((rank, file) => {
        setMoveOptions(gameRef.current.getBasicMoves(rank, file));
    }, []);

    const handlePointerDown = useCallback((rank, file) => {
        if (boardSnapshot[rank][file] !== null) {
            setSelectedSquare({ rank, file });
            const piece = boardSnapshot[rank][file];
            getMoveOptions(rank, file);
        }
    }, []);

    const handlePointerUp = useCallback((rank, file) => {

    }, []);

    // Dispatch move action to the class engine
    const attemptMove = useCallback((fromRank, fromFile, toRank, toFile) => {
        gameRef.current.attemptMove(fromRank, fromFile, toRank, toFile);
        setSelectedSquare(null);
        setValidMoves(null);
        updateUI();
    }, [updateUI]);

    return {
        boardSnapshot,
        selectedSquare,
        moveOptions,
        handlePointerDown,
        handlePointerUp,
        attemptMove,
    };
}