// Gearing Calculator Utility
// Contains all the calculation logic for bicycle drivetrain

const WHEEL_STANDARDS = {
  '700c': 622,
  '29"': 622,
  '28"': 622,
  '650b': 584,
  '27.5"': 584,
  '650c': 571,
  '26"': 559,
  '24"': 507,
  '20"': 406,
  '20" (racing)': 451,
  '16"': 349,
  '16" (Brompton)': 349
};

const CHAINRING_STANDARDS = {
  doubles: ['53/39', '52/36', '50/34', '48/32', '46/30'],
  triples: ['52/42/30', '50/40/30', '48/38/28', '46/36/26', '44/32/22']
};

const CASSETTE_STANDARDS = {
  '11-25 (11)': [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25],
  '11-28 (11)': [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28],
  '11-30 (11)': [11, 12, 13, 14, 15, 17, 19, 21, 23, 26, 30],
  '11-32 (11)': [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32],
  '11-34 (11)': [11, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34],
  '12-25 (11)': [12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25],
  '12-28 (11)': [12, 13, 14, 15, 16, 17, 19, 21, 23, 25, 28],
  '11-30 (12)': [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30],
  '11-50 (12)': [11, 13, 15, 17, 19, 21, 24, 28, 32, 36, 42, 50]
};

class GearingCalculator {
  static getWheelETRTO(wheelName) {
    return WHEEL_STANDARDS[wheelName] || null;
  }

  static getAllWheelNames() {
    return Object.keys(WHEEL_STANDARDS).sort();
  }

  static getChainringPresets() {
    return {
      doubles: CHAINRING_STANDARDS.doubles,
      triples: CHAINRING_STANDARDS.triples
    };
  }

  static getCassettePresets() {
    return Object.keys(CASSETTE_STANDARDS).sort();
  }

  static parseChainrings(input) {
    // Parse chainring input like "50/34" or "50,34" or "50 34"
    if (!input) return [];
    
    const cleaned = input.replace(/[/,\s]+/g, ' ').trim();
    const parts = cleaned.split(/\s+/).filter(p => p);
    return parts.map(p => parseInt(p, 10)).filter(n => !isNaN(n));
  }

  static parseCassetteRange(input) {
    // Parse cassette input like "11-32" or "11 to 32"
    if (!input) return { min: null, max: null, count: null };
    
    const match = input.match(/(\d+)[\s-]+(\d+)\s*(?:(\d+)\s*cogs?)?/i);
    if (match) {
      return {
        min: parseInt(match[1], 10),
        max: parseInt(match[2], 10),
        count: match[3] ? parseInt(match[3], 10) : null
      };
    }
    return { min: null, max: null, count: null };
  }

  static deriveChainrings(parsed) {
    if (parsed.length === 0) return [];
    if (parsed.length >= 2) {
      // Already have multiple chainrings
      return parsed.sort((a, b) => b - a); // Descending
    }
    if (parsed.length === 1) {
      // Single chainring
      return [parsed[0]];
    }
    return [];
  }

  static deriveCassette(min, max, count) {
    if (min === null || max === null || count === null) return [];
    
    // Check if this matches a known cassette
    const presetKey = `${min}-${max} (${count})`;
    if (CASSETTE_STANDARDS[presetKey]) {
      return [...CASSETTE_STANDARDS[presetKey]];
    }
    
    // Progressive interpolation
    return this.interpolateCassette(min, max, count);
  }

  static interpolateCassette(min, max, count) {
    if (count <= 1) return [min];
    
    const cogs = [min];
    const step = (max - min) / (count - 1);
    
    for (let i = 1; i < count - 1; i++) {
      // Use geometric progression that grows toward the large end
      const ratio = i / (count - 1);
      const cog = Math.round(min + (max - min) * ratio);
      cogs.push(cog);
    }
    cogs.push(max);
    
    // Ensure unique and sorted
    return [...new Set(cogs)].sort((a, b) => a - b);
  }

  static calculateWheelDiameter(etrto, tireWidth) {
    // diameter in mm = bead seat diameter + 2 * tire width
    return etrto + 2 * tireWidth;
  }

  static calculateWheelCircumference(diameterMm) {
    // circumference in meters = pi * diameter in meters
    return Math.PI * (diameterMm / 1000);
  }

  static calculateGearRatio(chainring, cog) {
    return chainring / cog;
  }

  static calculateGearInches(ratio, wheelDiameterMm) {
    // gear inches = ratio * wheel diameter in mm / 25.4
    return ratio * wheelDiameterMm / 25.4;
  }

  static calculateSpeedKph(ratio, wheelCircumferenceM, cadenceRpm) {
    // speed in kph = ratio * circumference * cadence * 60 / 1000
    return ratio * wheelCircumferenceM * cadenceRpm * 60 / 1000;
  }

  static calculateAll(chainrings, cogs, wheelETRTO, tireWidth, cadence = 80) {
    const wheelDiameter = this.calculateWheelDiameter(wheelETRTO, tireWidth);
    const wheelCircumference = this.calculateWheelCircumference(wheelDiameter);
    
    const results = {
      chainrings: [...chainrings].sort((a, b) => b - a),
      cogs: [...cogs].sort((a, b) => a - b),
      wheelDiameter,
      wheelCircumference,
      ratios: [],
      gearInches: [],
      speeds: []
    };
    
    // Create tables
    results.ratios = results.chainrings.map(chainring => {
      return cogs.map(cog => {
        const ratio = this.calculateGearRatio(chainring, cog);
        return { chainring, cog, value: ratio };
      });
    });
    
    results.gearInches = results.chainrings.map(chainring => {
      return cogs.map(cog => {
        const ratio = this.calculateGearRatio(chainring, cog);
        const gearInches = this.calculateGearInches(ratio, wheelDiameter);
        return { chainring, cog, value: gearInches };
      });
    });
    
    results.speeds = results.chainrings.map(chainring => {
      return cogs.map(cog => {
        const ratio = this.calculateGearRatio(chainring, cog);
        const speed = this.calculateSpeedKph(ratio, wheelCircumference, cadence);
        return { chainring, cog, value: speed };
      });
    });
    
    return results;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GearingCalculator;
}
