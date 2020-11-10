interface Model {
    col?: number;
    row?: number;
    colspan?: number;
    rowspan?: number;
}
interface Rect extends Model {
    col: number;
    row: number;
    colspan: number;
    rowspan: number;
}
interface layout {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
interface Box extends Model {
    /**
     * 可以通过响应 left top width height dragging 这些值的变化动态更改每个box绑定的元素属性
     */
    left: number;
    top: number;
    width: number;
    height: number;
    dragging: boolean;
    space?: layout;
    capture?: layout | CaptureFunction;
}
interface CaptureFunction {
    (e: TouchEvent | MouseEvent, t?: Touch | MouseEvent, ...boxes: Array<Box | Array<Box>>): boolean | Box | undefined;
}
interface Options {
    ncols?: number;
    space?: layout;
    /**
     * 容器内每个元素的拖拽捕获区域（相对于中心点 上下左右 四个方向的捕获区域）
     * 0表示全捕获，正数代表从某条边至该数值的梯形区域不捕获
     * 负数代表从某条边至该数绝对值的梯形区域捕获
     */
    capture?: layout | CaptureFunction;
    onPick?: CaptureFunction;
    onMove?: CaptureFunction;
    /**
     * 某一被拾取的箱子拖拽过程中在某个地方停留时被调用（默认该box停留区域底部所有box会被排挤），
     * 如果返回true可以中断整个动作反馈和监听过程
     */
    onStay?: CaptureFunction;
    /**
     * 放开某一被拾取的箱子时被回调（默认该box底部所有box会被排挤，并将该box放置在底部区域），
     * 如果返回true可以中断整个动作反馈和监听过程
     */
    onDrop?: CaptureFunction;
    /**
     * MutexBox默认取构造时传入的容器元素 clientWidth 作为容器宽度并影响到每个box的大小位置，
     * 指定该值则直接取该值而不关心容器元素
     */
    client_width?: number;
}
export { Model, Rect, layout, Box, CaptureFunction, Options };
