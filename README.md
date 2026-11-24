# Observatorio de Economía y Recursos Naturales de la Patagonia

Sitio web estático oficial del **Observatorio de Economía y Recursos Naturales de la Patagonia**, **Facultad de Ciencias Económicas**, **Universidad Nacional de la Patagonia San Juan Bosco (UNPSJB)**.

- **URL de producción:** `https://obsecon.unp.edu.ar`
- **Identidad visual:** basada en la propuesta institucional del Observatorio (Chakana escalonada, tipografía *Bricolage Grotesque* y paleta patagónica oficial).
- **Tecnología:** HTML5 semántico, CSS moderno por capas y JavaScript nativo sin dependencias ni paso de compilación (*build*).

---

## Estructura del directorio

Todo el sitio vive en un único directorio autocontenido:

```text
obsecon/
├── index.html          # Página principal (editable directamente)
├── styles.css          # Hoja de estilos con tokens de identidad visual
├── main.js             # Navegación adaptable con Popover API
├── assets/
│   ├── chakana.svg     # Isotipo Chakana del Observatorio
│   ├── chakana-seal.svg# Sello circular institucional
│   └── favicon.svg     # Ícono de pestaña del navegador
├── robots.txt          # Directivas para buscadores
├── sitemap.xml         # Mapa del sitio para https://obsecon.unp.edu.ar/
├── deploy.sh           # Script opcional de despliegue por rsync/SSH
└── README.md           # Esta documentación
```

## Enlaces incluidos

- **Plataforma principal:** [Sur en Precios](https://surenprecios.unp.edu.ar) (`https://surenprecios.unp.edu.ar`)
- **Otras herramientas del grupo** (listadas en `https://surenprecios.unp.edu.ar/#herramientas`):
  - [Buscador de Productos](https://buscador-productos.vercel.app/)
  - [Monitor San Jorge (OEFCE)](https://oefce-msj.streamlit.app/)
  - [Buscador de Materiales](https://buscador-productos.vercel.app/materiales/)
- **Institucional y contacto:** `https://www.unp.edu.ar`, `observatorioFCE@gmail.com`, `@observatoriofce.unpsjb`.

---

## 1. Edición local y vista previa

No requiere Node.js ni herramientas de compilación. Para editar textos, enlaces o agregar nuevas herramientas, modificá directamente `index.html` (o `styles.css`).

Para previsualizar el sitio localmente en tu navegador:

```bash
python3 -m http.server 8000
```

Luego abrí `http://localhost:8000` en el navegador.

---

## 2. Vinculación y actualización en GitHub

El directorio ya está inicializado como repositorio Git local en la rama `main`.

### Primera vez: conectar con GitHub

1. Creá un repositorio vacío en GitHub (por ejemplo `https://github.com/DanielBerns/obsecon`).
2. Vinculá el remoto y subí el primer commit:

```bash
git remote add origin git@github.com:DanielBerns/obsecon.git
git push -u origin main
```

*(Si preferís HTTPS: `git remote add origin https://github.com/DanielBerns/obsecon.git`)*

### Flujo habitual al editar el sitio

```bash
# 1. Editá index.html / styles.css y revisá en http://localhost:8000
# 2. Guardá y subí los cambios a GitHub:
git status
git add .
git commit -m "Actualiza enlaces y textos del Observatorio"
git push
```

---

## 3. Despliegue en el servidor de la UNPSJB (`https://obsecon.unp.edu.ar`)

Como el sitio es 100% estático, puede publicarse con cualquiera de estas dos opciones:

### Opción A — Actualización directa desde GitHub (`git pull` en el servidor)

En el servidor de la UNPSJB (una sola vez):

```bash
git clone https://github.com/DanielBerns/obsecon.git /var/www/obsecon.unp.edu.ar
```

Cada vez que actualices el repositorio en GitHub:

```bash
cd /var/www/obsecon.unp.edu.ar && git pull --ff-only
```

### Opción B — Despliegue por SSH/rsync desde tu equipo local (`deploy.sh`)

```bash
# Simulación sin sobrescribir archivos:
DEPLOY_TARGET="usuario@servidor.unp.edu.ar:/var/www/obsecon.unp.edu.ar/" ./deploy.sh --dry-run

# Publicación real:
DEPLOY_TARGET="usuario@servidor.unp.edu.ar:/var/www/obsecon.unp.edu.ar/" ./deploy.sh
```

También podés guardar `DEPLOY_TARGET` (y opcionalmente `DEPLOY_SSH_PORT`) en un archivo local `.env.deploy` (ignorado por Git).

### Ejemplo de configuración para Nginx (`obsecon.unp.edu.ar`)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name obsecon.unp.edu.ar;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name obsecon.unp.edu.ar;

    root /var/www/obsecon.unp.edu.ar;
    index index.html;

    # Certificados TLS (Let's Encrypt / certificado institucional UNPSJB)
    ssl_certificate     /etc/letsencrypt/live/obsecon.unp.edu.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/obsecon.unp.edu.ar/privkey.pem;

    # Bloquear acceso a archivos ocultos (.git, .env.deploy) y scripts internos
    location ~ /\. {
        deny all;
    }
    location ~* \.(sh|md)$ {
        deny all;
    }

    location / {
        try_files $uri $uri/ =404;
    }

    # Caché para activos estáticos
    location ~* \.(css|js|svg|ico)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
}
```

### Ejemplo de configuración para Apache (`obsecon.unp.edu.ar`)

```apache
<VirtualHost *:443>
    ServerName obsecon.unp.edu.ar
    DocumentRoot /var/www/obsecon.unp.edu.ar

    <Directory /var/www/obsecon.unp.edu.ar>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Bloquear .git, .env.deploy, deploy.sh y README.md
    RedirectMatch 404 /\.git
    <FilesMatch "^(\.|deploy\.sh$|README\.md$)">
        Require all denied
    </FilesMatch>
</VirtualHost>
```
