import { Injectable } from "@nestjs/common";
import { TypeBookRepositoryInterface } from "./typeBook.repository.interface";
import { TypeBook } from "../entities/typeBook.entity";
import { BaseRepositoryAbstract } from "src/base/base.abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class TypeBookRepository
    extends BaseRepositoryAbstract<TypeBook>
    implements TypeBookRepositoryInterface
{
    constructor(
        @InjectModel(TypeBook.name) 
        private readonly TypeBook: Model<TypeBook>
    ) {
        super(TypeBook);
    }
}