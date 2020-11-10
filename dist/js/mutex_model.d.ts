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
    /**
     * 与使用场景无关的js内存模型
     * @param models
     * @param options
     */
    constructor(models?: Array<Model>, options?: Options);
    get ncols(): number;
    set ncols(ncols: number);
    /**
     * 设置模型列数
     * @param ncols 新的列数
     * @param left_expand 如果为true表示为左扩展，也可以（-1 左 ，1右）
     */
    setNCols(ncols: number, left_expand?: boolean | number): void;
    /**
     * 填充模型
     * @param models
     */
    fill(models: Array<Model> | Model): void;
    /**
     * 清除某个模型
     * @param model
     */
    clear(model: Model): number;
    /**
     * 移除模型
     * @param models
     */
    remove(models: Array<Model> | Model): void;
    /**
     * 移动某个或某组模型
     * @param models
     * @param v2
     * @param flags
     */
    move(models: Array<Model> | Model, v2: [number, number] | Array<[number, number]>, flags?: number): Model[];
    /**
     * 指定 col row 捕获在这位于上方的模型
     * @param col
     * @param row
     */
    getModel(col: number, row: number): Model | undefined;
    /**
     * 规整化合适的位置
     * @param rect
     * @param col
     * @param row
     */
    format(rect: Rect, col?: number, row?: number): Rect;
    /**
     * 纵向剪裁掉模型空白区域（现在只有纵向）
     */
    trim(): Array<Model>;
    /**
     * 自动寻找合适的地方加入模型
     * @param models
     */
    append(models: Array<Model> | Model): void;
    /**
     * 在指定位置开辟出指定大小的空间
     * @param rect
     * @param trimmed_rect
     * @param crossed_models
     * @param crossed_rect
     */
    alloc(rect: Rect, trimmed_rect?: Rect, crossed_models?: Array<Model>, crossed_rect?: Rect): Array<Model>;
    /**
     * 获得指定区域所包含的全部模型
     * @param mask
     */
    cover(mask: Rect): Array<Model>;
    /**
     * 计算能包含所有模型的最小矩形区域
     * @param models
     */
    calcWrap(models: Array<Model>): Rect;
    /**
     * 计算两区域的各向偏移
     * @param flee_rect
     * @param target_rect
     */
    calcOffset(origin_rect: Rect, target_rect: Rect): {
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
