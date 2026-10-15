// server.js: su única responsabilidad es poner a escuchar la aplicación.
import app from './app.js';

const PUERTO = process.env.PORT ?? 3000;

app.listen(PUERTO, () => {
  console.log(`🏋️  API Gimnasio escuchando en http://localhost:${PUERTO}`);
});
