

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
    (e: TouchEvent | MouseEvent, t: Touch | MouseEvent, model: Box): boolean | Box | undefined
}
interface Option {
    ncols?: number,
    space?: layout,
    capture?: layout | CaptureFunction
}

export {Model,Rect,layout,Box,CaptureFunction,Option};