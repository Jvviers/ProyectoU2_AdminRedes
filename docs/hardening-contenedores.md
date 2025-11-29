## Nota sobre frontends y api-gateway

Se removió temporalmente `no-new-privileges`/`cap_drop` y se ejecutan como root (`user: "0:0"`) en los contenedores nginx de frontends y api-gateway. Motivo: la imagen `nginx:alpine` realiza `chown` sobre `/var/cache/nginx/*` en el entrypoint; con el usuario no root y `no-new-privileges` el proceso fallaba (`chown("/var/cache/nginx/client_temp", 101) failed (1: Operation not permitted)`), provocando un bucle de reinicio. Al ejecutar como root, el contenedor puede iniciar. Opciones para endurecer en el futuro:
- Montar `tmpfs` en `/var/cache/nginx` con permisos adecuados y mantener `no-new-privileges`.
- Construir una imagen derivada donde se creen los directorios de caché con permisos previos y se use un `user` no root.
- Añadir `user: 0:101` (root:nginx) solo para el entrypoint y luego hacer `USER nginx` en un wrapper, si se adapta la imagen.
