import numpy as np
import struct
from typing import Dict, Any, List

class DesignClassifier:
    """
    Analyzes CAD geometry to extract features for design classification.
    """

    @staticmethod
    def parse_stl(file_path: str) -> np.ndarray:
        """
        Parses a binary STL file into a numpy array of triangles.
        Returns array of shape (N, 3, 3) where N is number of triangles.
        """
        with open(file_path, 'rb') as f:
            # Skip header
            f.read(80)
            # Read triangle count
            count_data = f.read(4)
            if not count_data:
                return np.array([])
            count = struct.unpack('<I', count_data)[0]
            
            triangles = []
            for _ in range(count):
                # Skip normal (3 floats)
                f.read(12)
                # Read 3 vertices (3 floats each)
                v1 = struct.unpack('<fff', f.read(12))
                v2 = struct.unpack('<fff', f.read(12))
                v3 = struct.unpack('<fff', f.read(12))
                # Skip attribute byte count (2 bytes)
                f.read(2)
                triangles.append([v1, v2, v3])
                
        return np.array(triangles)

    def extract_features(self, triangles: np.ndarray) -> Dict[str, Any]:
        """
        Extracts geometric features from a set of triangles.
        """
        if triangles.size == 0:
            return {}

        # 1. Bounding Box & Dimensions
        all_points = triangles.reshape(-1, 3)
        min_p = np.min(all_points, axis=0)
        max_p = np.max(all_points, axis=0)
        dims = max_p - min_p
        
        # 2. Volume & Surface Area
        volume = self._calculate_volume(triangles)
        surface_area = self._calculate_surface_area(triangles)
        
        # 3. Complexity Metrics
        # Complexity can be represented by the ratio of surface area to volume
        # or the number of triangles relative to the size.
        complexity_ratio = surface_area / (volume ** (2/3)) if volume > 0 else 0
        triangle_density = len(triangles) / surface_area if surface_area > 0 else 0
        
        # 4. Aspect Ratios
        sorted_dims = np.sort(dims)
        aspect_ratio_main = sorted_dims[2] / sorted_dims[0] if sorted_dims[0] > 0 else 0
        aspect_ratio_secondary = sorted_dims[2] / sorted_dims[1] if sorted_dims[1] > 0 else 0
        
        # 5. Symmetry Score (Basic: distance between bounding box center and centroid)
        centroid = np.mean(all_points, axis=0)
        bbox_center = (min_p + max_p) / 2
        symmetry_offset = np.linalg.norm(centroid - bbox_center)
        # Normalize symmetry offset by largest dimension
        symmetry_score = 1.0 - (symmetry_offset / sorted_dims[2]) if sorted_dims[2] > 0 else 1.0

        return {
            "dimensions": dims.tolist(),
            "volume": float(volume),
            "surface_area": float(surface_area),
            "complexity_ratio": float(complexity_ratio),
            "triangle_density": float(triangle_density),
            "aspect_ratio_main": float(aspect_ratio_main),
            "aspect_ratio_secondary": float(aspect_ratio_secondary),
            "symmetry_score": float(symmetry_score),
            "triangle_count": len(triangles)
        }

    def _calculate_volume(self, triangles: np.ndarray) -> float:
        """
        Calculates volume using the signed volume of tetrahedra.
        """
        # Volume = sum of signed volumes of tetrahedra formed by origin and each triangle
        # V = 1/6 * |(v1 x v2) . v3|
        v1 = triangles[:, 0, :]
        v2 = triangles[:, 1, :]
        v3 = triangles[:, 2, :]
        
        cross = np.cross(v1, v2)
        volumes = np.einsum('ij,ij->i', cross, v3) / 6.0
        return np.abs(np.sum(volumes))

    def _calculate_surface_area(self, triangles: np.ndarray) -> float:
        """
        Calculates total surface area.
        """
        v1 = triangles[:, 0, :]
        v2 = triangles[:, 1, :]
        v3 = triangles[:, 2, :]
        
        # Area = 0.5 * |(v2-v1) x (v3-v1)|
        areas = 0.5 * np.linalg.norm(np.cross(v2 - v1, v3 - v1), axis=1)
        return np.sum(areas)
