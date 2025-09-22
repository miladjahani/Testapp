def calculate_sx_performance(data):
    """
    Calculates the performance of a solvent extraction circuit.

    This is a simplified model for a V1 application that uses an assumed
    recovery rate to determine the main outputs. This is a pragmatic choice
    to avoid complex iterative calculations in the first version, while still
    providing a useful tool for scenario analysis.
    """
    # --- Input Parameters from Form ---
    try:
        pls_flow = float(data.get('pls_flow', 100))         # m³/h
        pls_cu = float(data.get('pls_cu', 3.0))             # g/L
        org_flow = float(data.get('org_flow', 100))         # m³/h
        lean_electrolyte_cu = float(data.get('lean_electrolyte_cu', 35.0)) # g/L

        # For this simplified model, we assume a fixed recovery.
        # In a more complex model, this would be calculated from stages, etc.
        assumed_recovery = 0.92  # 92% recovery is a typical target

        # Assume a typical O/A ratio for the stripping section to calculate electrolyte flow
        strip_o_a_ratio = 4.0 # Organic to Aqueous ratio

    except (ValueError, TypeError):
        return {"error": "Invalid input data. Please ensure all values are numbers."}

    # --- Core Calculations ---

    # 1. Total copper coming into the plant from PLS
    total_cu_in = pls_flow * pls_cu  # kg/h of Cu

    # 2. How much copper is transferred to the organic phase
    cu_transferred = total_cu_in * assumed_recovery

    # 3. Calculate raffinate concentration (the waste stream)
    raffinate_cu = pls_cu * (1 - assumed_recovery)

    # 4. Calculate the concentration of the copper in the loaded organic
    # We assume a baseline of copper in the stripped organic (it's never perfectly clean)
    stripped_org_cu = 0.6  # g/L, a typical value for stripped organic
    loaded_org_cu = stripped_org_cu + (cu_transferred / org_flow)

    # 5. Calculate the concentration of the rich electrolyte going to EW
    # First, determine the flow rate of the electrolyte in the stripping section
    strip_electrolyte_flow = org_flow / strip_o_a_ratio

    # The amount of copper stripped from the organic must equal the amount transferred to the electrolyte
    rich_electrolyte_cu = lean_electrolyte_cu + (cu_transferred / strip_electrolyte_flow)

    # --- Results ---
    results = {
        'sx_recovery': round(assumed_recovery * 100, 1),
        'raffinate_cu': round(raffinate_cu, 2),
        'loaded_organic_cu': round(loaded_org_cu, 2),
        'rich_electrolyte_cu': round(rich_electrolyte_cu, 2),
        'consultant_notes_sx': "Note: SX model uses a simplified assumption for recovery (92%). This provides a good estimate for 'what-if' scenarios."
    }
    return results
