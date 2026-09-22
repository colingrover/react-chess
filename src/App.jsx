import { useState } from 'react'
import Board from './components/Board.jsx';
import ChessGame from './logic/chess.js';

export default function App() {
    const [game, setGame] = useState(new ChessGame());

    return (
        <>
            <h1>Hello, world!</h1>
            <p>Not much to see yet :/</p>
            <Board board={game.getBoardSnapshot()}/>
        </>
    )
}
