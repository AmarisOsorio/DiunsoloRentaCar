import { useEffect, useState } from 'react';

const apiUrl = "https://diunsolorentacar.onrender.com/api/vehicles"

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