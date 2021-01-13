import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import {IUser} from "../users/user.interface";
import {UserWithThatEmailAlreadyExistsException} from '../exceptions/UserWithThatEmailAlreadyExistsException';
import {WrongCredentialsException} from '../exceptions/WrongCredentialsException';
import {IController} from "../interfaces/controller.interface";
import {DataStoredInToken} from "../interfaces/dataStoredInToken";
import {TokenData} from "../interfaces/tokenData.interface";
import {validationMiddleware} from '../middlewares/validation.middleware';
import {CreateUserDto} from '../users/user.dto';
import {userModel} from "../users/user.model";
import {LogInDto} from './logIn.dto';

export class AuthenticationController implements IController {
    public path = '/auth';
    public router = express.Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/register', validationMiddleware(CreateUserDto), this.registration.bind(this));
        this.router.post('/login', validationMiddleware(LogInDto), this.loggingIn.bind(this));
        this.router.post('/logout', this.loggingOut.bind(this));
    }

    private async registration(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userData: CreateUserDto = req.body;
        if (await this.user.findOne({email: userData.email})) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.user.create({...userData, password: hashedPassword});
            user.password = undefined;
            console.debug('user', user);
            const tokenData = this.createToken(user);
            res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
            res.send(user);
        }
    }

    private async loggingIn(req: express.Request, res: express.Response, next: express.NextFunction) {
        const logInData: LogInDto = req.body;
        const user = await this.user.findOne({email: logInData.email});
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined;
                const tokenData = this.createToken(user);
                res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                res.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

    private loggingOut(req: express.Request, res: express.Response) {
        res.setHeader('Set-Cookie', ['Authorization=;Max-Age=0']);
        res.send(200);
    }

    private createToken(user: IUser): TokenData {
        const expiresIn = 60 * 60;
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, {expiresIn})
        }
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
}
