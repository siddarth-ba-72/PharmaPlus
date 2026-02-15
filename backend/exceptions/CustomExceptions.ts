import { AbstractException } from "./AbstractException";

export class BadRequestException extends AbstractException {
    public responseStatusCode!: number;

    constructor(responseStatusCode: number, message: string) {
        super(responseStatusCode, message);
    }
}

export class DatabaseInitializationException extends AbstractException {
    public responseStatusCode!: number;

    constructor(responseStatusCode: number, message: string) {
        super(responseStatusCode, message);
    }
}

export class UnAuthorizedAccessException extends AbstractException {
    public responseStatusCode!: number;

    constructor(responseStatusCode: number, message: string) {
        super(responseStatusCode, message);
    }
}

export class ResourceNotFoundException extends AbstractException {
    public responseStatusCode!: number;

    constructor(responseStatusCode: number, message: string) {
        super(responseStatusCode, message);
    }
}