export default class MoveDisallowedError extends Error {
    static SELF_CHECK = "SELF_CHECK";
    static OUT_OF_TURN = "OUT_OF_TURN";
    static GENERIC = "GENERIC";
    static CHECKED_CASTLE = "CHECKED_CASTLE";

    constructor(code, message) {
        super(message);
        this.name = "MoveDisallowedError";
        this.code = code;
    }
}
