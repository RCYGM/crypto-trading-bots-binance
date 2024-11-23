# 1. Nodemon no está instalado globalmente
# Si instalaste nodemon solo en un proyecto específico (localmente), no estará disponible como comando en la terminal global.
# Para verificar si está instalado globalmente, ejecuta:

npm list -g --depth=0

# Si nodemon no aparece en la lista, instálalo globalmente:

npm install -g nodemon

# 2. Nodemon está instalado localmente
# Si prefieres usar nodemon instalado localmente en tu proyecto, puedes ejecutar el comando así:

npx nodemon index.js

# Esto ejecutará nodemon sin necesidad de instalarlo globalmente.
