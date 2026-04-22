class Calculator {
    constructor() {
        this.displayValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = 0;
        this.history = [];
        this.mode = 'advanced';

        this.mainDisplay = document.getElementById('mainDisplay');
        this.previousDisplay = document.getElementById('previousDisplay');
        this.historyDisplay = document.getElementById('historyDisplay');
        this.historyList = document.getElementById('historyList');
        this.memoryValue = document.getElementById('memoryValue');

        this.initializeEventListeners();
        this.loadHistory();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNumber(e.target.dataset.number));
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOperator(e.target.dataset.operator));
        });

        // Function buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFunction(e.target.dataset.action));
        });

        // Memory buttons
        document.getElementById('mc').addEventListener('click', () => this.memoryClear());
        document.getElementById('mr').addEventListener('click', () => this.memoryRecall());
        document.getElementById('mplus').addEventListener('click', () => this.memoryAdd());
        document.getElementById('mminus').addEventListener('click', () => this.memorySubtract());

        // History clear
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());

        // Mode toggle
        document.getElementById('basicMode').addEventListener('click', () => this.setMode('basic'));
        document.getElementById('advancedMode').addEventListener('click', () => this.setMode('advanced'));

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleNumber(num) {
        if (this.shouldResetDisplay) {
            this.displayValue = num;
            this.shouldResetDisplay = false;
        } else {
            if (num === '.' && this.displayValue.includes('.')) return;
            this.displayValue = this.displayValue === '0' ? num : this.displayValue + num;
        }
        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.operation !== null && !this.shouldResetDisplay) {
            this.calculate();
        }
        this.previousValue = this.displayValue;
        this.historyDisplay.textContent = `${this.previousValue} ${op}`;
        this.operation = op;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    handleFunction(action) {
        const current = parseFloat(this.displayValue);
        let result;

        switch (action) {
            case 'clear':
                this.displayValue = '0';
                this.previousValue = '';
                this.operation = null;
                this.historyDisplay.textContent = '';
                this.previousDisplay.textContent = '';
                break;
            case 'delete':
                this.displayValue = this.displayValue.slice(0, -1) || '0';
                break;
            case 'percent':
                result = current / 100;
                this.displayValue = this.formatNumber(result);
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                this.addToHistory(`√${current}`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'cbrt':
                result = Math.cbrt(current);
                this.addToHistory(`∛${current}`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'power':
                result = current * current;
                this.addToHistory(`${current}²`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                this.addToHistory(`sin(${current})`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                this.addToHistory(`cos(${current})`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                this.addToHistory(`tan(${current})`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'log':
                result = Math.log10(current);
                this.addToHistory(`log(${current})`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'ln':
                result = Math.log(current);
                this.addToHistory(`ln(${current})`, result);
                this.displayValue = this.formatNumber(result);
                break;
            case 'pi':
                this.displayValue = this.formatNumber(Math.PI);
                break;
            case 'factorial':
                if (current < 0 || current % 1 !== 0) {
                    this.displayValue = 'Error';
                } else {
                    result = this.factorial(current);
                    this.addToHistory(`${current}!`, result);
                    this.displayValue = this.formatNumber(result);
                }
                break;
            case 'equals':
                this.calculate();
                break;
        }

        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    calculate() {
        if (this.operation === null || this.previousValue === '') return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.displayValue);
        let result;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = current !== 0 ? prev / current : 0;
                break;
            default:
                return;
        }

        this.addToHistory(`${prev} ${this.operation} ${current}`, result);
        this.displayValue = this.formatNumber(result);
        this.previousValue = '';
        this.operation = null;
        this.historyDisplay.textContent = '';
        this.previousDisplay.textContent = '';
    }

    factorial(n) {
        if (n > 170) return Infinity;
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) return 'Error';
        const str = num.toLocaleString('en-US', {
            maximumFractionDigits: 10,
            minimumFractionDigits: 0
        });
        return str;
    }

    updateDisplay() {
        this.mainDisplay.textContent = this.displayValue;
    }

    addToHistory(expression, result) {
        const resultFormatted = this.formatNumber(result);
        this.history.unshift({ expression, result: resultFormatted });
        if (this.history.length > 20) {
            this.history.pop();
        }
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = '';
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">${item.result}</span>
            `;
            historyItem.addEventListener('click', () => {
                this.displayValue = item.result;
                this.shouldResetDisplay = true;
                this.updateDisplay();
            });
            this.historyList.appendChild(historyItem);
        });
    }

    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calcHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.renderHistory();
        }
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    memoryClear() {
        this.memory = 0;
        this.updateMemoryDisplay();
    }

    memoryRecall() {
        this.displayValue = this.formatNumber(this.memory);
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    memoryAdd() {
        this.memory += parseFloat(this.displayValue);
        this.updateMemoryDisplay();
        this.shouldResetDisplay = true;
    }

    memorySubtract() {
        this.memory -= parseFloat(this.displayValue);
        this.updateMemoryDisplay();
        this.shouldResetDisplay = true;
    }

    updateMemoryDisplay() {
        this.memoryValue.textContent = this.memory !== 0 ? this.memory.toFixed(6) : '0';
    }

    setMode(newMode) {
        this.mode = newMode;
        document.getElementById('basicMode').classList.toggle('active');
        document.getElementById('advancedMode').classList.toggle('active');
        document.getElementById('advancedRow').classList.toggle('active');
        document.getElementById('advancedRowBottom').classList.toggle('active');
    }

    handleKeyPress(e) {
        const key = e.key;

        if (key >= '0' && key <= '9') {
            this.handleNumber(key);
        } else if (key === '.') {
            this.handleNumber('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            e.preventDefault();
            this.handleOperator(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.handleFunction('equals');
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.handleFunction('delete');
        } else if (key === 'Escape') {
            this.handleFunction('clear');
        }
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
