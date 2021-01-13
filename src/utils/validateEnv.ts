// @ts-ignore
import {cleanEnv, port, str} from "envalid";

export function validateEvn() {
    cleanEnv(process.env, {
        MONGO_PATH: str(),
        PORT: port()
    })
}
