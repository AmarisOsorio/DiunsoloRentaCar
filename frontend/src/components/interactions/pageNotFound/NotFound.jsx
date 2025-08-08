import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';
import Error404 from '../../../assets/Oops!404ErrorBlue.png'


const notFound = () => {
  return (
    <div className="notfound-fullpage">
      <div className="notfound-content-flat">

        {/******* Imagen de la página********/}
        <div className="notfound-image">
          <img src={Error404} alt="Robot averiado" />
        </div>


        {/******* Texto para informar el error ********/}
        <div className="notfound-text">
          <h1>¡Oops! Te saliste de la ruta</h1>
          <p>
            Esta dirección no existe en nuestro mapa, y nuestro robot GPS tampoco la encuentra.
            <br />
            <span className="notfound-sub">
              ¡Pero puedes volver al inicio y seguir tu viaje con DiunsoloRentaCar!
            </span>
          </p>

          {/******* Link para volver al inicio sin necesidad del navbar ********/}
          <Link to="/" className="notfound-link">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default notFound;

