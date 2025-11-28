FROM postgres:15-alpine
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
# Normaliza finales de línea por si el archivo viene con CRLF
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["postgres"]
