import MutexBox from './mutex_box.js'
import { get_models, get_option } from './test_data.js';

let vessel = document.createElement("ul");
vessel.className = "mutex-box";
document.body.appendChild(vessel);

let zIndex = 0;
let option = get_option();
let models = Array.prototype.concat.apply([], new Array(10).fill(0).map(get_models));
bind_element(models);

let mutexBox = new MutexBox(vessel, models, option);
btn_col_inc.onclick = () => {
    mutexBox.resize(++option.ncols);
};
btn_col_dec.onclick = () => {
    mutexBox.resize(--option.ncols);
}
btn_trim.onclick = () => {
    mutexBox.trim();
};
btn_add.onclick = () => {
    mutexBox.add(
        bind_element(
            get_models().map(
                model => {
                    //指定有明确的 col row 会将现有元素排挤出去强制占用该空间
                    model.col = undefined;
                    return model;
                }
            )
        )
    );
};
console.log(mutexBox);

function bind_element(models) {
    for (let model of models) {
        let element = model.element ? model.element() : (() => {
            let li = document.createElement("li");
            li.className = "mb-item";
            model.innerHTML && (li.innerHTML = model.innerHTML);
            return li;
        })();
        if (model.style) {
            for (const key in model.style) {
                element.style[key] = model.style[key];
            }
        }
        vessel.appendChild(element);
        let { left, top, width, height, dragging } = model;
        Object.defineProperties(model, {
            left: {
                get() {
                    return left;
                },
                set(val) {
                    left = val;
                    element.style.left = left + "px";
                }
            },
            top: {
                get() {
                    return top;
                },
                set(val) {
                    top = val;
                    element.style.top = top + "px";
                }
            },
            width: {
                get() {
                    return width;
                },
                set(val) {
                    width = val;
                    element.style.width = width + "px";
                }
            },
            height: {
                get() {
                    return height;
                },
                set(val) {
                    height = val;
                    element.style.height = height + "px";
                }
            },
            dragging: {
                get() {
                    return dragging;
                },
                set(val) {
                    dragging = val;
                    element.style.zIndex = ++zIndex;
                    element.className = dragging ? "mb-item dragging" : "mb-item";
                }
            }
        });
    }
    return models;

}