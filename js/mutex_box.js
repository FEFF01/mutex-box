"use strict";

//import InputListener from 'input-listener';
const ImputListener = require('input-listener');
const MutexModel = require('./mutex_model.js');


class MutexBox extends MutexModel {
    vessel = null;
    inputListener = null;
    space = { top: 0, right: 0, bottom: 0, left: 0 };
    capture = { top: 0, right: 0, bottom: 0, left: 0 };
    target_model = null;
    static MutexModel = MutexModel;
    _longtap_timeout = null;
    _client_width = 0;
    constructor(vessel, models, option = {}) {
        super(models, option.ncols);
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
    trim() {
        this._update(super.trim());
    }
    alloc(rect, before_rect) {
        this._update(super.alloc(rect, before_rect));
    }
    remove(models) {
        super.remove(models);
    }
    add(models) {
        models instanceof Array || (models = [models]);
        for (const model of models) {
            if (model.col >= 0 && model.col + model.colspan <= this.ncols && model.row >= 0) {
                this.alloc(model);
                this.fill(model);
            } else {
                this.append(model);
            }
        }
        this._update(models);
    }
    resize(option) {
        if (isNaN(option)) {
            if (option instanceof Object) {
                option.space && (this.space = option.space);
                option.capture && (this.capture = option.capture);
                isNaN(option.ncols) || (this.ncols = option.ncols);
            }
        } else {
            this.ncols = option;
        }
        this._client_width = this.vessel.clientWidth;
        this.update();
    }
    update(model, new_values) {
        if (model) {
            if (new_values instanceof Object) {
                //Object.assign(model,new_values);
                for (const key in new_values) {
                    model[key] = new_values[key];
                }
            }
            this.clear(model);
            this.alloc(model);
            this.fill(model);
            this._update([model]);
        } else {
            this._update(this.model_list);
        }
    }
    dragStart = (e, t) => {
        //e.preventDefault();
        let rect = this.vessel.getBoundingClientRect();
        let _left = t.clientX - rect.left, _top = t.clientY - rect.top;
        //let { col, row } = 
        this.target_model = this._get_model(_left, _top, e, t);
        if (this.target_model) {
            e.preventDefault();
            this.target_model.dragging = true;
            this.remove(this.target_model);
            //this._md = 0;
            return;
        }
        return true;
    }
    //_md = 0;
    dragMove = (e, v2) => {
        //this._md += v2[0] * v2[0] + v2[1] * v2[1];
        this.target_model.left += v2[0];
        this.target_model.top += v2[1];
        if (this._longtap_timeout) {
            window.clearTimeout(this._longtap_timeout);
            this._longtap_timeout = null;
        }
        this._longtap_timeout = window.setTimeout(this._put_model, 300);
    }
    dragEnd = (e) => {
        this._longtap_timeout && window.clearTimeout(this._longtap_timeout);
        this._put_model(true);
    }
    _update(models) {
        let ceil_size = this.cellSize;
        let _left, _top, _width, _height;
        for (const model of models) {
            let { left = 0, right = 0, top = 0, bottom = 0 } = model.space || this.space;
            _left = ceil_size * model.col + left;
            _top = ceil_size * model.row + top;
            _width = ceil_size * model.colspan - left - right;
            _height = ceil_size * model.rowspan - top - bottom;

            _left !== model.left && (model.left = _left);
            _top !== model.top && (model.top = _top);
            _width !== model.width && (model.width = _width);
            _height !== model.height && (model.height = _height);
        }
    }
    get cellSize() {
        return this._client_width / this.ncols;
    }
    _window_resize = (e) => {
        if (this._client_width !== this.vessel.clientWidth) {
            this._client_width = this.vessel.clientWidth;
            this._update(this.model_list);
        }
    }
    _get_model(px, py, e, t) {
        let ceil_size = this.cellSize;
        let model = this.getModel(px / ceil_size | 0, py / ceil_size | 0);
        if (model) {
            let capture = model.capture || this.capture;
            if (capture instanceof Function) {
                let res = capture(e, t, model)
                return res === true ? model : res;
            } else {
                let {
                    top: space_top = 0,
                    right: space_right = 0,
                    bottom: space_bottom = 0,
                    left: space_left = 0
                } = model.space || this.space;
                let {
                    top: capture_top = 0,
                    right: capture_right = 0,
                    bottom: capture_bottom = 0,
                    left: capture_left = 0
                } = capture;
                let _x = model.col * ceil_size + space_left;
                let _y = model.row * ceil_size + space_top;
                let _w = model.colspan * ceil_size - space_right - space_left;
                let _h = model.rowspan * ceil_size - space_top - space_bottom;

                let zx = px - _x - _w / 2, zy = py - _y - _h / 2;
                let zd = Math.sqrt(zx ** 2 + zy ** 2);
                let radian = Math.atan2(zy, zx);
                let r_h = Math.atan(_w / _h) * 2;
                let r_v = Math.PI - r_h;
                let _h_rv = r_v / 2;
                let _h_pi = Math.PI / 2;

                function _hit(length, distance, capture) {
                    if (capture >= 0) {
                        return distance < length - capture;
                    } else {
                        return distance >= length + capture && distance < length;
                    }
                }
                switch (true) {
                    case radian < - _h_rv && radian > - r_h - _h_rv://top
                        return _hit(_h / 2, zd * Math.cos(_h_pi + radian), capture_top) && model;
                    case Math.abs(radian) <= _h_rv://right
                        return _hit(_w / 2, zd * Math.cos(radian), capture_right) && model;
                    case radian > _h_rv && radian < _h_rv + r_h://bottom
                        return _hit(_h / 2, Math.abs(zd * Math.cos(_h_pi + radian)), capture_bottom) && model;
                    case Math.abs(radian) >= r_h + _h_rv://left
                        return _hit(_w / 2, Math.abs(zd * Math.cos(radian)), capture_left) && model;
                }
            }
        }
    }
    _put_model = (is_release) => {
        this._longtap_timeout = null;
        let model = this.target_model;
        let ceil_size = this.cellSize;
        let col = model.left / ceil_size, row = model.top / ceil_size;
        this.alloc({
            col, row,
            colspan: model.colspan,
            rowspan: model.rowspan
        }, model);
        if (is_release === true) {
            model.dragging = false;
            this.format(model, col, row);
            this.fill(model);
            this._update([model]);
            this.target_model = null;
        }
    }
}

try {
    window.MutexBox = MutexBox;
} catch (e) {

}

module.exports = MutexBox;


