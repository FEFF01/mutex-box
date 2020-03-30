import { Model, Rect, Options } from './interfaces';
declare enum FLAGS {
    USE_CHECK = 1,
    FILL_EACHMODEL = 16,
    USE_OFFSET = 256,
    USE_EACHOFFSET = 4096
}
declare class MutexModel {
    options: Options;
    protected model_map: Array<Model | undefined>;
    protected model_list: Array<Model>;
    static FLAGS: typeof FLAGS;
    constructor(models?: Array<Model>, options?: Options);
    get ncols(): number;
    set ncols(ncols: number);
    setNCols(ncols: number, left_expand?: boolean | number): void;
    fill(models: Array<Model> | Model): void;
    clear(model: Model): number;
    remove(models: Array<Model> | Model): void;
    move(models: Array<Model> | Model, v2: [number, number] | Array<[number, number]>, flags?: number): Model[];
    getModel(col: number, row: number): Model | undefined;
    format(rect: Rect, col?: number, row?: number): Rect;
    trim(): Array<Model>;
    append(models: Array<Model> | Model): void;
    alloc(rect: Rect, trimmed_rect?: Rect, crossed_models?: Array<Model>, crossed_rect?: Rect): Array<Model>;
    cover(mask: Rect): Array<Model>;
    calcWrap(models: Array<Model>): Rect;
    calcOffset(flee_rect: Rect, target_rect: Rect): {
        l: number;
        r: number;
        t: number;
        b: number;
    };
    private _fill;
    private _pathTest;
    private _compress;
}
export default MutexModel;
