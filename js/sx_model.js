function calculate_sx_performance(data) {
    /**
     * Calculates the performance of a solvent extraction circuit using a
     * stage-wise model calibrated with real operational data.
     */

    // --- Input Parameters from Form ---
    const pls_flow = parseFloat(data.pls_flow);
    const pls_cu = parseFloat(data.pls_cu);
    const org_flow = parseFloat(data.org_flow);
    const lean_electrolyte_cu = parseFloat(data.lean_electrolyte_cu);
    const num_stages = parseInt(data.num_stages, 10);

    if (isNaN(pls_flow) || isNaN(pls_cu) || isNaN(org_flow) || isNaN(lean_electrolyte_cu) || isNaN(num_stages)) {
        return { error: "Invalid input data. Please ensure all values are numbers." };
    }

    // --- Calibrated Stage-wise Model ---
    // Efficiencies are derived from the user's concentration data:
    // PLS=1.74, Raff E1=0.261 -> Stage 1 Eff = 85%
    // Raff E1=0.261, Raff E2=0.124 -> Stage 2 Eff = 52.5%
    const stage_efficiencies = [0.85, 0.525];

    // Heuristic for stages beyond the calibrated data: efficiency continues to drop.
    for (let i = stage_efficiencies.length; i < num_stages; i++) {
        stage_efficiencies.push(stage_efficiencies[i - 1] * 0.8); // Assume 80% of previous stage's efficiency
    }

    // --- Core Calculations ---
    let current_raffinate_cu = pls_cu;
    const stage_raffinate_concentrations = [];

    for (let i = 0; i < num_stages; i++) {
        const efficiency = stage_efficiencies[i] || 0.1; // Use a low default if stage is out of bounds
        current_raffinate_cu = current_raffinate_cu * (1 - efficiency);
        stage_raffinate_concentrations.push(current_raffinate_cu.toFixed(3));
    }

    const final_raffinate_cu = current_raffinate_cu;
    const overall_recovery = (pls_cu - final_raffinate_cu) / pls_cu;

    // Other calculations remain the same, but use the new overall_recovery
    const total_cu_in = pls_flow * pls_cu;
    const cu_transferred = total_cu_in * overall_recovery;

    const stripped_org_cu = 0.6;
    const loaded_org_cu = stripped_org_cu + (cu_transferred / org_flow);

    const strip_o_a_ratio = 4.0;
    const strip_electrolyte_flow = org_flow / strip_o_a_ratio;
    const rich_electrolyte_cu = lean_electrolyte_cu + (cu_transferred / strip_electrolyte_flow);

    // --- Format and Return Results ---
    const results = {
        'sx_recovery': (overall_recovery * 100).toFixed(2),
        'raffinate_cu': final_raffinate_cu.toFixed(3),
        'stage_results': stage_raffinate_concentrations,
        'loaded_organic_cu': loaded_org_cu.toFixed(2),
        'rich_electrolyte_cu': rich_electrolyte_cu.toFixed(2),
        'consultant_notes_sx': `Model uses calibrated stage efficiencies (Stage 1: 85.0%, Stage 2: 52.5%). Final raffinate after ${num_stages} stages is ${final_raffinate_cu.toFixed(3)} g/L.`
    };

    return results;
}
