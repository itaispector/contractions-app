let startTime, endTime, timerInterval;
let contractions = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const contractionsList = document.getElementById('contractionsList');
const clearBtn = document.createElement('button');
const addManualBtn = document.createElement('button');
const averageDurationDisplay = document.createElement('div');
const lastIntervalDisplay = document.createElement('div');

clearBtn.textContent = 'נקה את כל הצירים';
addManualBtn.textContent = 'הוסף ציר ידנית';
document.querySelector('.container').appendChild(clearBtn);
document.querySelector('.container').appendChild(addManualBtn);
document.querySelector('.container').appendChild(averageDurationDisplay);
document.querySelector('.container').appendChild(lastIntervalDisplay);

startBtn.addEventListener('click', startContraction);
stopBtn.addEventListener('click', stopContraction);
clearBtn.addEventListener('click', clearAllContractions);
addManualBtn.addEventListener('click', showManualAddForm);

document.addEventListener('DOMContentLoaded', loadFromLocalStorage);

function startContraction() {
    startTime = new Date();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    timerInterval = setInterval(updateTimer, 1000);
}

function stopContraction() {
    endTime = new Date();
    clearInterval(timerInterval);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    const duration = (endTime - startTime) / 1000; // בשניות
    addContraction(startTime, endTime, duration);
}

function addContraction(start, end, duration) {
    const lastContraction = contractions[contractions.length - 1];
    const timeSinceLastContraction = lastContraction 
        ? (start - new Date(lastContraction.endTime)) / 60000 // בדקות
        : null;

    contractions.push({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration,
        timeSinceLastContraction
    });

    updateContractionsList();
    resetTimer();
    saveToLocalStorage();
    updateAverageDuration();
    updateLastInterval();
}

function updateTimer() {
    const now = new Date();
    const diff = now - startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    timerDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetTimer() {
    timerDisplay.textContent = '00:00:00';
}

function updateContractionsList() {
    contractionsList.innerHTML = '';
    contractions.slice().reverse().forEach((contraction, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ציר ${contractions.length - index}:<br>
            התחלה: ${formatTime(new Date(contraction.startTime))}<br>
            משך: ${formatDuration(contraction.duration)}<br>
            ${contraction.timeSinceLastContraction !== null 
                ? `זמן מהציר הקודם: ${formatDuration(contraction.timeSinceLastContraction * 60)}` 
                : ''}
            <button class="deleteBtn" data-index="${contractions.length - index - 1}">מחק</button>
        `;
        contractionsList.appendChild(li);
    });
    
    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteContraction(parseInt(this.getAttribute('data-index')));
        });
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('he-IL');
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} דקות ו-${remainingSeconds} שניות`;
}

function saveToLocalStorage() {
    localStorage.setItem('contractions', JSON.stringify(contractions));
}

function loadFromLocalStorage() {
    const savedContractions = localStorage.getItem('contractions');
    if (savedContractions) {
        contractions = JSON.parse(savedContractions);
        updateContractionsList();
        updateAverageDuration();
        updateLastInterval();
    }
}

function clearAllContractions() {
    contractions = [];
    updateContractionsList();
    saveToLocalStorage();
    updateAverageDuration();
    updateLastInterval();
}

function deleteContraction(index) {
    contractions.splice(index, 1);
    updateContractionsList();
    saveToLocalStorage();
    updateAverageDuration();
    updateLastInterval();
}

function showManualAddForm() {
    const form = document.createElement('form');
    form.innerHTML = `
        <label for="startTime">זמן התחלה:</label>
        <input type="datetime-local" id="startTime" required><br>
        <label for="duration">משך (בדקות):</label>
        <input type="number" id="duration" required><br>
        <button type="submit">הוסף</button>
    `;
    form.style.position = 'fixed';
    form.style.top = '50%';
    form.style.left = '50%';
    form.style.transform = 'translate(-50%, -50%)';
    form.style.backgroundColor = 'white';
    form.style.padding = '20px';
    form.style.border = '1px solid black';
    
    form.onsubmit = function(e) {
        e.preventDefault();
        const startTime = new Date(document.getElementById('startTime').value);
        const duration = parseInt(document.getElementById('duration').value) * 60; // המרה לשניות
        const endTime = new Date(startTime.getTime() + duration * 1000);
        addContraction(startTime, endTime, duration);
        document.body.removeChild(form);
    };
    
    document.body.appendChild(form);
}

function updateAverageDuration() {
    if (contractions.length > 0) {
        const totalDuration = contractions.reduce((sum, contraction) => sum + contraction.duration, 0);
        const averageDuration = totalDuration / contractions.length;
        averageDurationDisplay.textContent = `ממוצע משך צירים: ${formatDuration(averageDuration)}`;
    } else {
        averageDurationDisplay.textContent = 'אין נתונים על צירים';
    }
}

function updateLastInterval() {
    if (contractions.length > 1) {
        const lastContraction = contractions[contractions.length - 1];
        lastIntervalDisplay.textContent = `מרחק מציר קודם: ${formatDuration(lastContraction.timeSinceLastContraction * 60)}`;
    } else {
        lastIntervalDisplay.textContent = 'אין מידע על מרחק מציר קודם';
    }
}
