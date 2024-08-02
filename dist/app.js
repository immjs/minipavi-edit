import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { common, createLowlight } from 'lowlight';
import sheets from './lowlight.js';
import { useRef, useState } from 'react';
const lowlight = createLowlight(common);
export function Visit({ code, sheet }) {
    const newChildren = [];
    if (!('children' in code)) {
        if ('value' in code) {
            return code.value;
        }
        return '<!DOCTYPE html>';
    }
    const classes = code.type === 'element' ? code.properties.className : [];
    const styleClass = classes.find((v) => v in sheet);
    let scoped = {
        ...sheet,
    };
    for (let className in classes) {
        if (`${className}'s children` in sheet) {
            const v = sheet[`${className}'s children`];
            if (typeof v !== 'object')
                throw new Error('Malformed sheet');
            scoped = {
                ...scoped,
                ...v,
            };
        }
    }
    // Thannks https://github.com/wooorm/emphasize/blob/main/lib/index.js
    for (let childIdx in code.children) {
        const child = code.children[childIdx];
        newChildren.push(_jsx(Visit, { code: child, sheet: scoped }, childIdx));
    }
    if (styleClass) {
        const style = sheet[styleClass];
        if (typeof style !== 'number')
            throw new Error('Malformed sheet');
        return (_jsx("span", { fg: style, children: newChildren }));
    }
    else {
        return _jsx(_Fragment, { children: newChildren });
    }
}
export function App() {
    const [value, setValue] = useState('');
    const [textPad, setTextPad] = useState([0, 0, 0, 0]);
    const [linesPad, setLinesPad] = useState([0, 0, 0, 0]);
    const actualTextRef = useRef(null);
    const linesRef = useRef(null);
    // console.log('aaa');
    // Returns a highlighted HTML string
    const html = lowlight.highlightAuto(value);
    const theme = 'dark';
    return (_jsxs("xjoin", { flexGrow: true, children: [_jsx("para", { width: 3, textAlign: "end", invert: true, ref: linesRef, pad: linesPad, children: Array.from({ length: value.split('\n').length }, (_, i) => `${i}`).join('\n') }), _jsxs("zjoin", { flexGrow: true, children: [_jsx("input", { autofocus: true, multiline: true, onChange: setValue, onScroll: (scroll) => {
                            setTextPad(actualTextRef.current.attributes.pad = [-scroll[0], 0, 0, -scroll[1]]);
                            setLinesPad(linesRef.current.attributes.pad = [-scroll[0], 0, 0, 0]);
                        } }), _jsx("cont", { fillChar: ".", children: _jsx("para", { ref: actualTextRef, pad: textPad, children: value }) }), _jsx("cont", { fillChar: "\x09", children: _jsx("para", { ref: actualTextRef, pad: textPad, children: _jsx(Visit, { code: html, sheet: sheets[theme] }) }) })] })] }));
}
