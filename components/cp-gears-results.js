// CP Gears Results Component
// Displays the calculated gearing tables

class CpGearsResults extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._results = null;
  }

  static get observedAttributes() {
    return ['results'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'results') {
      try {
        this._results = JSON.parse(newValue);
      } catch (e) {
        this._results = null;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._results) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 20px;
            background: white;
            border-radius: 8px;
          }
          .no-results {
            color: #666;
            text-align: center;
            padding: 40px;
          }
        </style>
        <div class="no-results">Enter parameters and click "Calculate Gearing" to see results</div>
      `;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
          background: white;
          border-radius: 8px;
        }
        
        h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #4a90e2;
          padding-bottom: 10px;
        }
        
        .summary {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
        }
        
        .summary-label {
          font-weight: bold;
          color: #666;
          font-size: 14px;
        }
        
        .summary-value {
          font-size: 18px;
          color: #333;
        }
        
        .tables-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .table-wrapper {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        th, td {
          padding: 12px;
          text-align: center;
          border: 1px solid #ddd;
        }
        
        th {
          background: #4a90e2;
          color: white;
          font-weight: bold;
          position: sticky;
          top: 0;
        }
        
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        tr:hover {
          background: #f0f8ff;
        }
        
        .table-title {
          font-weight: bold;
          color: #4a90e2;
          margin-bottom: 8px;
          font-size: 18px;
        }
        
        .table-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .chainring-label, .cog-label {
          font-weight: bold;
          background: #e8f4fc !important;
        }
        
        .highlight-low {
          background: #ffebee !important;
        }
        
        .highlight-high {
          background: #e8f5e9 !important;
        }
      </style>
      
      <h2>Gearing Results</h2>
      
      ${this.renderSummary()}
      
      <div class="tables-container">
        ${this.renderRatioTable()}
        ${this.renderGearInchesTable()}
        ${this.renderSpeedTable()}
      </div>
    `;
  }

  renderSummary() {
    const { chainrings, cogs, wheelDiameter, wheelCircumference } = this._results;
    
    return `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Chainrings</div>
          <div class="summary-value">${chainrings.join(', ')}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Cassette</div>
          <div class="summary-value">${cogs.join(', ')}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Wheel Diameter</div>
          <div class="summary-value">${wheelDiameter.toFixed(0)} mm</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Wheel Circumference</div>
          <div class="summary-value">${wheelCircumference.toFixed(3)} m</div>
        </div>
      </div>
    `;
  }

  renderRatioTable() {
    const { ratios, chainrings, cogs } = this._results;
    
    return `
      <div class="table-wrapper">
        <div class="table-title">Gear Ratio Table</div>
        <div class="table-description">Gear ratio = chainring teeth / cog teeth</div>
        <table>
          <thead>
            <tr>
              <th>Chainring \\ Cog</th>
              ${cogs.map(cog => `<th>${cog}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${ratios.map((row, rowIdx) => `
              <tr>
                <td class="chainring-label">${chainrings[rowIdx]}</td>
                ${row.map(cell => `<td>${cell.value.toFixed(2)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderGearInchesTable() {
    const { gearInches, chainrings, cogs } = this._results;
    
    return `
      <div class="table-wrapper">
        <div class="table-title">Gear Inches Table</div>
        <div class="table-description">Gear inches = gear ratio × wheel diameter (mm) / 25.4</div>
        <table>
          <thead>
            <tr>
              <th>Chainring \\ Cog</th>
              ${cogs.map(cog => `<th>${cog}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${gearInches.map((row, rowIdx) => `
              <tr>
                <td class="chainring-label">${chainrings[rowIdx]}</td>
                ${row.map(cell => `<td>${cell.value.toFixed(1)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderSpeedTable() {
    const { speeds, chainrings, cogs, cadence } = this._results;
    const cadenceValue = this._results.cadence || 80;
    
    return `
      <div class="table-wrapper">
        <div class="table-title">Speed Table (at ${cadenceValue} rpm)</div>
        <div class="table-description">Speed (kph) = gear ratio × wheel circumference (m) × cadence × 60 / 1000</div>
        <table>
          <thead>
            <tr>
              <th>Chainring \\ Cog</th>
              ${cogs.map(cog => `<th>${cog}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${speeds.map((row, rowIdx) => `
              <tr>
                <td class="chainring-label">${chainrings[rowIdx]}</td>
                ${row.map(cell => `<td>${cell.value.toFixed(1)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  setResults(results) {
    this._results = results;
    this.render();
    this.dispatchEvent(new CustomEvent('results-updated', {
      detail: results,
      bubbles: true,
      composed: true
    }));
  }

  clearResults() {
    this._results = null;
    this.render();
  }
}

customElements.define('cp-gears-results', CpGearsResults);
