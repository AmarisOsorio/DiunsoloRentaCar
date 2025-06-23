import { useEffect, useState } from 'react';

const useCatalogo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehiculos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { vehiculos, loading };
};

export default useCatalogo;