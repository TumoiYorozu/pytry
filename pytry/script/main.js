import * as editor from './editor.js';
import * as hintFinder from './hint-finder.js';
import * as compiler from './compiler.js';
import * as formatter from './formatter.js';
import * as runner from './runner.js';
import * as logger from './logger.js';

window.addEventListener('load', (event) => {
  editor.initialize('source-editor', 'input-editor', 'output-editor');
  hintFinder.initialize();
  compiler.initialize();
  formatter.initialize();
  runner.initialize('run', 'run-completed');

  logger.initizalize();

  document.getElementById('copy_from_source').addEventListener('click', editor.copy_from_source);
  document.getElementById('paste_to_input').addEventListener('click', editor.paste_to_input);
  document.getElementById('insert_map_int_input_split').addEventListener('click', editor.insert_map_int_input_split);
  document.getElementById('insert_int_input').addEventListener('click', editor.insert_int_input);
  document.getElementById('insert_map_int_input_split').addEventListener('click', editor.insert_map_int_input_split);
  document.getElementById('insert_input').addEventListener('click', editor.insert_input);
  document.getElementById('insert_list_map_int_input_split').addEventListener('click', editor.insert_list_map_int_input_split);

  document.getElementById('run').addEventListener('click', async (event) => {
    await formatter.formatAndUpdateEditor(editor.sourceEditor);
    runner.run();
  });

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
    }
  });
});
