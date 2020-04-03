import { Model, layout, Box, CaptureFunction, Options } from './interfaces';
import MutexModel from './mutex_model';
declare const InputListener: any;
declare class MutexBox extends MutexModel {
    vessel: HTMLElement;
    inputListener?: typeof InputListener;
    static space: layout;
    static capture: layout;
    static InputListener: any;
    private target_box?;
    static MutexModel: typeof MutexModel;
    private _stay_timeout?;
    private _client_width;
    /**
     * @description 在指定html容器内实例化控制器
     * @param vessel 容器元素（在该元素上监听各种交互，通过该元素的 clientWidth 属性确定每个box的大小）
     * @param boxes box列表
     * @param options 参考 interfaces.ts -> Options
     */
    constructor(vessel: HTMLElement, boxes: Array<Box>, options?: Options);
    /**
     * @description 取消容器事件监听
     */
    disable(): void;
    get capture(): layout | CaptureFunction;
    get space(): layout;
    /**
     * @description 激活容器事件监听
     */
    activate(): void;
    /**
     * @description 移除某个或一组box
     * @param boxes
     */
    remove(boxes: Array<Box> | Box): void;
    /**
     * @description 添加一个或一组box，对于单个box如果
     * box.col >= 0 && box.col + box.colspan <= this.ncols && box.row >= 0 成立则强制在指定位置填充该box，
     * 如果不成立则自动寻找在合适的位置填充该box
     * @param boxes
     */
    add(boxes: Array<Box> | Box): void;
    /**
     * @description mutex-box不会主动判断容器元素宽度是否发生改变，当容器宽度发生改变需要立即响应时可以主动调用该方法
     *  当容器内列数发生改变时可以调用该方法传入新的列数，并通知列数改变是为右扩展还是左扩展
     * @param ncols 如果为列数更改，传入新的列数
     * @param direction  -1表示左扩展，1表示右扩展（默认为1）
     */
    resize: (ncols?: number, direction?: number | boolean) => void;
    get clientWidth(): number;
    /**
     * @description 某个box col row colspan rowspan关系到排版的属性发生改变时，可以调用该方法执行更新
     * @param box
     * @param new_values
     */
    update(box?: Box, new_values?: Model): void;
    dragStart: (e: TouchEvent | MouseEvent, t: MouseEvent | Touch) => boolean;
    private _e?;
    private _t?;
    dragMove: (e: TouchEvent | MouseEvent, v2: [number, number], t: MouseEvent | Touch) => void;
    dragEnd: (e: TouchEvent | MouseEvent, t: MouseEvent | Touch) => void;
    private _update;
    get cellSize(): number;
    private _get_box;
    /**
     * @description 当从其他mutexBox实例或其他地方有元素被拖拽到当前mutexBox容器范围之内，而且需要当前容器接收该元素，则可以调用该方法（一般用于dragMove阶段让当前mutexBox过继手势监听状态）
     * @param e 如果参数e、t同时存在则为过继dragMove状态，否则为立即dragEnd
     * @param t 如果参数e、t同时存在则为过继dragMove状态，否则为立即dragEnd
     * @param box
     */
    receive(e?: TouchEvent | MouseEvent, t?: Touch | MouseEvent, box?: Box): void;
    move(models: Array<Box> | Box, v2: [number, number] | Array<[number, number]>, flags?: number): Model[];
    put: (is_release?: boolean, box?: Box, e?: TouchEvent | MouseEvent, t?: MouseEvent | Touch) => void;
}
export { InputListener, MutexBox, MutexModel };
export default MutexBox;
