// ========== DATOS GLOBALES ==========
let tasks = JSON.parse(localStorage.getItem('jarvis_tasks')) || [];
let reminders = JSON.parse(localStorage.getItem('jarvis_reminders')) || [];
let notes = JSON.parse(localStorage.getItem('jarvis_notes')) || [];
let chatHistory = JSON.parse(localStorage.getItem('jarvis_chat')) || [];

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    updateDate();
    loadTasks();
    loadReminders();
    loadNotes();
    loadChat();
    setInterval(updateTime, 1000);
    setInterval(checkReminders, 60000);
});

// ========== HORA Y FECHA ==========
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES');
    document.getElementById('currentTime').textContent = time;
}

function updateDate() {
    const now = new Date();
    const date = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = date.toUpperCase();
}

// ========== TAREAS ==========
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();

    if (!taskText) {
        alert('Por favor escribe una tarea');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString('es-ES')
    };

    tasks.push(task);
    localStorage.setItem('jarvis_tasks', JSON.stringify(tasks));
    input.value = '';
    loadTasks();
    addChatMessage('bot', `✅ Tarea agregada: "${taskText}"`);
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <span onclick="toggleTask(${task.id})">${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
        `;

        taskList.appendChild(li);
    });

    updateTaskCount();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('jarvis_tasks', JSON.stringify(tasks));
        loadTasks();
        if (task.completed) {
            addChatMessage('bot', `🎉 ¡Excelente! Completaste: "${task.text}"`);
        }
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('jarvis_tasks', JSON.stringify(tasks));
    loadTasks();
}

function updateTaskCount() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    document.getElementById('completedCount').textContent = `${completed}/${total}`;
}

// ========== RECORDATORIOS ==========
function addReminder() {
    const text = document.getElementById('reminderText').value.trim();
    const time = document.getElementById('reminderTime').value;

    if (!text || !time) {
        alert('Por favor completa todos los campos');
        return;
    }

    const reminder = {
        id: Date.now(),
        text: text,
        time: time,
        done: false
    };

    reminders.push(reminder);
    localStorage.setItem('jarvis_reminders', JSON.stringify(reminders));
    document.getElementById('reminderText').value = '';
    document.getElementById('reminderTime').value = '';
    loadReminders();
    addChatMessage('bot', `🔔 Recordatorio establecido para las ${time}: ${text}`);
}

function loadReminders() {
    const reminderList = document.getElementById('reminderList');
    reminderList.innerHTML = '';

    reminders.forEach(reminder => {
        if (!reminder.done) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${reminder.time} - ${reminder.text}</span>
                <button class="delete-btn" onclick="deleteReminder(${reminder.id})">✕</button>
            `;
            reminderList.appendChild(li);
        }
    });
}

function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('jarvis_reminders', JSON.stringify(reminders));
    loadReminders();
}

function checkReminders() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');

    reminders.forEach(reminder => {
        if (!reminder.done && reminder.time === currentTime) {
            reminder.done = true;
            addChatMessage('bot', `⏰ RECORDATORIO: ${reminder.text}`);
            localStorage.setItem('jarvis_reminders', JSON.stringify(reminders));
        }
    });
}

// ========== NOTAS ==========
function saveNote() {
    const text = document.getElementById('noteText').value.trim();

    if (!text) {
        alert('Por favor escribe una nota');
        return;
    }

    const note = {
        id: Date.now(),
        text: text,
        createdAt: new Date().toLocaleString('es-ES')
    };

    notes.push(note);
    localStorage.setItem('jarvis_notes', JSON.stringify(notes));
    document.getElementById('noteText').value = '';
    loadNotes();
    addChatMessage('bot', '📝 Nota guardada correctamente');
}

function loadNotes() {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = '';

    notes.forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${note.text}</span>
            <button class="delete-btn" onclick="deleteNote(${note.id})">✕</button>
        `;
        noteList.appendChild(li);
    });
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('jarvis_notes', JSON.stringify(notes));
    loadNotes();
}

// ========== CHAT ==========
function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    // Agregar mensaje del usuario
    addChatMessage('user', message);
    input.value = '';

    // Procesar comando
    processCommand(message);
}

function addChatMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Guardar en historial
    chatHistory.push({ sender, text, time: new Date().toLocaleString('es-ES') });
    localStorage.setItem('jarvis_chat', JSON.stringify(chatHistory.slice(-50))); // Últimos 50
}

function loadChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = '<div class="chat-message bot"><p>¡Hola! Soy JARVIS, tu asistente virtual. ¿Cómo puedo ayudarte hoy?</p></div>';
}

function clearChat() {
    document.getElementById('chatBox').innerHTML = '<div class="chat-message bot"><p>Chat limpiado. ¿Cómo puedo ayudarte?</p></div>';
    chatHistory = [];
    localStorage.removeItem('jarvis_chat');
}

// ========== PROCESAMIENTO DE COMANDOS ==========
function processCommand(message) {
    const cmd = message.toLowerCase();
    let response = '';

    // Saludos
    if (cmd.includes('hola') || cmd.includes('hoi')) {
        response = '¡Hola! ¿Cómo estás? ¿En qué puedo ayudarte?';
    }
    // Hora
    else if (cmd.includes('hora') || cmd.includes('qué hora')) {
        const now = new Date().toLocaleTimeString('es-ES');
        response = `Son las ${now}`;
    }
    // Fecha
    else if (cmd.includes('fecha') || cmd.includes('día')) {
        const now = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        response = `Hoy es ${now}`;
    }
    // Tareas
    else if (cmd.includes('mis tareas') || cmd.includes('tareas pendientes')) {
        const pendentes = tasks.filter(t => !t.completed);
        if (pendentes.length === 0) {
            response = '¡No tienes tareas pendientes! 🎉';
        } else {
            response = '📋 Tus tareas pendientes son:\n';
            pendentes.forEach((t, i) => {
                response += `${i + 1}. ${t.text}\n`;
            });
        }
    }
    // Agregar tarea
    else if (cmd.includes('tarea') && cmd.includes('agregar')) {
        response = 'Para agregar una tarea, usa el panel lateral. ¿Cuál es tu tarea?';
    }
    // Recordatorios
    else if (cmd.includes('recordatorios') || cmd.includes('mis recordatorios')) {
        if (reminders.length === 0) {
            response = 'No tienes recordatorios establecidos.';
        } else {
            response = '🔔 Tus recordatorios:\n';
            reminders.forEach((r, i) => {
                response += `${i + 1}. ${r.time} - ${r.text}\n`;
            });
        }
    }
    // Notas
    else if (cmd.includes('mis notas') || cmd.includes('notas')) {
        if (notes.length === 0) {
            response = 'No tienes notas guardadas. ¿Quieres crear una?';
        } else {
            response = '📝 Tus notas:\n';
            notes.forEach((n, i) => {
                response += `${i + 1}. ${n.text}\n`;
            });
        }
    }
    // Ayuda
    else if (cmd.includes('ayuda') || cmd.includes('qué puedes hacer')) {
        response = `
📋 Aquí está lo que puedo hacer:
✅ Gestionar tareas
🔔 Crear recordatorios
📝 Guardar notas
⏰ Mostrarte la hora
📅 Decirte la fecha
💬 Conversar contigo
🧠 Responder preguntas

¡Prueba escribiendo: "mis tareas", "qué hora es", "mis notas"`;
    }
    // Predicción del día
    else if (cmd.includes('predicción') || cmd.includes('cómo será mi día')) {
        const tareas = tasks.filter(t => !t.completed).length;
        response = `Hoy tienes ${tareas} tareas. Estoy seguro de que lo harás muy bien. 💪`;
    }
    // Motivación
    else if (cmd.includes('motivación') || cmd.includes('anima') || cmd.includes('ánimo')) {
        const motivacion = [
            '¡Tú puedes! 💪',
            '¡Eres increíble! ⭐',
            'Hoy será un gran día 🌟',
            '¡Adelante con esas tareas! 🚀',
            'Recuerda: Un pequeño paso es mejor que no dar ninguno 🌱'
        ];
        response = motivacion[Math.floor(Math.random() * motivacion.length)];
    }
    // Búsqueda en tareas
    else if (cmd.includes('buscar') || cmd.includes('encuentra')) {
        const search = message.substring(message.indexOf('buscar') + 6).trim();
        const found = tasks.find(t => t.text.toLowerCase().includes(search));
        if (found) {
            response = `Encontré: "${found.text}" ${found.completed ? '✅' : '⏳'}`;
        } else {
            response = `No encontré una tarea con "${search}"`;
        }
    }
    // Por defecto
    else {
        const respuestas = [
            'Interesante punto de vista. ¿Hay algo específico en lo que pueda ayudarte?',
            'Entiendo. ¿Necesitas crear una tarea o un recordatorio?',
            'Bien, bien. ¿Quieres que te cuente tus tareas pendientes?',
            'Claro. Puedo ayudarte con tus tareas, recordatorios y notas.',
            'Noté eso. ¿Cómo podría ayudarte mejor?'
        ];
        response = respuestas[Math.floor(Math.random() * respuestas.length)];
    }

    // Enviar respuesta
    setTimeout(() => {
        addChatMessage('bot', response);
    }, 500);
}

// ========== FUNCIONES ADICIONALES ==========
function exportData() {
    const data = {
        tasks,
        reminders,
        notes,
        chatHistory,
        exportDate: new Date().toLocaleString('es-ES')
    };
    const json = JSON.stringify(data, null, 2);
    console.log('Datos exportados:', json);
    addChatMessage('bot', '📊 Datos exportados a consola');
}

function resetAll() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos?')) {
        tasks = [];
        reminders = [];
        notes = [];
        chatHistory = [];
        localStorage.clear();
        loadTasks();
        loadReminders();
        loadNotes();
        loadChat();
        addChatMessage('bot', '🔄 Todos los datos han sido eliminados. Empezamos de nuevo');
    }
}
