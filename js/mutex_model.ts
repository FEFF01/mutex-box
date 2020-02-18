
import { Model, Rect } from './interfaces';

enum STATES {
    USE_CHECK = 0x01,
    FILL_EACHMODEL = 0x10,
    USE_OFFSET = 0x100,
    USE_EACHOFFSET = 0x1000,
};
class MutexModel {
    protected model_map: Array<Model | undefined> = new Array();
    protected model_list: Array<Model> = new Array();
    static STATES = STATES;
    _ncols: number = null;
    constructor(
        models: Array<Model>,
        ncols: number =
            models.reduce(
                (ncols, model) => Math.max(ncols, (model.col || 0) + (model.colspan || 1))
                , 1
            )
    ) {
        this.model_list = this.model_list.concat(models);
        this.ncols = ncols;
    }
    get ncols(): number {
        return this._ncols;
    }
    set ncols(ncols: number) {
        if (ncols !== this._ncols) {
            this._ncols = ncols;
            this.model_map.splice(0, this.model_map.length);
            let model_list = this.model_list.splice(0, this.model_list.length);
            let dirty_data = this._fill(model_list, MutexModel.STATES.USE_CHECK | MutexModel.STATES.FILL_EACHMODEL);
            this.append(dirty_data);
        }
    }

    fill(models: Array<Model> | Model) {
        models instanceof Array || (models = [models]);
        this._fill(models, MutexModel.STATES.FILL_EACHMODEL);
    }
    clear(model: Model) {
        let index = this.model_list.indexOf(model), count = 0;
        ~index || (this.model_list.splice(index, 1));
        while (~(index = this.model_map.indexOf(model))) {
            count++;
            this.model_map[index] = undefined;
        }
        return count;
    }
    remove(models: Array<Model> | Model) {
        models instanceof Array || (models = [models]);
        this._fill(models);
    }
    move(models: Array<Model> | Model, v2: [number, number] | Array<[number, number]>, flags: number = 0) {
        models instanceof Array || (models = [models]);
        this.remove(models);
        this._fill(models, flags | MutexModel.STATES.FILL_EACHMODEL | MutexModel.STATES.USE_OFFSET, v2);
    }
    getModel(col: number, row: number): Model | undefined {
        if (col >= 0 && row >= 0 && col < this.ncols) {
            return this.model_map[col + row * this.ncols];
        }
    }
    format(rect: Rect, col = rect.col, row = rect.row): Rect {
        rect.col = Math.round(Math.max(Math.min(col, this.ncols - rect.colspan), 0));
        rect.row = Math.round(Math.max(row, 0));
        return rect;
    }
    trim(): Array<Model> {
        let height = Math.ceil(this.model_map.length / this.ncols);
        let changed_models = [];
        for (let row = 1; row < height; row++) {
            for (let col = 0; col < this.ncols; col++) {
                let idx = row * this.ncols + col;
                let model = this.model_map[idx];
                if (model && model.row === row) {
                    let nstep = this._pathTest([model], [0, -row - 1], model);
                    if (nstep > 0) {
                        changed_models.push(model);
                        this.move([model], [0, -nstep]);
                    }
                    col += model.colspan - 1;
                }
            }
        }

        return changed_models;
    }

    append(models: Array<Model> | Model) {
        models instanceof Array || (models = [models]);
        for (const model of models) {
            model.colspan > this.ncols && (model.colspan = this.ncols);
            let nrows = Math.ceil(this.model_map.length / this.ncols);
            let max_offset = 0, optimal_col = 0;
            let test_model = { col: 0, row: nrows, colspan: model.colspan, rowspan: model.rowspan };
            for (let col = 0, max_col = this.ncols - model.colspan; col <= max_col; col++) {
                test_model.col = col;
                let offset = this._pathTest([test_model], [0, -nrows - 1], test_model);
                if (max_offset < offset) {
                    max_offset = offset as number;
                    optimal_col = col;
                }
            }
            model.col = optimal_col;
            model.row = nrows - max_offset;
            this._fill([model], MutexModel.STATES.FILL_EACHMODEL);
        }

    }
    alloc(rect: Rect, before_rect?: Rect): Array<Model> {
        let trimmed_rect = this.format({ ...rect });
        let crossed_models = this.cover(trimmed_rect);
        let changed_models = crossed_models.slice();
        if (crossed_models.length === 0) {
            return changed_models;
        }
        let crossed_rect = this.calcWrap(crossed_models);
        if (
            before_rect &&
            trimmed_rect.col === crossed_rect.col &&
            trimmed_rect.row === crossed_rect.row &&
            before_rect.colspan === crossed_rect.colspan &&
            before_rect.rowspan === crossed_rect.rowspan &&
            (Math.abs(rect.col - crossed_rect.col) + Math.abs(rect.row - crossed_rect.row)) /
            (before_rect.colspan + before_rect.rowspan) < 0.06 &&
            Math.abs(before_rect.col - crossed_rect.col) / before_rect.colspan +
            Math.abs(before_rect.row - crossed_rect.row) / before_rect.rowspan > 1
        ) {
            this.move(
                crossed_models,
                [before_rect.col - crossed_rect.col, before_rect.row - crossed_rect.row]
            );
        } else if (
            (
                crossed_models.length > 1 &&
                crossed_rect.colspan + crossed_rect.rowspan > (trimmed_rect.colspan + trimmed_rect.rowspan) * 2
            ) ||
            !this._compress(trimmed_rect, crossed_models, crossed_rect, rect)
        ) {
            for (let i = 0; i < crossed_models.length; i++) {
                if (this._compress(trimmed_rect, [crossed_models[i]], crossed_models[i] as Rect, undefined, false)) {
                    crossed_models.splice(i--, 1);
                }
            }
            if (crossed_models.length === 0) {
                return changed_models;
            }

            let indenting_models: Model[] = [];
            let models_nrow: number[] = [];

            crossed_rect = this.calcWrap(crossed_models);
            let colspan = trimmed_rect.colspan -
                Math.max(crossed_rect.col - trimmed_rect.col, 0) -
                Math.max(
                    trimmed_rect.col + trimmed_rect.colspan -
                    crossed_rect.colspan - crossed_rect.col
                    , 0
                );

            let capture_models: Model[] = [
                {
                    col: Math.max(trimmed_rect.col, crossed_rect.col),
                    row: trimmed_rect.row,
                    colspan,
                    rowspan: 0
                }
            ];
            let capture_features: { [key: number]: Array<{ row: number, rowspan: number }> } = {};
            let capture_nindents: Array<number[] | number> = [new Array(colspan).fill(trimmed_rect.rowspan)];


            while (capture_models.length) {
                let new_capture_models: Model[] = [];
                let new_capture_features: { [key: number]: Array<{ row: number, rowspan: number }> } = {};
                let new_capture_nindents: Array<number[] | number> = [];
                for (const key in capture_features) {
                    capture_features[key].sort((a, b) => a.row - b.row);
                }
                for (let i = 0; i < capture_models.length; i++) {
                    let model = capture_models[i];
                    let nindents = capture_nindents[i] as Array<number>;
                    for (let col = model.col, col_end = col + model.colspan; col < col_end; col++) {
                        let feature = capture_features[col];
                        if (feature) {
                            let loss_nindent = 0;
                            for (let index = 0; index < feature.length - 1; index++) {
                                let item = feature[index];
                                if (item.row < model.row) {
                                    loss_nindent += feature[index + 1].row - (item.row + item.rowspan);
                                } else {
                                    break;
                                }
                            }
                            nindents[col - model.col] -= loss_nindent;
                        }
                    }
                    let model_nindent = Math.max.apply(Number, nindents);
                    if (model_nindent > 0) {
                        capture_nindents[i] = model_nindent;
                        let index = indenting_models.indexOf(model);
                        if (index === -1) {
                            index = indenting_models.length;
                            indenting_models.push(model);
                            models_nrow.push(model_nindent);
                        } else {
                            if (models_nrow[index] >= model_nindent) {
                                //console.log(models_nrow[index] , model_nindent);
                                continue;
                            } else {
                                models_nrow[index] = model_nindent;
                            }
                        }
                    } else {
                        capture_models.splice(i, 1);
                        capture_nindents.splice(i, 1);
                        i--;
                    }
                }
                for (let index = 0; index < capture_models.length; index++) {
                    let model = capture_models[index];
                    let model_nindent = capture_nindents[index] as number;
                    next_col:
                    for (let col = model.col, col_end = col + model.colspan; col < col_end; col++) {
                        for (
                            let row = model.row + model.rowspan, row_end = row + model_nindent;
                            row < row_end;
                            row++
                        ) {
                            let under_model = this.model_map[col + row * this.ncols];
                            if (under_model) {
                                let cm_idx = new_capture_models.indexOf(under_model);
                                let nindents: number[];
                                let nindent = row_end - row + Math.max(model.row - under_model.row, 0);
                                if (cm_idx === -1) {
                                    let im_idx = indenting_models.indexOf(under_model);
                                    if (im_idx >= 0 && models_nrow[im_idx] >= nindent) {
                                        continue next_col;
                                    }
                                    new_capture_models.push(under_model);
                                    new_capture_nindents.push(nindents = new Array(under_model.colspan).fill(0));
                                    let feature = new_capture_features[col] || (new_capture_features[col] = []);
                                    feature.push({
                                        row: under_model.row,
                                        rowspan: under_model.rowspan
                                    });
                                } else {
                                    nindents = new_capture_nindents[cm_idx] as number[];
                                }
                                nindents[col - under_model.col] = Math.max(nindents[col - under_model.col], nindent);
                                break;
                            }
                        }
                    }
                }
                capture_models = new_capture_models;
                capture_features = new_capture_features;
                capture_nindents = new_capture_nindents;
            }


            indenting_models.splice(0, 1);
            models_nrow.splice(0, 1);

            this.move(indenting_models, models_nrow.map((row): [number, number] => [0, row]), MutexModel.STATES.USE_EACHOFFSET);
            changed_models = changed_models.concat(indenting_models);
        }
        return changed_models;
    }
    cover(mask: Rect): Array<Model> {
        let result = [];
        let col = mask.col, row = mask.row;
        for (let r = 0; r < mask.rowspan; r++) {
            for (let c = 0; c < mask.colspan; c++) {
                let model = this.model_map[(c + col) + (r + row) * this.ncols];
                if (model !== undefined) {
                    ~result.indexOf(model) || result.push(model);
                    let right = model.colspan + model.col - 1;
                    c + col < right && (c = right - col);
                }
            }
        }
        return result;
    }
    calcWrap(models: Array<Model>): Rect {
        let wrap = {
            col: models[0].col,
            row: models[0].row,
            colspan: models[0].colspan,
            rowspan: models[0].rowspan
        };
        for (let i = 1; i < models.length; i++) {
            let model = models[i];
            wrap.col > model.col && (wrap.colspan += wrap.col - model.col, wrap.col = model.col);
            wrap.row > model.row && (wrap.rowspan += wrap.row - model.row, wrap.row = model.row);
            wrap.colspan + wrap.col < model.col + model.colspan &&
                (wrap.colspan += model.col + model.colspan - wrap.col - wrap.colspan);
            wrap.rowspan + wrap.row < model.row + model.rowspan &&
                (wrap.rowspan += model.row + model.rowspan - wrap.row - wrap.rowspan);
        }
        return wrap;
    }
    calcOffset(flee_rect: Rect, target_rect: Rect) {
        return {
            l: flee_rect.col - (target_rect.col + target_rect.colspan),
            r: flee_rect.col + flee_rect.colspan - target_rect.col,
            t: flee_rect.row - (target_rect.row + target_rect.rowspan),
            b: flee_rect.row + flee_rect.rowspan - target_rect.row,
        }
    }
    private _fill(models: Model[], flags: number | undefined = 0, arg?: any): Array<Model> | undefined {
        const STATES = MutexModel.STATES;
        let dirty_data: Array<Model> | undefined = flags & STATES.USE_CHECK ? [] : undefined;
        let model_map = this.model_map;
        let model_list = this.model_list;
        let ncols = this.ncols;
        next_model:
        for (let index = 0; index < models.length; index++) {
            let model = models[index];


            if (flags & STATES.USE_CHECK) {
                isFinite(model.colspan) || (model.colspan = 1);
                isFinite(model.rowspan) || (model.rowspan = 1);
                if (isNaN(model.col + model.row) || model.col + model.colspan > ncols) {
                    dirty_data.push(model);
                    continue;
                }
            }

            let list_index = model_list.indexOf(model);
            if (flags & STATES.FILL_EACHMODEL) {
                if (list_index === -1) {
                    model_list.push(model);
                } else {
                    continue;
                }
            } else {
                if (list_index >= 0) {
                    model_list.splice(list_index, 1);
                }
            }

            if (flags & STATES.USE_EACHOFFSET) {
                model.col += arg[index][0];
                model.row += arg[index][1];
            } else if (flags & STATES.USE_OFFSET) {
                model.col += arg[0];
                model.row += arg[1];
            }
            let { col, row, colspan, rowspan } = model;
            //row + rowspan > this.nrows && (this.nrows = row + rowspan);
            for (let r = 0; r < rowspan; r++) {
                for (let c = 0; c < colspan; c++) {
                    let idx = (c + col) + (r + row) * ncols;
                    if (!(flags & STATES.USE_CHECK) || model_map[idx] === undefined) {
                        model_map[idx] = flags & STATES.FILL_EACHMODEL ? model : arg;
                    } else {
                        do {
                            while (c--) {
                                model_map[(c + col) + (r + row) * ncols] = undefined;
                            }
                            c = colspan;
                        } while (r--)
                        flags & STATES.FILL_EACHMODEL && (model_list.pop());
                        dirty_data.push(model);
                        continue next_model;
                    }
                }
            }
        }
        return dirty_data;
    }
    private _pathTest(models: Model[], v2: [number, number], wrap_rect: Model = this.calcWrap(models)): number | boolean {
        let ec = v2[0] | 0, er = v2[1] | 0, oc = 0, or = 0, nstep = 0;
        let ic = ec && ec / Math.abs(ec), ir = er && er / Math.abs(er);
        while (oc !== ec || or !== er) {
            oc !== ec ? (oc = oc + ic) : (or = or + ir);
            if (
                wrap_rect.col + oc < 0 ||
                wrap_rect.col + oc + wrap_rect.colspan > this.ncols ||
                wrap_rect.row + or < 0
            ) {
                return nstep;
            }
            for (const model of models) {
                for (let r = model.row, r_end = r + model.rowspan; r < r_end; r++) {
                    for (let c = model.col, c_end = c + model.colspan; c < c_end; c++) {
                        let idx = c + oc + (r + or) * this.ncols;
                        if (this.model_map[idx] && models.indexOf(this.model_map[idx]) === -1) {
                            return nstep;
                        }
                    }
                }
            }
            nstep += 1;
        }
        return true;
    }
    private _compress(
        trimmed_rect: Rect,
        crossed_models: Array<Model> = this.cover(trimmed_rect),
        crossed_rect: Rect = this.calcWrap(crossed_models),
        rect?: Rect,
        use_bw = true
    ): boolean {
        let hf = trimmed_rect.rowspan / trimmed_rect.colspan/* / crossed_rect.rowspan*/;
        let vf = crossed_rect.colspan / crossed_rect.rowspan/* / trimmed_rect.colspan*/;
        let trimmed_offset = this.calcOffset(trimmed_rect, crossed_rect);
        let offset = rect ? this.calcOffset(rect, crossed_rect) : trimmed_offset;
        let lw: any[] = [Math.abs(hf * offset.l), [trimmed_offset.l, 0]], rw: any[] = [Math.abs(hf * offset.r), [trimmed_offset.r, 0], lw];
        lw.push(rw); rw.push(lw);
        let tw: any[] = [Math.abs(vf * offset.t), [0, trimmed_offset.t]], bw: any[];
        if (use_bw) {
            bw = [Math.abs(vf * offset.b), [0, trimmed_offset.b]];
            tw.push(bw); bw.push(tw);
        }
        let sorted_directions = (use_bw ? [lw, rw, tw, bw] : [lw, rw, tw]).sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < sorted_directions.length; i++) {
            let j = sorted_directions.lastIndexOf(sorted_directions[i][2]);
            if (j > i) {
                sorted_directions.splice(j, 1);
                sorted_directions.splice(i + 1, 0, sorted_directions[i][2]);
            }
            if (this._pathTest(crossed_models, sorted_directions[i][1], crossed_rect) === true) {
                this.move(crossed_models, sorted_directions[i][1]);
                return true;
            }
        }
        return false;
    }
}
export default MutexModel;//这里糊一个根导出，让 MutexModel 可以在其他模块被定义
//module.exports = MutexModel;//使用 module.exports 是为了import 和 require 都直接可用