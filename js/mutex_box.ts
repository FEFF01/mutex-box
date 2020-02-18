


import { Model, Rect, layout, Box, CaptureFunction, Option } from './interfaces';

import MutexModel from './mutex_model';
const InputListener = require('input-listener');


class MutexBox extends MutexModel {
    inputListener?: typeof InputListener = null;
    space: layout = { top: 0, right: 0, bottom: 0, left: 0 };
    capture: layout | CaptureFunction = { top: 0, right: 0, bottom: 0, left: 0 };
    private target_box?: Box = null;
    static MutexModel = MutexModel;
    private _longtap_timeout?: number = null;
    private _client_width = 0;
    constructor(
        public vessel: HTMLElement,
        boxes?: Array<Box>,
        option: Option = {}
    ) {
        super(boxes, option.ncols);
        this.vessel = vessel;
        this.inputListener = new InputListener(vessel, {
            dragStart: this.dragStart,
            dragMove: this.dragMove,
            dragEnd: this.dragEnd,
        });
        this.resize(option);
        this.activate();
    }
    disable() {
        window.removeEventListener("resize", this._window_resize);
        this.inputListener.disable();
    }
    activate() {
        this._window_resize();
        window.addEventListener("resize", this._window_resize);
        this.inputListener.activate();
    }
    trim(): any {
        this._update(super.trim() as Array<Box>);
    }
    alloc(rect: Rect, before_rect?: Rect): any {
        this._update(super.alloc(rect, before_rect) as Array<Box>);
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
    resize(option: Option | number) {
        if (option instanceof Object) {
            option.space && (this.space = option.space);
            option.capture && (this.capture = option.capture);
            isNaN(option.ncols) || (this.ncols = option.ncols);
        } else {
            this.ncols = option;
        }
        this._client_width = this.vessel.clientWidth;
        this.update();
    }
    update(box?: Box, new_values?: Model) {
        if (box) {
            if (new_values instanceof Object) {
                //Object.assign(box, new_values);
                for (const key in new_values) {
                    box[key] = new_values[key];
                }
            }
            this.clear(box);
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
        let _left = t.clientX - rect.left, _top = t.clientY - rect.top;
        //let { col, row } = 
        this.target_box = this._get_box(_left, _top, e, t);
        if (this.target_box) {
            e.preventDefault();
            this.target_box.dragging = true;
            this.remove(this.target_box);
            //this._md = 0;
            return;
        }
        return true;
    }
    //_md = 0;
    dragMove = (e: TouchEvent | MouseEvent, v2: [number, number]) => {
        //this._md += v2[0] * v2[0] + v2[1] * v2[1];
        this.target_box.left += v2[0];
        this.target_box.top += v2[1];
        if (this._longtap_timeout) {
            window.clearTimeout(this._longtap_timeout);
            this._longtap_timeout = null;
        }
        this._longtap_timeout = window.setTimeout(this._put_box, 300);
    }
    dragEnd = (e: TouchEvent | MouseEvent) => {
        this._longtap_timeout && window.clearTimeout(this._longtap_timeout);
        this._put_box(true);
    }
    private _update(boxes: Array<Box>) {
        let ceil_size = this.cellSize;
        let _left, _top, _width, _height;
        for (const box of boxes) {
            let { left = 0, right = 0, top = 0, bottom = 0 } = box.space || this.space;
            _left = ceil_size * box.col + left;
            _top = ceil_size * box.row + top;
            _width = ceil_size * box.colspan - left - right;
            _height = ceil_size * box.rowspan - top - bottom;

            _left !== box.left && (box.left = _left);
            _top !== box.top && (box.top = _top);
            _width !== box.width && (box.width = _width);
            _height !== box.height && (box.height = _height);
        }
    }
    get cellSize() {
        return this._client_width / this.ncols;
    }
    private _window_resize = (e?: Event) => {
        if (this._client_width !== this.vessel.clientWidth) {
            this._client_width = this.vessel.clientWidth;
            this._update(this.model_list as Array<Box>);
        }
    }
    private _get_box(px: number, py: number, e: TouchEvent | MouseEvent, t: Touch | MouseEvent): Box | undefined {
        let ceil_size = this.cellSize;
        let box: Box | undefined = this.getModel(px / ceil_size | 0, py / ceil_size | 0) as (Box | undefined);

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
                let _x = box.col * ceil_size + space_left;
                let _y = box.row * ceil_size + space_top;
                let _w = box.colspan * ceil_size - space_right - space_left;
                let _h = box.rowspan * ceil_size - space_top - space_bottom;

                let zx = px - _x - _w / 2, zy = py - _y - _h / 2;
                let zd = Math.sqrt(zx ** 2 + zy ** 2);
                let radian = Math.atan2(zy, zx);
                let r_h = Math.atan(_w / _h) * 2;
                let r_v = Math.PI - r_h;
                let _h_rv = r_v / 2;
                let _h_pi = Math.PI / 2;

                switch (true) {
                    case radian < - _h_rv && radian > - r_h - _h_rv://top
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
    private _put_box = (is_release?: boolean) => {
        this._longtap_timeout = null;
        let box = this.target_box;
        let ceil_size = this.cellSize;
        let col = box.left / ceil_size, row = box.top / ceil_size;
        this.alloc({
            col, row,
            colspan: box.colspan,
            rowspan: box.rowspan
        }, box as Rect);
        if (is_release === true) {
            box.dragging = false;
            this.format(box as Rect, col, row);
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

//export default MutexBox;
module.exports = MutexBox;//使用 module.exports 是为了import 和 require 都直接可用


