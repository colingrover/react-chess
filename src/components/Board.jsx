import Tile from './Tile.jsx';
import { NUM_FILES, NUM_RANKS } from "../constants.js";

export default function Board({board}) {
    return(
        <table style={{ borderCollapse: "collapse", border: "2px solid #333" }}>
            <tbody>
                {board.map((rankRow, rankIndex) => (
                <tr key={rankIndex}>
                    {rankRow.map((piece, fileIndex) => (
                    <Tile
                        key={`${rankIndex}-${fileIndex}`}
                        rank={rankIndex}
                        file={fileIndex}
                        piece={piece}
                    />
                    ))}
                </tr>
                ))}
            </tbody>
        </table>
    );
}