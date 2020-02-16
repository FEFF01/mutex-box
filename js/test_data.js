function get_models() {
    let left = 0, top = 0, width = 0, height = 0;
    let models = [
        {
            left, top, width, height,
            colspan: 8,
            rowspan: 3,
            innerHTML:
                `
    可以在初始化中指定默认参数
<code>
{
    //指定容器横向被分为多少格（默认值为足够初始化的最小值）
    ncols: 16,
    //指定默认空白区域（默认全0）
    space: { left: 2, right: 2, top: 4, bottom: 0 }, 
    //指定默认拖拽捕获区域（默认全0，表示除了空白外的区域可拖拽）
    capture: { top: 0, right: 0, bottom: 0, left: 0 }
}
</code>
    `
        },
        {
            left, top, width, height,
            col: 9,
            row: 0,
            colspan: 7,
            rowspan: 3,
            innerHTML:
                `
                <br><button style="color:white;background-color:black;">只允许从该按钮上方拖拽</button>
<code>
{
    col: 9,
    row: 0,
    colspan: 7,
    rowspan: 4,
    capture: (e, t) => t.target.tagName === "BUTTON"
}
</code>
    `,
            capture: (e, t) => t.target.tagName === "BUTTON"
        },
        {
            left, top, width, height,
            colspan: 4,
            rowspan: 7,
            innerHTML:
                `
                <span style="
                display:block;
                width:0;height:0;
                z-index: 1000;
                border: 20px solid;
                border-color: aqua blue red green;
                "></span>
                （类似上图的区域划分）<br>
                只能在以下区域拖拽<br>
                (1):容器中心点和顶边做三角形<br>
                (2):容器右侧边和距离右侧边 10px 的平行线做四边形<br>
                (3):容器中心点和距离底部 10px 的平行线做三角形<br>
                (3):容器左侧边和距离左侧边 10px 的平行线做四边形<br>
<code>
{
    colspan: 4,
    rowspan: 6,
    capture: {
        top: 0,
        right: -10,
        bottom: 10,
        left: -10
    }
}
</code>
    `,
            capture: {
                top: 0,
                right: -10,
                bottom: 10,
                left: -10,
            }
        },
        {
            left, top, width, height,
            colspan: 4,
            rowspan: 4,
            style: {
                border: "solid black",
                borderWidth: "10px 20px"
            },
            innerHTML:
                `
    只能从该容器边框部分拖拽
<code>
{
    colspan: 4,
    rowspan: 4,
    capture: {
        top: -10,
        right: -20,
        bottom: -10,
        left: -20
    }
}
</code>
    `,
            capture: {
                top: -10,
                right: -20,
                bottom: -10,
                left: -20
            },
        },
        {
            left, top, width, height,
            colspan: 4,
            rowspan: 5,
            innerHTML:
                `
                单独指定空白区域:<br>
                (1)顶部 20px ,底部 30px 为空白<br>
                (2)左右两侧溢出贴合 space-right space-left 值为 2 的容器
<code>
{
    colspan: 4,
    rowspan: 5,
    space: {
        top: 20,
        right: -2,
        bottom: 30,
        left: -2
    }
}
</code>
    `,
            space: {
                top: 20,
                right: -2,
                bottom: 30,
                left: -2
            },
        },
        {
            left, top, width, height,
            col:8,
            row:0,
            colspan: 4,
            rowspan: 3,
            innerHTML:
                `
                不指定 "col" "row" 或指定了非法值会自动根据现有摆放状态自动选择合适位置放置
<code>
{
    col:8,
    row:0,
    colspan: 4,
    rowspan: 3
}
</code>
    `,
        },
    ];
    return models;
}
function get_option() {
    return {
        ncols: Math.min(window.innerWidth / 70 | 0, 16),
        space: { left: 2, right: 2, top: 4, bottom: 0 },
        capture: { top: 0, right: 0, bottom: 0, left: 0 }
    };
}
export { get_models, get_option };