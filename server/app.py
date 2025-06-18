from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.spatial import Voronoi, ConvexHull

app = Flask(__name__)
CORS(app)

def generate_reciprocal_points(b1, b2, b3, n=1):
    """Generate reciprocal lattice points using integer multiples"""
    points = []
    for i in range(-n, n+1):
        for j in range(-n, n+1):
            for k in range(-n, n+1):
                points.append(i*b1 + j*b2 + k*b3)
    return np.array(points)

def reciprocal_lattice_vectors(a1, a2, a3):
    """Compute reciprocal lattice vectors given direct lattice vectors."""
    volume = np.dot(a1, np.cross(a2, a3))
    b1 = 2.0 * np.pi * np.cross(a2, a3) / volume
    b2 = 2.0 * np.pi * np.cross(a3, a1) / volume
    b3 = 2.0 * np.pi * np.cross(a1, a2) / volume
    return b1, b2, b3

def generate_lattice_points(v1, v2, v3, n=2):
    """Generate lattice points using integer multiples of basis vectors."""
    points = []
    for i in range(-n, n+1):
        for j in range(-n, n+1):
            for k in range(-n, n+1):
                if abs(i) + abs(j) + abs(k) <= n:
                    points.append(i * v1 + j * v2 + k * v3)
    return np.array(points)

@app.route('/calculate_lattice', methods=['POST'])
def calculate_lattice():
    try:
        data = request.get_json()
        spacing = float(data.get('spacing', 1.0))
        a1 = np.array(data['a1']) * spacing
        a2 = np.array(data['a2']) * spacing
        a3 = np.array(data['a3']) * spacing

        try:
            b1, b2, b3 = reciprocal_lattice_vectors(a1, a2, a3)
        except ValueError as ve:
            return jsonify({'error': str(ve)}), 400

        reciprocal_points = generate_lattice_points(b1, b2, b3)
        response = {
            'reciprocal_lattice': {
                'x': reciprocal_points[:, 0].tolist(),
                'y': reciprocal_points[:, 1].tolist(),
                'z': reciprocal_points[:, 2].tolist()
            },
            'reciprocal_vectors': {
                'b1': b1.tolist(),
                'b2': b2.tolist(),
                'b3': b3.tolist()
            }
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/calculate_brillouin', methods=['POST'])
def calculate_brillouin():
    try:
        data = request.get_json()
        spacing = float(data.get('spacing', 1.0))
        a1 = np.array(data['a1']) * spacing
        a2 = np.array(data['a2']) * spacing
        a3 = np.array(data['a3']) * spacing

        b1, b2, b3 = reciprocal_lattice_vectors(a1, a2, a3)
        points = generate_reciprocal_points(b1, b2, b3, n=1)
        
        vor = Voronoi(points)
        origin_idx = np.where(np.all(np.isclose(points, 0), axis=1))[0][0]
        region_idx = vor.point_region[origin_idx]
        region = vor.regions[region_idx]
        
        if -1 in region or len(region) == 0:
            return jsonify({'error': 'Invalid Brillouin zone calculation'}), 400
            
        vertices = vor.vertices[region]
        hull = ConvexHull(vertices)
        
        return jsonify({
            'vertices': vertices.tolist(),
            'simplices': hull.simplices.tolist(),
            'reciprocal_vectors': {
                'b1': b1.tolist(),
                'b2': b2.tolist(),
                'b3': b3.tolist()
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)