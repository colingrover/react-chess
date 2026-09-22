import { Piece } from "../logic/piece.js";
import rookWhite from "../assets/piece_w_rook.png";
import rookBlack from "../assets/piece_b_rook.png";
import knightWhite from "../assets/piece_w_knight.png";
import knightBlack from "../assets/piece_b_knight.png";
import bishopWhite from "../assets/piece_w_bishop.png";
import bishopBlack from "../assets/piece_b_bishop.png";
import queenWhite from "../assets/piece_w_queen.png";
import queenBlack from "../assets/piece_b_queen.png";
import kingWhite from "../assets/piece_w_king.png";
import kingBlack from "../assets/piece_b_king.png";
import pawnWhite from "../assets/piece_w_pawn.png";
import pawnBlack from "../assets/piece_b_pawn.png";

const PIECE_IMAGES = {
    [Piece.Colour.WHITE]: {
        [Piece.Type.ROOK]:      rookWhite,
        [Piece.Type.KNIGHT]:    knightWhite,
        [Piece.Type.BISHOP]:    bishopWhite,
        [Piece.Type.QUEEN]:     queenWhite,
        [Piece.Type.KING]:      kingWhite,
        [Piece.Type.PAWN]:      pawnWhite,
    },
    [Piece.Colour.BLACK]: {
        [Piece.Type.ROOK]:      rookBlack,
        [Piece.Type.KNIGHT]:    knightBlack,
        [Piece.Type.BISHOP]:    bishopBlack,
        [Piece.Type.QUEEN]:     queenBlack,
        [Piece.Type.KING]:      kingBlack,
        [Piece.Type.PAWN]:      pawnBlack,
    }
};

export default function Tile({ rank, file, piece }) {
    const tileIsBlack = (rank + file) % 2 == 0;

    const pieceSrc = piece ? PIECE_IMAGES[piece.colour]?.[piece.type] : null;

    return (
        <td
            style={{
                width: "50px",
                height: "50px",
                textAlign: "center",
                verticalAlign: "middle",
                backgroundColor: tileIsBlack ? "#b58863" : "#f0d9b5",
            }}
        >
            {pieceSrc && (
                <img
                    src={pieceSrc}
                    alt={`${piece.colour} ${piece.type}`}
                    style={{ width: "40px", height: "40px" }}
                />
            )}
        </td>
    );
}