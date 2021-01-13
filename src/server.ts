import 'dotenv/config';
import {validateEvn} from "./utils/validateEnv";
import {App} from "./app";
import {PostsController} from "./posts/posts.controller";
import {AuthenticationController} from "./authentication/authentication.controller";

validateEvn();

const app = new App([
    new AuthenticationController(),
    new PostsController()
]);

app.listen();
