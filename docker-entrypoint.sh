#!/bin/sh
set -e

# Ketiga API (auth, dashboard, assessment) memakai advisory lock node-pg-migrate yang sama di satu database,
# jadi migrasi diulang bila API lain sedang migrasi atau database belum siap.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  attempt=1
  until npm run migrate:up; do
    if [ "$attempt" -ge 12 ]; then
      echo "Migrasi gagal setelah $attempt percobaan" >&2
      exit 1
    fi
    echo "Migrasi gagal, mencoba lagi dalam 5 detik ($attempt/12)" >&2
    attempt=$((attempt + 1))
    sleep 5
  done
fi

exec "$@"
