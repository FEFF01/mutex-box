


import { Model, Rect, layout, Box, CaptureFunction, Options } from './interfaces';

import MutexModel from './mutex_model';
const InputListener = require('input-listener');


class MutexBox extends MutexModel {
    inputListener?: typeof InputListener = null;
    static space: layout = { top: 0, right: 0, bottom: 0, left: 0 };
    static capture: layout = { top: 0, right: 0, bottom: 0, left: 0 };
    static InputListener = InputListener;
    private target_box?: Box;
    static MutexModel = MutexModel;
    private _stay_timeout?: number;
    private _client_width = 0;
    constructor(
        public vessel: HTMLElement,
        boxes: Array<Box>,
        options: Options = {}
    ) {
        super(boxes as Array<Model>, options);
        this.vessel = vessel;
        this.inputListener = new InputListener(vessel, {
            dragStart: this.dragStart,
            dragMove: this.dragMove,
            dragEnd: this.dragEnd,
        });
        this.activate();
    }
    disable() {
        this.inputListener.disable();
    }
    get capture() {
        return this.options.capture || MutexBox.capture;
    }
    get space() {
        return this.options.space || MutexBox.space;
    }
    activate() {
        this.resize();
        this.inputListener.activate();
    }
    trim(): any {
        this._update(super.trim() as Array<Box>);
    }
    alloc(rect: Rect, before_rect?: Rect, trimmed_rect?: Rect, crossed_models?: Array<Model>): any {
        this._update(super.alloc(rect, before_rect, trimmed_rect, crossed_models) as Array<Box>);
    }
    remove(boxes: Array<Box> | Box) {
        super.remove(boxes);
    }
    add(boxes: Array<Box> | Box) {
        boxes instanceof Array || (boxes = [boxes]);
        for (const box of boxes) {
            if (box.col >= 0 && box.col + box.colspan <= this.ncols && box.row >= 0) {
                this.alloc(box as Rect);
                this.fill(box);
            } else {
                this.append(box);
            }
        }
        this._update(boxes);
    }
    resize = (ncols: number = this.options.ncols, direction?: boolean | number) => {
        let client_width = this.clientWidth;
        if (ncols !== this.ncols || this._client_width !== client_width) {
            this.setNCols(ncols, direction)
            this._client_width = client_width;
            this._update(this.model_list as Array<Box>);
        }
    }
    get clientWidth() {
        return isFinite(this.options.client_width) ? this.options.client_width : this.vessel.clientWidth;
    }
    update(box?: Box, new_values?: Model) {
        if (box) {
            super.clear(box);
            if (new_values instanceof Object) {
                //Object.assign(box, new_values);
                for (const key in new_values) {
                    box[key] = new_values[key];
                }
            }
            this.alloc(box as Rect);
            this.fill(box);
            this._update([box]);
        } else {
            this._update(this.model_list as Array<Box>);
        }
    }
    dragStart = (e: TouchEvent | MouseEvent, t: Touch | MouseEvent) => {
        //e.preventDefault();
        let rect = this.vessel.getBoundingClientRect();
        let _left = t.clientX - rect.left;
        let _top = t.clientY - rect.top;
        //let { col, row } = 
        this.target_box = this._get_box(_left, _top, e, t);
        if (
            this.target_box &&
            !(
                this.options.onPick &&
                this.options.onPick(e, t, this.target_box)
            )
        ) {
            e.preventDefault();
            this.target_box.dragging = true;
            this.remove(this.target_box);
            return;
        }
        return true;
    }
    private _e?: TouchEvent | MouseEvent;
    private _t?: Touch | MouseEvent;
    dragMove = (e: TouchEvent | MouseEvent, v2: [number, number], t: Touch | MouseEvent) => {
        this.target_box.left += v2[0];
        this.target_box.top += v2[1];
        if (this._stay_timeout) {
            window.clearTimeout(this._stay_timeout);
            this._stay_timeout = null;
        }

        if (this.options.onMove && this.options.onMove(e, t, this.target_box)) {
            this.inputListener.break();
            this.target_box = null;
            return;
        }
        this._e = e;
        this._t = t;
        this._stay_timeout = window.setTimeout(this.put, 300);
    }
    dragEnd = (e: TouchEvent | MouseEvent, t: Touch | MouseEvent) => {
        this._stay_timeout && window.clearTimeout(this._stay_timeout);
        this._e = e;
        this._t = t;
        this.put(true);
    }
    private _update(boxes: Array<Box>) {
        let cell_size = this.cellSize;
        let _left, _top, _width, _height;
        for (const box of boxes) {
            let { left = 0, right = 0, top = 0, bottom = 0 } = box.space || this.space;
            _left = cell_size * box.col + left;
            _top = cell_size * box.row + top;
            _width = cell_size * box.colspan - left - right;
            _height = cell_size * box.rowspan - top - bottom;

            _left !== box.left && (box.left = _left);
            _top !== box.top && (box.top = _top);
            _width !== box.width && (box.width = _width);
            _height !== box.height && (box.height = _height);
        }
    }
    get cellSize() {
        return this.clientWidth / this.ncols;
    }
    private _get_box(px: number, py: number, e: TouchEvent | MouseEvent, t: Touch | MouseEvent): Box | undefined {
        let cell_size = this.cellSize;
        let box: Box | undefined = this.getModel(px / cell_size | 0, py / cell_size | 0) as (Box | undefined);

        function _hit(length: number, distance: number, capture: number): boolean {
            if (capture >= 0) {
                return distance < length - capture;
            } else {
                return distance >= length + capture && distance < length;
            }
        }
        if (box) {
            let capture = box.capture || this.capture;
            if (capture instanceof Function) {
                let res = capture(e, t, box);
                return res === true ? box : (res === false ? undefined : res);
            } else {
                let {
                    top: space_top = 0,
                    right: space_right = 0,
                    bottom: space_bottom = 0,
                    left: space_left = 0
                } = box.space || this.space;
                let {
                    top: capture_top = 0,
                    right: capture_right = 0,
                    bottom: capture_bottom = 0,
                    left: capture_left = 0
                } = capture;
                let _x = box.col * cell_size + space_left;
                let _y = box.row * cell_size + space_top;
                let _w = box.colspan * cell_size - space_right - space_left;
                let _h = box.rowspan * cell_size - space_top - space_bottom;

                let zx = px - _x - _w / 2;
                let zy = py - _y - _h / 2;
                let zd = Math.sqrt(zx ** 2 + zy ** 2);
                let radian = Math.atan2(zy, zx);
                let r_h = Math.atan(_w / _h) * 2;
                let r_v = Math.PI - r_h;
                let _h_rv = r_v / 2;
                let _h_pi = Math.PI / 2;
                switch (true) {
                    case radian < -_h_rv && radian > -r_h - _h_rv://top
                        return _hit(_h / 2, zd * Math.cos(_h_pi + radian), capture_top) && box;
                    case Math.abs(radian) <= _h_rv://right
                        return _hit(_w / 2, zd * Math.cos(radian), capture_right) && box;
                    case radian > _h_rv && radian < _h_rv + r_h://bottom
                        return _hit(_h / 2, Math.abs(zd * Math.cos(_h_pi + radian)), capture_bottom) && box;
                    case Math.abs(radian) >= r_h + _h_rv://left
                        return _hit(_w / 2, Math.abs(zd * Math.cos(radian)), capture_left) && box;
                }
            }
        }
    }

    receive(e, t, box: Box) {
        if (this.target_box) {
            window.clearTimeout(this._stay_timeout);
            this.put(true);
            this.inputListener.break();
        }
        this.target_box = box;
        if (e && t) {
            this.inputListener.addPoint(t);
            this._stay_timeout = window.setTimeout(this.put, 300);
        } else {
            this.put(true);
        }
    }
    put = (
        is_release?: boolean,
        box: Box = this.target_box,
        e: TouchEvent | MouseEvent = this._e,
        t: Touch | MouseEvent = this._t,
    ) => {
        this._stay_timeout = undefined;
        let cell_size = this.cellSize;
        let col = box.left / cell_size, row = box.top / cell_size;
        let rect = {
            col, row,
            colspan: box.colspan,
            rowspan: box.rowspan
        }
        let trimmed_rect = this.format({ ...rect });
        let crossed_models = this.cover(trimmed_rect);
        let listener = (is_release ? this.options.onDrop : this.options.onStay);
        if (listener && listener(e, t, box, crossed_models as Array<Box>)) {
            if (!is_release) {
                this.inputListener.break();
            }
            this.target_box = null;
            return;
        }
        this.alloc(rect, box as Rect, trimmed_rect, crossed_models);
        this.format(box as Rect, col, row);
        if (is_release === true) {
            box.dragging = false;
            this.fill(box);
            this._update([box]);
            this.target_box = null;
        }
    }
}

try {
    (window as any).MutexBox = MutexBox;
} catch (e) {

}

export { InputListener, MutexBox, MutexModel };
export default MutexBox;
//module.exports = MutexBox;//使用 module.exports 是为了import 和 require 都直接可用


