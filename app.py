from flask import Flask, render_template, request
from models.sx_model import calculate_sx_performance
from models.ew_model import calculate_ew_performance

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', results=None)

@app.route('/calculate', methods=['POST'])
def calculate():
    # Get form data from the POST request
    form_data = request.form

    # Call the scientific models with the form data
    sx_results = calculate_sx_performance(form_data)
    ew_results = calculate_ew_performance(form_data)

    # --- Consultant Logic Layer ---
    # Here we add simple rules to provide advice.
    general_notes = []
    try:
        # Rule 1: Check the Organic to Aqueous (O/A) ratio in the SX circuit
        pls_flow = float(form_data.get('pls_flow', 1))
        org_flow = float(form_data.get('org_flow', 1))
        if pls_flow > 0: # Avoid division by zero
            oa_ratio = org_flow / pls_flow
            if oa_ratio < 0.9 or oa_ratio > 1.1:
                general_notes.append(f"The O/A ratio is {oa_ratio:.2f}. A ratio far from the typical 1.0 can lead to poor stage efficiency or high entrainment losses.")

        # Rule 2: Check the current density in the EW circuit
        current_density = float(form_data.get('current_density', 300))
        if current_density > 350:
            general_notes.append("High current density (> 350 A/m²) can decrease current efficiency and negatively impact cathode quality (e.g., roughness).")
        elif current_density < 250:
            general_notes.append("Low current density (< 250 A/m²) is safer for cathode quality but may result in lower plant throughput than designed.")

    except (ValueError, TypeError):
        # This will catch errors if form data is not a valid number.
        # The models themselves also have error handling.
        pass

    # Combine all results into a single dictionary to pass to the template
    results = {
        'sx': sx_results,
        'ew': ew_results,
        'consultant_notes_general': " ".join(general_notes)
    }

    # Render the page again, this time passing the results to be displayed
    return render_template('index.html', results=results)

if __name__ == '__main__':
    # Using a different port can be helpful for development
    app.run(debug=True, port=5001)
