import {HttpException} from "./HttpException";

export class WrongAuthenticationTokenException extends HttpException{
    constructor() {
        super(401, 'error');
    }
}
