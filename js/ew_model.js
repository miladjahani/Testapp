function calculate_ew_performance(data) {
    /**
     * Calculates the performance of an electrowinning circuit based on Faraday's Law
     * and empirical models for voltage.
     */

    // --- Constants ---
    const FARADAY_CONSTANT = 96485;      // Coulombs per mole (C/mol)
    const COPPER_MOLAR_MASS = 63.546;   // grams per mole (g/mol)
    const ELECTRONS_TRANSFERRED = 2;      // for Cu²⁺ -> Cu

    // --- Input Parameters from Form ---
    const current_density = parseFloat(data.current_density);
    const current_efficiency = parseFloat(data.current_efficiency);
    const num_cells = parseInt(data.num_cells, 10);
    const cathodes_per_cell = parseInt(data.cathodes_per_cell, 10);
    const plating_area = parseFloat(data.plating_area);

    if (isNaN(current_density) || isNaN(current_efficiency) || isNaN(num_cells) || isNaN(cathodes_per_cell) || isNaN(plating_area)) {
        return { error: "Invalid input data. Please ensure all values are numbers." };
    }

    // --- Core Calculations ---

    // 1. Calculate the total active plating area (each cathode has 2 faces)
    const total_plating_area = num_cells * cathodes_per_cell * plating_area * 2;

    // 2. Calculate the total DC current required for the plant
    const total_current_amps = total_plating_area * current_density;

    // 3. Calculate copper production rate using Faraday's Law
    const theo_prod_grams_per_sec = (total_current_amps * COPPER_MOLAR_MASS) / (ELECTRONS_TRANSFERRED * FARADAY_CONSTANT);
    const actual_prod_grams_per_sec = theo_prod_grams_per_sec * (current_efficiency / 100.0);
    const tons_per_day = (actual_prod_grams_per_sec * 86400) / 1000000;

    // 4. Estimate the cell voltage using a simplified empirical model
    const cell_voltage = 1.90 + 0.4 * (current_density / 300.0);

    // 5. Calculate the specific energy consumption (kWh per ton of copper)
    let energy_kwh_per_ton = 0;
    if (current_efficiency > 0) {
        // Theoretical deposition rate is ~1.186 kg/kAh
        const kg_per_kAh_actual = 1.186 * (current_efficiency / 100.0);
        energy_kwh_per_ton = (cell_voltage * 1000) / kg_per_kAh_actual;
    }

    // --- Format and Return Results ---
    const results = {
        'copper_production_tpd': tons_per_day.toFixed(2),
        'total_current_a': total_current_amps.toFixed(0),
        'cell_voltage_v': cell_voltage.toFixed(2),
        'energy_consumption_kwh_per_ton': energy_kwh_per_ton.toFixed(0),
        'consultant_notes_ew': "Note: Cell voltage is an estimate from a common empirical model. Actual voltage varies with electrolyte condition and electrode age."
    };

    return results;
}
