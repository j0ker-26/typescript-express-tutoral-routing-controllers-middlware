import * as mongoose from 'mongoose';
import {IPost} from "./posts.interface";

const postSchema = new mongoose.Schema({
    author: String,
    content: String,
    title: String
});

export const postModel = mongoose.model<IPost & mongoose.Document>('Post', postSchema);
