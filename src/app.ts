import * as express from 'express';
import * as mongoose from "mongoose";
import * as cookieParser from "cookie-parser";
import {errorMiddleware} from "./middlewares/error.middleware";
import {IController} from "./interfaces/controller.interface";

export class App {
    public app: express.Application;

    constructor(controllers) {
        this.app = express();

        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHanding();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(cookieParser());
    }

    private initializeControllers(controllers: IController[]) {
        controllers.forEach(controller => {
            this.app.use(controller.path, controller.router)
        });
    }

    private initializeErrorHanding() {
        this.app.use(errorMiddleware);
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    private connectToDatabase() {
        const {
            MONGO_PATH
        } = process.env;
        mongoose.connect(`mongodb://${MONGO_PATH}`);
    }
}
