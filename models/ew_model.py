def calculate_ew_performance(data):
    """
    Calculates the performance of an electrowinning circuit based on Faraday's Law
    and empirical models for voltage.
    """
    # --- Constants ---
    FARADAY_CONSTANT = 96485      # Coulombs per mole (C/mol)
    COPPER_MOLAR_MASS = 63.546   # grams per mole (g/mol)
    ELECTRONS_TRANSFERRED = 2      # for Cu²⁺ -> Cu

    # --- Input Parameters from Form ---
    try:
        current_density = float(data.get('current_density', 300))     # A/m²
        current_efficiency = float(data.get('current_efficiency', 95)) # %
        num_cells = int(data.get('num_cells', 150))
        cathodes_per_cell = int(data.get('cathodes_per_cell', 60))
        # Plating area is per face of the cathode
        plating_area = float(data.get('plating_area', 1.0))           # m²

    except (ValueError, TypeError):
        return {"error": "Invalid input data. Please ensure all values are numbers."}

    # --- Core Calculations ---

    # 1. Calculate the total active plating area
    # Each cathode has two sides (faces) used for plating
    total_plating_area = num_cells * cathodes_per_cell * plating_area * 2

    # 2. Calculate the total DC current required for the plant
    total_current_amps = total_plating_area * current_density

    # 3. Calculate copper production rate using Faraday's Law
    # First, calculate the theoretical mass of copper produced per second at 100% efficiency
    theo_prod_grams_per_sec = (total_current_amps * COPPER_MOLAR_MASS) / (ELECTRONS_TRANSFERRED * FARADAY_CONSTANT)

    # Now, adjust for the actual user-provided current efficiency
    actual_prod_grams_per_sec = theo_prod_grams_per_sec * (current_efficiency / 100.0)

    # Convert the production rate from grams/second to tons/day for practical use
    # (g/s -> g/day -> tons/day)
    grams_per_day = actual_prod_grams_per_sec * 86400  # 86400 seconds in a day
    tons_per_day = grams_per_day / 1_000_000 # 1 million grams in a metric ton

    # 4. Estimate the cell voltage
    # This is a simplified empirical model. Real-world voltage depends on many factors.
    # We use a linear model that approximates behavior around a typical industrial
    # operating point of 300 A/m², with a baseline of ~1.9V.
    cell_voltage = 1.90 + 0.4 * (current_density / 300.0)

    # 5. Calculate the specific energy consumption (kWh per ton of copper)
    # This is a standard industry calculation based on the theoretical deposition rate.
    # Theoretical deposition (kg/kAh) = (Molar Mass in kg * 3600s/h * 1000A/kA) / (n * F) = 1.186
    if current_efficiency > 0:
        # kWh/ton = (V * 1000) / (kg_per_kiloamp_hour_at_CE%)
        kg_per_kAh_actual = 1.186 * (current_efficiency / 100.0)
        energy_kwh_per_ton = (cell_voltage * 1000) / kg_per_kAh_actual
    else:
        energy_kwh_per_ton = 0

    # --- Results ---
    results = {
        'copper_production_tpd': round(tons_per_day, 2),
        'total_current_a': round(total_current_amps, 0),
        'cell_voltage_v': round(cell_voltage, 2),
        'energy_consumption_kwh_per_ton': round(energy_kwh_per_ton, 0),
        'consultant_notes_ew': "Note: Cell voltage is an estimate from a common empirical model. Actual voltage varies with electrolyte condition and electrode age."
    }
    return results
