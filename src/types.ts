interface Media {
    data: string;
    mimeType: string;
}

interface Response<T> {
    status: Aproval;
    message: T;
}

interface Dice {
    values: string;
    result: string;
}

enum Aproval {
    ALLOWED = "ALLOWED",
    DENIED = "DENIED"
}

export { Media, Response, Dice, Aproval }