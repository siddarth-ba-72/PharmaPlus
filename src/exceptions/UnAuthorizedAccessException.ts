import { AbstractException } from "./AbstractException";

export class UnAuthorizedAccessException extends AbstractException {
    public responseStatusCode!: number;

    constructor(responseStatusCode: number, message: string) {
        super(responseStatusCode, message);
    }
}