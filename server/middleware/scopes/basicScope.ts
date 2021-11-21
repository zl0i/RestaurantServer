import { BaseEntity, FindConditions } from "typeorm";

export interface ICondition<T extends BaseEntity> {
    findCondition: FindConditions<T>,
    key: string,
    value: number[]
}

export default abstract class BasicScope {
    constructor() { }

    abstract own(): Promise<ICondition<BaseEntity>>
    abstract points(ids: number[]): Promise<ICondition<BaseEntity>>
    abstract orders(ids: number[]): Promise<ICondition<BaseEntity>>
    abstract warehouses(ids: number[]): Promise<ICondition<BaseEntity>>
}