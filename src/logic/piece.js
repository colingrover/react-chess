export const ROOK_DIRECTIONS = [[0,-1], [0,1], [-1,0], [1,0]];
export const BISHOP_DIRECTIONS = [[-1,-1], [-1,1], [1,-1], [1,1]];
export const QUEEN_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];

export const KNIGHT_OFFSETS = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
export const KING_OFFSETS = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];

export class Piece {
    static Colour = Object.freeze({
        BLACK: "black",
        WHITE: "white"
    });

    static Type = Object.freeze({
        ROOK: "rook",
        KNIGHT: "knight",
        BISHOP: "bishop",
        QUEEN: "queen",
        KING: "king",
        PAWN: "pawn"
    });

    constructor({colour, type, hasMoved = false}) {
        this.colour = colour;
        this.type = type;
        this.hasMoved = hasMoved;
    }

    /**
     * Gets the FEN character representative of this piece
     * @returns {string}
     */
    getFEN() {
        let ret;

        switch (this.type) {
            case Piece.Type.ROOK:
                ret = "r";
                break;
            case Piece.Type.KNIGHT:
                ret = "n";
                break;
            case Piece.Type.BISHOP:
                ret = "b";
                break;
            case Piece.Type.QUEEN:
                ret = "q";
                break;
            case Piece.Type.KING:
                ret = "k";
                break;
            case Piece.Type.PAWN:
                ret = "p";
                break;
        }

        if (this.colour === Piece.Colour.WHITE) {
            ret = ret.toUpperCase();
        }

        return ret;
    }

    // /**
    //  * Creates a new Piece instance with identical state.
    //  * @returns {Piece}
    //  */
    // clone() {
    //     return new Piece({
    //         colour: this.colour,
    //         type: this.type,
    //         hasMoved: this.hasMoved
    //     });
    // }
}