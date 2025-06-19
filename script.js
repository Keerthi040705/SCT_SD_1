class TempShift {
    constructor() {
        this.conversions = [];
        this.fromScale = 'celsius';
        this.toScale = 'fahrenheit';
        this.init();
    }

    init() {
        this.bindElements();
        this.attachListeners();
    }

    bindElements() {
        this.tempInput = document.getElementById('temp-input');
        this.fromSelector = document.getElementById('from-selector');
        this.toSelector = document.getElementById('to-selector');
        this.swapBtn = document.getElementById('swap-btn');
        this.convertBtn = document.getElementById('convert-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.resultContainer = document.getElementById('result-container');
        this.resultValue = document.getElementById('result-value');
        this.resultFormula = document.getElementById('result-formula');
        this.historyContainer = document.getElementById('history-container');
        this.clearAllBtn = document.getElementById('clear-all-btn');
    }

    attachListeners() {
        this.tempInput.addEventListener('input', () => this.performConversion());
        this.tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addToHistory();
        });

        this.fromSelector.addEventListener('click', (e) => this.handleScaleSelect(e, 'from'));
        this.toSelector.addEventListener('click', (e) => this.handleScaleSelect(e, 'to'));

        this.swapBtn.addEventListener('click', () => this.swapScales());
        this.convertBtn.addEventListener('click', () => this.addToHistory());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.clearAllBtn.addEventListener('click', () => this.clearHistory());
    }

    handleScaleSelect(event, type) {
        if (!event.target.classList.contains('scale-option')) return;

        const selector = type === 'from' ? this.fromSelector : this.toSelector;
        const scale = event.target.dataset.scale;

        selector.querySelectorAll('.scale-option').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        if (type === 'from') {
            this.fromScale = scale;
        } else {
            this.toScale = scale;
        }

        this.performConversion();
    }

    performConversion() {
        const inputValue = this.tempInput.value.trim();
        if (!inputValue) {
            this.hideResult();
            return;
        }

        const temp = parseFloat(inputValue);
        if (isNaN(temp)) {
            this.showError('Invalid temperature value');
            return;
        }

        if (!this.isValidTemperature(temp, this.fromScale)) {
            this.showError('Temperature below absolute zero');
            return;
        }

        const result = this.convertTemperature(temp, this.fromScale, this.toScale);
        this.showResult(temp, result);
    }

    convertTemperature(value, from, to) {
        if (from === to) return value;

        let celsius;
        switch (from) {
            case 'celsius': celsius = value; break;
            case 'fahrenheit': celsius = (value - 32) * 5 / 9; break;
            case 'kelvin': celsius = value - 273.15; break;
        }

        switch (to) {
            case 'celsius': return celsius;
            case 'fahrenheit': return celsius * 9 / 5 + 32;
            case 'kelvin': return celsius + 273.15;
        }
    }

    isValidTemperature(value, scale) {
        switch (scale) {
            case 'celsius': return value >= -273.15;
            case 'fahrenheit': return value >= -459.67;
            case 'kelvin': return value >= 0;
            default: return false;
        }
    }

    showResult(input, result) {
        const roundedResult = Math.round(result * 100) / 100;
        const fromSymbol = this.getScaleSymbol(this.fromScale);
        const toSymbol = this.getScaleSymbol(this.toScale);

        this.resultValue.textContent = `${roundedResult}${toSymbol}`;
        this.resultFormula.textContent = `${input}${fromSymbol} equals ${roundedResult}${toSymbol}`;

        this.resultContainer.classList.remove('error');
        this.resultContainer.classList.add('show');
    }

    showError(message) {
        this.resultValue.textContent = message;
        this.resultFormula.textContent = '';
        this.resultContainer.classList.add('error');
        this.resultContainer.classList.add('show');
    }

    hideResult() {
        this.resultContainer.classList.remove('show');
    }

    getScaleSymbol(scale) {
        const symbols = {
            celsius: '°C',
            fahrenheit: '°F',
            kelvin: 'K'
        };
        return symbols[scale] || '';
    }

    getScaleName(scale) {
        const names = {
            celsius: 'Celsius',
            fahrenheit: 'Fahrenheit',
            kelvin: 'Kelvin'
        };
        return names[scale] || '';
    }

    swapScales() {
        [this.fromScale, this.toScale] = [this.toScale, this.fromScale];
        this.updateScaleSelectors();

        if (this.resultContainer.classList.contains('show') && !this.resultContainer.classList.contains('error')) {
            const resultText = this.resultValue.textContent;
            const numericResult = parseFloat(resultText);
            if (!isNaN(numericResult)) {
                this.tempInput.value = numericResult;
            }
        }

        this.performConversion();
    }

    updateScaleSelectors() {
        this.fromSelector.querySelectorAll('.scale-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === this.fromScale);
        });

        this.toSelector.querySelectorAll('.scale-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === this.toScale);
        });
    }

    addToHistory() {
        if (!this.resultContainer.classList.contains('show') || this.resultContainer.classList.contains('error')) return;

        const input = parseFloat(this.tempInput.value);
        const result = parseFloat(this.resultValue.textContent);

        const conversion = {
            id: Date.now(),
            input: input,
            result: result,
            from: this.fromScale,
            to: this.toScale,
            timestamp: new Date().toLocaleString()
        };

        this.conversions.unshift(conversion);
        if (this.conversions.length > 8) {
            this.conversions = this.conversions.slice(0, 8);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.conversions.length === 0) {
            this.historyContainer.innerHTML = '<div class="empty-state">No conversions yet</div>';
            this.clearAllBtn.style.display = 'none';
            return;
        }

        this.historyContainer.innerHTML = this.conversions.map(conv => `
            <div class="history-item">
                <div class="history-conversion">
                    ${conv.input}${this.getScaleSymbol(conv.from)} → ${conv.result}${this.getScaleSymbol(conv.to)}
                </div>
                <div class="history-details">
                    ${this.getScaleName(conv.from)} to ${this.getScaleName(conv.to)} • ${conv.timestamp}
                </div>
            </div>
        `).join('');

        this.clearAllBtn.style.display = 'inline';
    }

    clearHistory() {
        this.conversions = [];
        this.updateHistoryDisplay();
    }

    reset() {
        this.tempInput.value = '';
        this.hideResult();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TempShift();
});
