import {Request} from 'express';
import {IUser} from 'users/user.interface';

export interface IRequestWithUser extends Request{
    user: IUser;
}
