# CP Gears Web App

A frontend web application for calculating bicycle drivetrain gearing using Web Components.

## Features

- **Input Parameters:**
  - Chainrings (with common presets)
  - Cassette range and cog count
  - Wheel size (ETRTO standards)
  - Tire width in millimeters
  - Pedaling cadence in rpm

- **Calculations:**
  - Gear ratios for all chainring/cog combinations
  - Gear-inches based on wheel diameter
  - Speed in kph at specified cadence

- **Output:**
  - 3 separate tables: Ratios, Gear-inches, Speed
  - Summary of inputs and wheel dimensions
  - Clean, responsive design

## Architecture

The app is built using standard **Web Components** with the following structure:

```
cp-gears-web-app/
├── index.html              # Main HTML entry point
├── package.json            # Project configuration
├── server.py              # Development server
├── js/
│   └── gearing-calculator.js  # Core calculation logic
└── components/
    ├── cp-gears-app.js     # Main app component
    ├── cp-gears-input.js   # Input form component
    └── cp-gears-results.js # Results display component
```

### Components

1. **`<cp-gears-app>`** - Main component that orchestrates the application
2. **`<cp-gears-input>`** - Form component for user input
3. **`<cp-gears-results>`** - Displays the 3 calculation tables
4. **`GearingCalculator`** - Utility class with all calculation logic

## Running the App

### Option 1: Python Server
```bash
cd cp-gears-web-app
python3 server.py
# Open http://localhost:8000 in your browser
```

### Option 2: Node.js (if installed)
```bash
cd cp-gears-web-app
npm install
npm start
# Open http://localhost:8000 in your browser
```

### Option 3: Direct File Access
Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari).

## Usage

1. Enter your chainring teeth (e.g., "50/34" or use presets)
2. Enter cassette range (e.g., "11-32") and number of cogs
3. Select wheel size from dropdown
4. Enter tire width in mm
5. Enter pedaling cadence (default: 80 rpm)
6. Click "Calculate Gearing"

## Calculation Formulas

- **Gear Ratio** = chainring teeth / cog teeth
- **Wheel Diameter** = ETRTO bead seat diameter + 2 × tire width (mm)
- **Wheel Circumference** = π × diameter (in meters)
- **Gear Inches** = gear ratio × wheel diameter (mm) / 25.4
- **Speed (kph)** = gear ratio × wheel circumference (m) × cadence × 60 / 1000

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari
- Any modern browser with Web Components v1 support

## Technologies Used

- Vanilla JavaScript (no frameworks)
- Standard Web Components (Custom Elements v1)
- Shadow DOM for component encapsulation
- CSS Grid and Flexbox for responsive layout
- No external dependencies

## License

MIT License
