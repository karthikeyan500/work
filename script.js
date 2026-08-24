const STORAGE_KEY = 'todo-list-items';
const FILTERS = ['all', 'active', 'completed'];

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const template = document.getElementById('todo-item-template');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Unable to load saved tasks:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  todoList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = currentFilter === 'all'
      ? 'No tasks yet. Add one above!'
      : 'No tasks match this filter.';
    todoList.appendChild(empty);
  }

  filteredTasks.forEach((task) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector('input[type="checkbox"]');
    const text = item.querySelector('.task-text');
    const deleteButton = item.querySelector('.delete-btn');

    checkbox.checked = task.completed;
    text.textContent = task.text;
    item.dataset.id = task.id;

    if (task.completed) {
      item.classList.add('completed');
    }

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      render();
    });

    todoList.appendChild(item);
  });

  const remaining = tasks.filter((task) => !task.completed).length;
  todoCount.textContent = `${remaining} task${remaining === 1 ? '' : 's'} left`;
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
  });

  saveTasks();
  render();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
    });
    render();
  });
});

render();
