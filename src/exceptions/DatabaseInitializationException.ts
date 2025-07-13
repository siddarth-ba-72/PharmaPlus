import { AbstractException } from "./AbstractException";

export class DatabaseInitializationException extends AbstractException {
    public responseStatusCode!: number;

    constructor(responseStatusCode: number, message: string) {
        super(responseStatusCode, message);
    }
}