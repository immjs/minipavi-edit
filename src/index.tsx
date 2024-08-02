import { Minitel } from 'minitel-standalone';
import { render } from 'minitel-react';
import { createMinipaviHandler } from 'minitel-minipavi';

import { App } from './app.js';
import { DuplexBridge } from 'ws-duplex-bridge';

export default createMinipaviHandler(
  async (ws) => {
    const stream = new DuplexBridge(ws, { decodeStrings: false });
    const minitel = new Minitel(stream, { localEcho: false });

    render(<App />, minitel);
  },
  {
    host: '0.0.0.0',
    port: 3000,
  },
);