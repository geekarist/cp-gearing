// CP Gears Input Component
// Handles all user input for drivetrain parameters

class CpGearsInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._chainrings = '';
    this._cassette = '';
    this._cogCount = 11;
    this._wheelSize = '700c';
    this._tireWidth = 25;
    this._cadence = 80;
  }

  static get observedAttributes() {
    return ['chainrings', 'cassette', 'cog-count', 'wheel-size', 'tire-width', 'cadence'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'chainrings':
        this._chainrings = newValue;
        this.shadowRoot.querySelector('#chainrings').value = newValue;
        break;
      case 'cassette':
        this._cassette = newValue;
        this.shadowRoot.querySelector('#cassette').value = newValue;
        break;
      case 'cog-count':
        this._cogCount = parseInt(newValue, 10) || 11;
        this.shadowRoot.querySelector('#cog-count').value = this._cogCount;
        break;
      case 'wheel-size':
        this._wheelSize = newValue;
        this.shadowRoot.querySelector('#wheel-size').value = newValue;
        break;
      case 'tire-width':
        this._tireWidth = parseInt(newValue, 10) || 25;
        this.shadowRoot.querySelector('#tire-width').value = this._tireWidth;
        break;
      case 'cadence':
        this._cadence = parseInt(newValue, 10) || 80;
        this.shadowRoot.querySelector('#cadence').value = this._cadence;
        break;
    }
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
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #4a90e2;
          padding-bottom: 10px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        label {
          font-weight: bold;
          color: #444;
        }
        
        input, select {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
        
        .presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .preset-btn {
          padding: 6px 12px;
          background: #e0e0e0;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .preset-btn:hover {
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }
        
        .submit-btn {
          padding: 12px 24px;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.2s;
          margin-top: 20px;
        }
        
        .submit-btn:hover {
          background: #3a7bc8;
        }
        
        .hint {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
      </style>
      
      <h2>Bicycle Drivetrain Calculator</h2>
      
      <form id="gears-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="chainrings">Chainrings (teeth)</label>
            <input type="text" id="chainrings" placeholder="e.g., 50/34 or 50 34" 
                   value="${this._chainrings || ''}">
            <div class="hint">Enter chainring teeth separated by /, comma, or space</div>
            <div class="presets">
              ${this.renderChainringPresets()}
            </div>
          </div>
          
          <div class="form-group">
            <label for="cassette">Cassette Range</label>
            <input type="text" id="cassette" placeholder="e.g., 11-32" 
                   value="${this._cassette || ''}">
            <div class="hint">Enter min-max range, e.g., 11-32</div>
          </div>
          
          <div class="form-group">
            <label for="cog-count">Number of Cogs</label>
            <select id="cog-count">
              ${this.renderCogCountOptions()}
            </select>
          </div>
          
          <div class="form-group">
            <label for="wheel-size">Wheel Size</label>
            <select id="wheel-size">
              ${this.renderWheelSizeOptions()}
            </select>
          </div>
          
          <div class="form-group">
            <label for="tire-width">Tire Width (mm)</label>
            <input type="number" id="tire-width" min="15" max="100" 
                   value="${this._tireWidth}">
          </div>
          
          <div class="form-group">
            <label for="cadence">Cadence (rpm)</label>
            <input type="number" id="cadence" min="40" max="120" 
                   value="${this._cadence}">
          </div>
        </div>
        
        <button type="submit" class="submit-btn">Calculate Gearing</button>
      </form>
    `;
  }

  renderChainringPresets() {
    const presets = [...GearingCalculator.getChainringPresets().doubles, 
                      ...GearingCalculator.getChainringPresets().triples];
    return presets.map(preset => 
      `<button type="button" class="preset-btn" data-value="${preset}">
        ${preset}
      </button>`
    ).join('');
  }

  renderCogCountOptions() {
    const counts = [7, 8, 9, 10, 11, 12, 13];
    return counts.map(count => 
      `<option value="${count}" ${count === this._cogCount ? 'selected' : ''}>
        ${count} cogs
      </option>`
    ).join('');
  }

  renderWheelSizeOptions() {
    return GearingCalculator.getAllWheelNames().map(name => 
      `<option value="${name}" ${name === this._wheelSize ? 'selected' : ''}>
        ${name}
      </option>`
    ).join('');
  }

  setupEventListeners() {
    const form = this.shadowRoot.querySelector('#gears-form');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.dispatchSubmit();
    });
    
    // Chainring presets
    this.shadowRoot.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = this.shadowRoot.querySelector('#chainrings');
        input.value = btn.dataset.value;
        this._chainrings = btn.dataset.value;
      });
    });
    
    // Update internal state on input change
    const inputs = this.shadowRoot.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateStateFromInput(input);
      });
    });
  }

  updateStateFromInput(input) {
    switch (input.id) {
      case 'chainrings':
        this._chainrings = input.value;
        break;
      case 'cassette':
        this._cassette = input.value;
        break;
      case 'cog-count':
        this._cogCount = parseInt(input.value, 10) || 11;
        break;
      case 'wheel-size':
        this._wheelSize = input.value;
        break;
      case 'tire-width':
        this._tireWidth = parseInt(input.value, 10) || 25;
        break;
      case 'cadence':
        this._cadence = parseInt(input.value, 10) || 80;
        break;
    }
  }

  dispatchSubmit() {
    const chainrings = this.shadowRoot.querySelector('#chainrings').value;
    const cassette = this.shadowRoot.querySelector('#cassette').value;
    const cogCount = parseInt(this.shadowRoot.querySelector('#cog-count').value, 10);
    const wheelSize = this.shadowRoot.querySelector('#wheel-size').value;
    const tireWidth = parseInt(this.shadowRoot.querySelector('#tire-width').value, 10);
    const cadence = parseInt(this.shadowRoot.querySelector('#cadence').value, 10);
    
    this.dispatchEvent(new CustomEvent('calculate', {
      detail: {
        chainrings,
        cassette,
        cogCount,
        wheelSize,
        tireWidth,
        cadence
      },
      bubbles: true,
      composed: true
    }));
  }

  getFormData() {
    return {
      chainrings: this._chainrings,
      cassette: this._cassette,
      cogCount: this._cogCount,
      wheelSize: this._wheelSize,
      tireWidth: this._tireWidth,
      cadence: this._cadence
    };
  }

  setFormData(data) {
    if (data.chainrings !== undefined) this._chainrings = data.chainrings;
    if (data.cassette !== undefined) this._cassette = data.cassette;
    if (data.cogCount !== undefined) this._cogCount = data.cogCount;
    if (data.wheelSize !== undefined) this._wheelSize = data.wheelSize;
    if (data.tireWidth !== undefined) this._tireWidth = data.tireWidth;
    if (data.cadence !== undefined) this._cadence = data.cadence;
    this.render();
  }
}

customElements.define('cp-gears-input', CpGearsInput);
