# Деплой prosetskaya.ru на Timeweb Cloud Apps (с обходом блокировок)

Адаптация инструкции под этот сайт. Домены: **https://prosetskaya.ru** (сайт) и **https://api.prosetskaya.ru** (прокси к базе).

## Архитектура

```text
Браузер (РФ) ──► prosetskaya.ru / api.prosetskaya.ru :443 (SSL Timeweb)
                         │ :8082
                         ▼
               edge (nginx, всегда онлайн)
               ├─ prosetskaya.ru      → app:3000 (сайт с серверным рендерингом)
               │    • при 502/503/504 → maintenance.html
               │    • /__l5e/*        → изображения картин (кешируются на сервере 30 дней)
               └─ api.prosetskaya.ru  → https://pgssrcadvcwxmvuhfozu.supabase.co
                                        (Auth / REST / Storage / Realtime)
```

Отличие от исходной инструкции: сайт не статический (SPA), а с серверным рендерингом
(Node, `NITRO_PRESET=node-server`). Поэтому прокси на `api.` живёт в `edge` — он работает
даже во время пересборки приложения.

## Файлы

| Файл | Назначение |
|------|------------|
| `Dockerfile` | Сборка сайта под Node, запуск `node .output/server/index.mjs` на порту 3000 |
| `docker-compose.yml` | `edge` (порт 8082→8080) и `app` (только `expose: 3000`) |
| `edge/nginx.conf` | Сайт + прокси `api.prosetskaya.ru` + авто-заглушка + кеш картинок |
| `edge/Dockerfile`, `edge/maintenance.html` | nginx:alpine, healthcheck `/__edge_health`, страница обновления |
| `.dockerignore` | Исключает node_modules, .git, сборки |

## Переменные окружения в Timeweb

| Переменная | Значение |
|------------|----------|
| `VITE_SUPABASE_URL` | `https://api.prosetskaya.ru` (по умолчанию уже так) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | публичный ключ из `.env` проекта (`sb_publishable_...`) |
| `VITE_SUPABASE_PROJECT_ID` | `pgssrcadvcwxmvuhfozu` (по умолчанию уже так) |
| `SUPABASE_SERVICE_ROLE_KEY` | см. «Ограничения» |

`.env` в репозитории НЕ меняем — он нужен для предпросмотра в Lovable. Значения для продакшена
передаются через build args в `docker-compose.yml`.

## Шаги

1. Подключить GitHub-репозиторий проекта к Timeweb Cloud Apps → тип **Docker Compose**.
2. Задать переменные из таблицы выше.
3. Внешний порт приложения: **8082**. Healthcheck: `GET /__edge_health`.
4. DNS у регистратора:
   - `A  prosetskaya.ru      → IP Timeweb`
   - `A  www.prosetskaya.ru  → IP Timeweb` (редирект на основной домен)
   - `A  api.prosetskaya.ru  → IP Timeweb` ← без него обхода нет
5. SSL (Let's Encrypt) — на `prosetskaya.ru`, `www.prosetskaya.ru` и `api.prosetskaya.ru`.
6. Deploy. Первая сборка ~6–10 минут.
7. В Lovable: настройки авторизации → Site URL `https://prosetskaya.ru`,
   Redirect URLs `https://prosetskaya.ru/*`, `https://www.prosetskaya.ru/*`
   (это делается через Lovable — попросите агента, доступа к панели Supabase нет).
8. ЮKassa: адрес уведомлений `https://prosetskaya.ru/api/public/yookassa`.

## Проверка

```bash
curl -s  https://prosetskaya.ru/__edge_health                     # ok
curl -sI https://prosetskaya.ru/ | head -1                         # HTTP/2 200
curl -sI https://api.prosetskaya.ru/auth/v1/health                 # 200/401 — норма
curl -sI -X OPTIONS https://api.prosetskaya.ru/auth/v1/token \
  -H "Origin: https://prosetskaya.ru" -H "Access-Control-Request-Method: POST"
                                                                   # 204, один Access-Control-Allow-Origin
curl -sI https://prosetskaya.ru/__l5e/assets-v1/... | grep -i x-cache   # MISS, затем HIT
```

## Ручная заглушка

```bash
docker exec <edge> touch /etc/nginx/flags/maintenance.enabled   # включить
docker exec <edge> rm    /etc/nginx/flags/maintenance.enabled   # выключить
https://prosetskaya.ru/?bypass_maintenance=1                    # обход для админа
```

## Ограничения

- **Сервисный ключ базы** (`SUPABASE_SERVICE_ROLE_KEY`) в Lovable Cloud недоступен. Без него на
  Timeweb не будут работать две серверные операции: создание онлайн-оплаты ЮKassa и приём
  уведомлений об оплате. Всё остальное (каталог, вход, кабинет, избранное, заказы по договору,
  админка, статистика, подписка) работает через публичный ключ и правила доступа базы.
  Варианты: принимать онлайн-оплату на опубликованном Lovable-сайте, либо перенести эти две
  операции на функции базы — попросите агента.
- Изображения картин подтягиваются с `prosetskaya.lovable.app` и кешируются на сервере Timeweb,
  поэтому сайт на Lovable должен оставаться опубликованным.
- Загруженные через админку новые картины хранятся в базе и открываются через `api.prosetskaya.ru`.
