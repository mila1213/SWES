# SWES - Sistema Web de Emprendimientos Estudiantiles

Descripcion del proyecto: SWES es una plataforma web tipo mini marketplace diseñada para la promoción, gestión y búsqueda de emprendimientos y servicios ofrecidos por estudiantes de la Escuela Politécnica Nacional.

El sistema permite a los usuarios registrarse e iniciar sesión para acceder a sus funcionalidades. Una vez dentro, los estudiantes pueden publicar y administrar sus propios emprendimientos, así como explorar los servicios ofrecidos por otros usuarios.

La plataforma organiza los emprendimientos en distintas categorías, como tecnología, educación y comida, facilitando la búsqueda y navegación. De esta manera, SWES fomenta la colaboración, visibilidad y crecimiento de iniciativas estudiantiles dentro de la comunidad universitaria.

## Funcionalidades

- Registro e inicio de sesión de usuarios
- Publicación y gestión de emprendimientos
- Visualización de servicios disponibles
- Clasificación por categorías (tecnología, educación, comida)
- Navegación entre usuarios y emprendimientos
- Contacto directo con los emprendimientos a través de WhatsApp
- Comunicación rápida entre cliente y emprendedor para facilitar acuerdos y consultas
  
## Arquitectura del sistema

El sistema sigue una arquitectura cliente-servidor:

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: Firebase Firestore
- Autenticación: Firebase Auth
  
## Estructura
* **/docs**: Diseños y mockups.
* **/frontend**: Interfaz de usuario creada con:
  1. React + Vite: Proporciona un renderizado eficiente de componentes y una velocidad de desarrollo superior gracias al hot-reload de Vite.
  2. Tailwind CSS: Framework principal de estilos dentro del frontend.
  3. Configuración Visual: El diseño se centra en los archivos **tailwind.config.js** e **index.css**
* **/backend**: Carpeta para la lógica del servidor.
* **.gitignore**: Configurado para no subir archivos innecesarios o pesados.

## Tecnologías
* **Base de Datos**: Firestore.
* **Autenticación**: Firebase.
* **Entorno**: Node.js v24.14.1 y npm 11.11.0.
* **Desarrollo de la interfaz de usuario del sistema**: Tailwind CSS

## Variables de entorno

- Este proyecto utiliza variables de entorno para la configuración.
- El archivo `.env` no está incluido en el repositorio por seguridad.
  Ejemplo de variables necesarias:
  ```env
  PORT=8000
  FIREBASE_API_KEY=tu_api_key
  FIREBASE_AUTH_DOMAIN=tu_dominio
  FIREBASE_PROJECT_ID=tu_proyecto

## Pasos para la ejecucion del proyecto:
1. Clona el repositorio en Visual Studio Code
2. En el proyecto abre una nueva terminal para cada carpeta:
   - Frontend
     1. Entra a la carpeta: `cd frontend`
     2. Instala todo lo necesario para el proyecto: `npm install`
     3. Ejecucion del frontend: `npm run dev`
     4. Resultado: `http://localhost:5173/ ` (puede variar según el entorno)
  - Backend
    1. Entra a la carpeta: `cd backend`
    2. Instala todo lo necesario para el proyecto: `npm install`
    3. Ejecucion del backend: `npm run dev`
    4. Resultado: Servidor corriendo en `http://localhost:8000/`

## Problemas conocidos
- El sistema requiere configuración manual de Firebase
- No incluye archivo `serviceAccountKey.json` por seguridad

## Diseño y Mockups

Puedes visualizar el prototipo del sistema en Figma en el siguiente enlace:

https://www.figma.com/design/fNTTzkFcvX08LUIrXNV0WA/Sin-t%C3%ADtulo?node-id=0-1&t=gz4VUQkisP9iNQFS-1

Nota: El diseño presentado en Figma es una propuesta conceptual y puede sufrir modificaciones durante el desarrollo del sistema.

## Capturas del sistema

1. Registro de cuenta 
   
   <img width="959" height="500" alt="image" src="https://github.com/user-attachments/assets/c858c9ed-aaf8-4cce-a101-8ca08302a070" />

   <img width="959" height="499" alt="image" src="https://github.com/user-attachments/assets/1226b376-373c-40cd-a84a-ac3dd7fc5694" />

3. Inicio de sesion

   <img width="702" height="443" alt="image" src="https://github.com/user-attachments/assets/44d85d26-9478-4c7b-821e-91606538f5b2" />

5. Autenticacion de inicio de sesion: Credenciales incorrectas
   
   <img width="699" height="434" alt="image" src="https://github.com/user-attachments/assets/15097803-02d6-4ce5-91f8-b322e94b45ae" />

6. Autenticacion de registro de usuario: Validacion de correo electronico unico

   <img width="701" height="440" alt="image" src="https://github.com/user-attachments/assets/1795b7c4-ed4f-46f0-a5bb-ef100b6543af" />

7. Autenticacion de registro de usuario: Validacion de la contraseña con un minimo de 6 caracteres

   <img width="701" height="441" alt="image" src="https://github.com/user-attachments/assets/c70a2252-1fa8-48d2-a786-4d1ea86ee7a3" />

4. Autenticacion en Firebase

   <img width="1535" height="629" alt="image" src="https://github.com/user-attachments/assets/44a5ce2a-9cbb-4575-8726-0daa01138c08" />


## Autores
- Nombres: Concepcion Arequipa, Camila Bueno y Leonor Yumi
- Institución: Escuela Politécnica Nacional




   
