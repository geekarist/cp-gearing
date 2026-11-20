// CP Gears App Component
// Main component that orchestrates the input and results

class CpGearsApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._results = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #4a90e2;
          padding-bottom: 15px;
        }
        
        .app-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        @media (min-width: 900px) {
          .app-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .error {
          background: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
      
      <h1>CP Gears - Bicycle Drivetrain Calculator</h1>
      
      <div class="app-container">
        <cp-gears-input id="input-form"></cp-gears-input>
        <cp-gears-results id="results-display"></cp-gears-results>
      </div>
      
      <div class="footer">
        Powered by CP Gears - Bicycle drivetrain calculations
      </div>
    `;
  }

  setupEventListeners() {
    const inputForm = this.shadowRoot.querySelector('#input-form');
    const resultsDisplay = this.shadowRoot.querySelector('#results-display');
    
    inputForm.addEventListener('calculate', (e) => {
      this.handleCalculate(e.detail);
    });
  }

  handleCalculate(params) {
    try {
      // Parse inputs
      const chainrings = GearingCalculator.parseChainrings(params.chainrings);
      const cassette = GearingCalculator.parseCassetteRange(params.cassette);
      
      // Derive full distributions
      const derivedChainrings = GearingCalculator.deriveChainrings(chainrings);
      const derivedCogs = GearingCalculator.deriveCassette(
        cassette.min, 
        cassette.max, 
        params.cogCount
      );
      
      // Get wheel ETRTO
      const wheelETRTO = GearingCalculator.getWheelETRTO(params.wheelSize);
      
      if (!wheelETRTO) {
        throw new Error(`Unknown wheel size: ${params.wheelSize}`);
      }
      
      if (derivedChainrings.length === 0) {
        throw new Error('Please enter valid chainring values');
      }
      
      if (derivedCogs.length === 0) {
        throw new Error('Please enter valid cassette range');
      }
      
      // Calculate everything
      const results = GearingCalculator.calculateAll(
        derivedChainrings,
        derivedCogs,
        wheelETRTO,
        params.tireWidth,
        params.cadence
      );
      
      // Add metadata
      results.cadence = params.cadence;
      results.inputs = params;
      
      this._results = results;
      this.shadowRoot.querySelector('#results-display').setResults(results);
      
      // Scroll to results
      this.shadowRoot.querySelector('#results-display').scrollIntoView({
        behavior: 'smooth'
      });
      
    } catch (error) {
      console.error('Calculation error:', error);
      this.showError(error.message);
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = `Error: ${message}`;
    
    const existingError = this.shadowRoot.querySelector('.error');
    if (existingError) {
      existingError.replaceWith(errorDiv);
    } else {
      const container = this.shadowRoot.querySelector('.app-container');
      container.insertBefore(errorDiv, container.firstChild);
    }
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  getResults() {
    return this._results;
  }
}

customElements.define('cp-gears-app', CpGearsApp);
