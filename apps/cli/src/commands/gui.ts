import { Command } from '@oclif/core';
import * as path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import { fork } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class GuiCommand extends Command {
  static override description = 'Open a GUI to create new projects';

  async run(): Promise<void> {
    // Start the Express server in a child process
    const serverPath = path.resolve(__dirname, '../gui/server.mjs');
    const child = fork(serverPath, [], { stdio: 'inherit' });

    // Wait a moment, then open the browser
    setTimeout(() => {
      open('http://localhost:3000');
    }, 1000);
  }
}
