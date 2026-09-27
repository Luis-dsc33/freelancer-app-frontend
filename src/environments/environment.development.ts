// environment.development.ts — ERJ: LA QUE SE USA CON `ionic serve` EN NUESTRO EQUIPO
// NO COLOQUEN LA DE PRODUCCION SINO TODO EN LOCAL, SE PRUEBA EN PRODUCCION CUANDO ESTE EN LA RAMA DE QA 
export const environment = {
  production: false,
  gatewayUrl: 'http://localhost:9080'
};