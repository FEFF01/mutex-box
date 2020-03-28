

interface Model {
    col?: number,
    row?: number,
    colspan?: number,
    rowspan?: number
    //[propName: string]: any
}
interface Rect extends Model {
    col: number,
    row: number,
    colspan: number,
    rowspan: number
}
interface layout {
    top: number,
    right: number,
    bottom: number,
    left: number
}

interface Box extends Model {
    left: number,
    top: number,
    width: number,
    height: number,
    dragging: boolean,
    space?: layout,
    capture?: layout | CaptureFunction
}
interface CaptureFunction {
    (e: TouchEvent | MouseEvent, t?: Touch | MouseEvent, ...boxes: Array<Box | Array<Box>>): boolean | Box | undefined
}
interface Options {
    ncols?: number,
    space?: layout,
    capture?: layout | CaptureFunction,
    onPick?: CaptureFunction;
    onMove?: CaptureFunction;
    onStay?: CaptureFunction;
    onDrop?: CaptureFunction;
    resize?: boolean,
    client_width?: number

}

export { Model, Rect, layout, Box, CaptureFunction, Options };