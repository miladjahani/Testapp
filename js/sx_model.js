function calculate_sx_performance(data) {
    /**
     * Calculates the performance of a solvent extraction circuit.
     * This is a simplified model that uses an assumed recovery rate.
     */

    // --- Input Parameters from Form ---
    // Values from form fields are strings, so they must be parsed to numbers.
    const pls_flow = parseFloat(data.pls_flow);
    const pls_cu = parseFloat(data.pls_cu);
    const org_flow = parseFloat(data.org_flow);
    const lean_electrolyte_cu = parseFloat(data.lean_electrolyte_cu);

    // Basic validation to ensure inputs are valid numbers.
    if (isNaN(pls_flow) || isNaN(pls_cu) || isNaN(org_flow) || isNaN(lean_electrolyte_cu)) {
        return { error: "Invalid input data. Please ensure all values are numbers." };
    }

    // --- Model Constants ---
    const assumed_recovery = 0.92;  // 92% recovery is a typical target.
    const strip_o_a_ratio = 4.0;    // Typical Organic to Aqueous ratio in stripping section.

    // --- Core Calculations ---

    // 1. Total copper input from PLS (in kg/h)
    const total_cu_in = pls_flow * pls_cu;

    // 2. Amount of copper transferred to the organic phase
    const cu_transferred = total_cu_in * assumed_recovery;

    // 3. Raffinate concentration (waste stream)
    const raffinate_cu = pls_cu * (1 - assumed_recovery);

    // 4. Loaded organic concentration
    const stripped_org_cu = 0.6; // A typical baseline for copper in stripped organic (g/L)
    const loaded_org_cu = stripped_org_cu + (cu_transferred / org_flow);

    // 5. Rich electrolyte concentration (feed to EW)
    const strip_electrolyte_flow = org_flow / strip_o_a_ratio;
    const rich_electrolyte_cu = lean_electrolyte_cu + (cu_transferred / strip_electrolyte_flow);

    // --- Format and Return Results ---
    // .toFixed() is used for rounding to a specific number of decimal places.
    const results = {
        'sx_recovery': (assumed_recovery * 100).toFixed(1),
        'raffinate_cu': raffinate_cu.toFixed(2),
        'loaded_organic_cu': loaded_org_cu.toFixed(2),
        'rich_electrolyte_cu': rich_electrolyte_cu.toFixed(2),
        'consultant_notes_sx': "Note: SX model uses a simplified assumption for recovery (92%). This provides a good estimate for 'what-if' scenarios."
    };

    return results;
}
