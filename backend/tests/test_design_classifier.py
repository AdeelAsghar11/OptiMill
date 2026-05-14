import numpy as np
import os
import struct
import tempfile
from app.models.design_classifier import DesignClassifier

def create_mock_stl(file_path):
    """Creates a simple cube STL (12 triangles, 10x10x10)"""
    # 80 bytes header
    header = b'\x00' * 80
    # 12 triangles
    count = 12
    with open(file_path, 'wb') as f:
        f.write(header)
        f.write(struct.unpack('<I', struct.pack('<I', count))[0].to_bytes(4, 'little'))
        
        # Facets (just mock data for a cube-like shape)
        for _ in range(count):
            # Normal
            f.write(struct.pack('<fff', 0.0, 0.0, 0.0))
            # Vertices (dummy)
            f.write(struct.pack('<fff', 0.0, 0.0, 0.0))
            f.write(struct.pack('<fff', 10.0, 0.0, 0.0))
            f.write(struct.pack('<fff', 0.0, 10.0, 10.0))
            # Attribute byte count
            f.write(b'\x00\x00')

def test_stl_parsing():
    with tempfile.NamedTemporaryFile(delete=False, suffix=".stl") as tmp:
        create_mock_stl(tmp.name)
        tmp_path = tmp.name
    
    classifier = DesignClassifier()
    triangles = classifier.parse_stl(tmp_path)
    
    assert len(triangles) == 12
    assert triangles.shape == (12, 3, 3)
    
    os.unlink(tmp_path)

def test_feature_extraction():
    # Mock triangles for a 10x10x10 cube
    # (Simplified: just two triangles forming a square at z=0 and z=10)
    triangles = np.array([
        [[0,0,0], [10,0,0], [0,10,0]],
        [[10,10,0], [10,0,0], [0,10,0]],
        [[0,0,10], [10,0,10], [0,10,10]],
        [[10,10,10], [10,0,10], [0,10,10]]
    ])
    
    classifier = DesignClassifier()
    features = classifier.extract_features(triangles)
    
    assert features['dimensions'] == [10.0, 10.0, 10.0]
    assert features['triangle_count'] == 4
    assert features['symmetry_score'] > 0.9  # Cube is symmetric
    assert features['aspect_ratio_main'] == 1.0  # 10/10

if __name__ == "__main__":
    test_stl_parsing()
    test_feature_extraction()
    print("All tests passed!")
