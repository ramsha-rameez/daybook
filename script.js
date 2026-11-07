const form = document.getElementById('form');
const input = document.getElementById('input');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const bar = document.getElementById('bar');
const percentEl = document.getElementById('percent');
const summary = document.getElementById('summary');
const tabs = document.querySelectorAll('.tab');
const CIRC = 339.3;

let filter = 'all';
let tasks = load();

function load() {
  try { return JSON.parse(localStorage.getItem('daybook-tasks')) || []; }
  catch (e) { return []; }
}
function save() {
  try { localStorage.setItem('daybook-tasks', JSON.stringify(tasks)); } catch (e) {}
}

// Date and greeting
const now = new Date();
document.getElementById('date').textContent =
  now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const h = now.getHours();
document.getElementById('greeting').textContent =
  h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : 'Good evening.';

function render() {
  // list
  list.innerHTML = '';
  const shown = tasks.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done);

  shown.forEach(t => {
    const li = document.createElement('li');
    li.className = 'item' + (t.done ? ' done' : '');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = t.done;
    box.setAttribute('aria-label', 'Mark "' + t.text + '" as done');
    box.addEventListener('change', () => { t.done = box.checked; save(); render(); });

    const text = document.createElement('span');
    text.textContent = t.text;

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Delete task');
    del.addEventListener('click', () => {
      tasks = tasks.filter(x => x.id !== t.id);
      save(); render();
    });

    li.append(box, text, del);
    list.appendChild(li);
  });

  // empty messages
  if (shown.length === 0) {
    empty.textContent =
      tasks.length === 0 ? 'No tasks yet. Type one above and press Add task.' :
      filter === 'done' ? 'Nothing finished yet. Keep going.' :
      'All tasks are done. Nice work.';
  } else empty.textContent = '';

  // progress
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  percentEl.textContent = pct + '%';
  bar.style.strokeDashoffset = CIRC - (pct / 100) * CIRC;
  summary.textContent =
    total === 0 ? 'Add your first task to begin.' :
    pct === 100 ? 'Everything is done. Enjoy the rest of your day.' :
    done + ' of ' + total + ' tasks done. ' + (total - done) + ' to go.';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  tasks.unshift({ id: Date.now(), text, done: false });
  input.value = '';
  save(); render();
});

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  tab.classList.add('active');
  filter = tab.dataset.filter;
  render();
}));

document.getElementById('clear').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});

render();
