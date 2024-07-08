let startTime, endTime, timerInterval;
let contractions = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const contractionsList = document.getElementById('contractionsList');

startBtn.addEventListener('click', startContraction);
stopBtn.addEventListener('click', stopContraction);

// טען נתונים מ-Local Storage בעת טעינת הדף
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
    const lastContraction = contractions[contractions.length - 1];
    const timeSinceLastContraction = lastContraction 
        ? (startTime - new Date(lastContraction.endTime)) / 60000 // בדקות
        : null;

    contractions.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        timeSinceLastContraction
    });

    updateContractionsList();
    resetTimer();
    saveToLocalStorage();
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
    contractions.forEach((contraction, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ציר ${index + 1}:<br>
            התחלה: ${formatTime(new Date(contraction.startTime))}<br>
            משך: ${formatDuration(contraction.duration)}<br>
            ${contraction.timeSinceLastContraction !== null 
                ? `זמן מהציר הקודם: ${formatDuration(contraction.timeSinceLastContraction * 60)}` 
                : ''}
        `;
        contractionsList.appendChild(li);
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
    }
}
