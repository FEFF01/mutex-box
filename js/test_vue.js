import Vue from './vue.min.js';
import MutexBox from './mutex_box.ts';
import { get_models, get_option } from './test_data.js';
let zIndex = 1, { ncols, space, capture } = get_option();
new Vue({
    el: "#test_vessel",
    mounted() {
        this.mutexBox = new MutexBox(this.$el, this.models, {
            ncols: this.ncols,
            space: this.space,
            capture: this.capture
        });
        console.log(this.mutexBox);
    },
    beforeDestory() {
        this.mutexBox.disable();
    },
    methods: {
        add_models() {
            let models = get_models().map(
                model => {
                    //指定有明确的 col row 会将现有元素排挤出去强制占用该空间
                    model.col = undefined;
                    return model;
                }
            );
            this.mutexBox.add(models);
            this.models = this.models.concat(models);
        }
    },
    data: {
        zIndex,
        mutexBox: null,
        ncols, space, capture,
        models: Array.prototype.concat.apply([], new Array(2).fill(0).map(get_models))
    }
});

