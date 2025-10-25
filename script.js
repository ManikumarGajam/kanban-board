document.addEventListener('DOMContentLoaded', () => {
  // Function to speak welcome message using Web Speech API
  function speakWelcome() {
    const msg = new SpeechSynthesisUtterance(
      "Welcome to the Kanban Board! You can add tasks by typing in the input and pressing Enter or clicking Add Task. Drag tasks between columns to organize your workflow."
    );
    msg.lang = 'en-US';
    msg.rate = 1;    // normal speed
    msg.pitch = 1;   // normal pitch
    window.speechSynthesis.speak(msg);
  }

  // Call speakWelcome on page load

  // Optional: add a button to replay the welcome message anytime
  const replayBtn = document.createElement('button');
  replayBtn.textContent = '🔊 Replay Instructions';
  replayBtn.setAttribute('aria-label', 'Replay instructions');
  replayBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #4f46e5;
    border: none;
    color: white;
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
    z-index: 1000;
    transition: background-color 0.3s;
  `;
  replayBtn.addEventListener('mouseenter', () => replayBtn.style.backgroundColor = '#4338ca');
  replayBtn.addEventListener('mouseleave', () => replayBtn.style.backgroundColor = '#4f46e5');
  replayBtn.addEventListener('click', speakWelcome);
  document.body.appendChild(replayBtn);

  const addTaskBtn = document.getElementById('addTaskBtn');
  const newTaskInput = document.getElementById('newTask');
  const columns = document.querySelectorAll('.column');

  function updateEmptyMessages() {
    columns.forEach(column => {
      const tasks = column.querySelectorAll('.task');
      const emptyMessage = column.querySelector('.empty-message');
      if (!emptyMessage) return;
      emptyMessage.style.display = (tasks.length === 0) ? 'flex' : 'none';
    });
  }

  addTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return alert('Please enter a task');

    const task = document.createElement('div');
    task.className = 'task';
    task.textContent = taskText;
    task.draggable = true;
    task.id = 'task-' + Date.now();

    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);

    const todoColumn = document.getElementById('todo');
    const dropZone = todoColumn.querySelector('.drop-zone');
    todoColumn.insertBefore(task, dropZone);

    newTaskInput.value = '';
    updateEmptyMessages();
  });

  function allowDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function drop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = document.getElementById(taskId);

    const column = e.currentTarget;
    if(column.classList.contains('column')) {
      const dropZone = column.querySelector('.drop-zone');
      if (dropZone) {
        column.insertBefore(task, dropZone);
      } else {
        column.appendChild(task);
      }
      // Add subtle scale animation on drop
      task.style.transition = 'transform 0.25s ease';
      task.style.transform = 'scale(1.05)';
      setTimeout(() => {
        task.style.transform = 'scale(1)';
      }, 250);
    }

    columns.forEach(col => col.classList.remove('drag-over'));
    updateEmptyMessages();
  }

  function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add('hide'), 0);
  }

  function dragEnd(e) {
    e.target.classList.remove('hide');
    columns.forEach(col => col.classList.remove('drag-over'));
  }

  // Attach dragover and drop event listeners to columns
  columns.forEach(col => {
    col.addEventListener('dragover', allowDrop);
    col.addEventListener('drop', drop);
  });

  newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTaskBtn.click();
  });

  updateEmptyMessages();
});

// Drop zones for deleting tasks
const dropZones = document.querySelectorAll('.drop-zone');

dropZones.forEach(zone => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    const task = document.getElementById(taskId);
    if (task) {
      task.remove();
      updateEmptyMessages();
    }
  });
});
