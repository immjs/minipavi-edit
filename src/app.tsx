import { common, createLowlight } from 'lowlight';
import { Root, Element as HastElement, Text as HastText, Comment as HastComment, Doctype as HastDoctype } from 'hast';

import sheets from './lowlight.js';
import { useRef, useState } from 'react';
import type { FullPadding } from 'minitel-standalone/dist/types.js';
import { Paragraph } from 'minitel-standalone';

const lowlight = createLowlight(common);

interface Scoped {
  [k: string]: number | Scoped;
}

export function Visit({ code, sheet }: { code: (HastElement | HastText | HastComment | Root | HastDoctype), sheet: Scoped }) {
  const newChildren = [];

  if (!('children' in code)) {
    if ('value' in code) {
      return code.value;
    }
    return '<!DOCTYPE html>';
  }

  const classes = code.type === 'element' ? code.properties.className as string[] : [];
  const styleClass = classes.find((v) => v in sheet);
  let scoped = {
    ...sheet,
  };
  for (let className in classes) {
    if (`${className}'s children` in sheet) {
      const v = sheet[`${className}'s children`];
      if (typeof v !== 'object') throw new Error('Malformed sheet');
      scoped = {
        ...scoped,
        ...v,
      }
    }
  }
  // Thannks https://github.com/wooorm/emphasize/blob/main/lib/index.js

  for (let childIdx in code.children) {
    const child = code.children[childIdx];
    newChildren.push(<Visit code={child} sheet={scoped} key={childIdx} />);
  }

  if (styleClass) {
    const style = sheet[styleClass];
    if (typeof style !== 'number') throw new Error('Malformed sheet');
    return (
      <span fg={style}>
        {newChildren}
      </span>
    );
  } else {
    return <>{ newChildren }</>
  }
}

export function App() {
  const [value, setValue] = useState<string>('');
  const [textPad, setTextPad] = useState<FullPadding>([0, 0, 0, 0]);
  const [linesPad, setLinesPad] = useState<FullPadding>([0, 0, 0, 0]);
  const actualTextRef = useRef<Paragraph>(null);
  const linesRef = useRef<Paragraph>(null);
  // console.log('aaa');

  // Returns a highlighted HTML string
  const html = lowlight.highlightAuto(value);
  
  const theme = 'dark';

  return (
    <xjoin flexGrow>
      <para width={3} textAlign="end" invert ref={linesRef} pad={linesPad}>{Array.from({ length: value.split('\n').length }, (_, i) => `${i}`).join('\n')}</para>
      {/* <para width={1} fillChar="|"></para> */}
      <zjoin flexGrow>
        <input
          autofocus
          multiline
          onChange={setValue}
          onScroll={(scroll) => {
            setTextPad(actualTextRef.current!.attributes.pad = [-scroll[0], 0, 0, -scroll[1]]);
            setLinesPad(linesRef.current!.attributes.pad = [-scroll[0], 0, 0, 0]);
          }}
        />
        <cont fillChar=".">
          <para ref={actualTextRef} pad={textPad}>
            { value }
          </para>
        </cont>
        <cont fillChar={"\x09"}>
          <para ref={actualTextRef} pad={textPad}>
            <Visit code={html} sheet={sheets[theme]} />
          </para>
        </cont>
      </zjoin>
    </xjoin>
  );
}
