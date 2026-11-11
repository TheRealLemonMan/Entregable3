#!/usr/bin/env sh
# block-env.sh — Bloquea commits que incluyan archivos .env o .env.local sensibles.
# Archivos permitidos: .env.example  (cualquier ruta)

staged=$(git diff --cached --name-only)

for file in $staged; do
  base=$(basename "$file")
  if [ "$base" = ".env" ] || [ "$base" = ".env.local" ]; then
    echo ""
    echo "🚫  COMMIT BLOQUEADO — archivo sensible detectado"
    echo "    Archivo: $file"
    echo ""
    echo "    Los archivos .env y .env.local pueden contener credenciales"
    echo "    y NO deben subirse al repositorio."
    echo ""
    echo "    ✔  Si quieres documentar variables de entorno, usa .env.example"
    echo "    ✔  Asegúrate de que .env y .env.local están en .gitignore"
    echo ""
    exit 1
  fi
done

exit 0

