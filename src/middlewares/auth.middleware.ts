import {NextFunction, Response} from "express";
import * as jwt from 'jsonwebtoken';
import {IRequestWithUser} from "../interfaces/requestWithUser.interface";
import {userModel} from "../users/user.model";
import {WrongAuthenticationTokenException} from "../exceptions/WrongAuthenticationTokenException";
import {DataStoredInToken} from "../interfaces/dataStoredInToken";

export async function authMiddleware(req: IRequestWithUser, res: Response, next: NextFunction) {
    const {cookies} = req;
    if (cookies && cookies.Authorization){
        const secret = process.env.JWT_SECRET;
        try {
            const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
            console.debug('verificationResponse', verificationResponse);
            const id = verificationResponse._id;
            const user = await userModel.findById(id);
            console.debug('user', user);
            if (user) {
                req.user = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (e) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        console.debug('no cookie.')
        next(new WrongAuthenticationTokenException());
    }
}
