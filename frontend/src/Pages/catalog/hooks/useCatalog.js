import { useEffect, useState } from 'react';

const apiUrl = "http://localhost:4000/api/vehicles"

const useCatalog = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}`)
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { vehicles, loading };
};

export default useCatalog;