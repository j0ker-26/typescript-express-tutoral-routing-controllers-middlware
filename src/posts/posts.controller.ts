import {Router, Request, Response, NextFunction} from "express";
import {IController} from "../interfaces/controller.interface";
import {IPost} from './posts.interface';
import {postModel} from "./posts.model";
import {PostNotFoundException} from "../exceptions/PostNotFoundException";
import {validationMiddleware} from "../middlewares/validation.middleware";
import {CreatePostDto} from "./post.dto";
import {authMiddleware} from "../middlewares/auth.middleware";
import {IRequestWithUser} from "../interfaces/requestWithUser.interface";

export class PostsController implements IController {
    public path = '/posts';
    public router = Router();
    private post = postModel;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get('/', this.getAllPosts.bind(this));
        this.router.get('/:id', this.getPostById.bind(this));
        this.router
            .all('/*', authMiddleware)
            .patch('/:id', validationMiddleware(CreatePostDto, true), this.modifyPost.bind(this))
            .delete('/:id', this.deletePost.bind(this))
            .post('/', validationMiddleware(CreatePostDto), this.createPost.bind(this));
    }

    private getAllPosts(req: Request, res: Response) {
        this.post.find()
            .then(posts => {
                res.send(posts);
            });
    }

    private getPostById(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params;
        this.post.findById(id)
            .then(post => {
                if (post) {
                    res.send(post);
                } else {
                    next(new PostNotFoundException(id));
                }
            });
    }

    private modifyPost(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params;
        const postData: IPost = req.body;
        this.post.findByIdAndUpdate(id, postData, {new: true})
            .then(post => {
                if (post) {
                    res.send(post);
                } else {
                    next(new PostNotFoundException(id));
                }
            });
    }

    private async createPost(req: IRequestWithUser, res: Response) {
        const postData: IPost = req.body;
        const createPost = new this.post({
            ...postData,
            authorId: req.user._id
        });
        const savedPost = await createPost.save();
        res.send(savedPost);
    }

    private deletePost(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params;
        this.post.findByIdAndDelete(id)
            .then(successResponse => {
                if (successResponse) {
                    res.sendStatus(200);
                } else {
                    next(new PostNotFoundException(id));
                }
            });
    }

}
