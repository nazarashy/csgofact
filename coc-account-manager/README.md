# Менеджер Аккаунтов Clash of Clans

Веб-приложение для управления аккаунтами Clash of Clans с интеграцией официального API.

## Функционал

- ✅ **Добавление аккаунтов** - email, пароль, тег игрока (#)
- ✅ **Изменение статуса** - "Прокачка" ↔ "Продан" в один клик
- ✅ **Редактирование данных** - изменение любой информации об аккаунте
- ✅ **Копирование данных** - быстрое копирование email, пароля и тега
- ✅ **Интеграция с CoC API** - получение информации об аккаунте из игры
- ✅ **Сохранение данных** - все данные сохраняются в JSON файл
- ✅ **Современный UI** - адаптивный дизайн для всех устройств

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер:
```bash
node server.js
```

3. Откройте браузер и перейдите по адресу:
```
http://localhost:3000
```

## API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/accounts` | Получить все аккаунты |
| POST | `/api/accounts` | Добавить новый аккаунт |
| PATCH | `/api/accounts/:id/status` | Изменить статус аккаунта |
| PUT | `/api/accounts/:id` | Обновить данные аккаунта |
| DELETE | `/api/accounts/:id` | Удалить аккаунт |
| GET | `/api/accounts/:id/coc-info` | Получить информацию из CoC API |
| POST | `/api/coc-key` | Установить API ключ CoC |

## Настройка CoC API

1. Получите API ключ на [developer.clashofclans.com](https://developer.clashofclans.com)
2. В веб-интерфейсе в разделе "Настройка API ключа" введите ваш ключ
3. Нажмите "Сохранить ключ"
4. Теперь вы можете получать информацию об аккаунтах из игры

## Примеры использования

### Добавить аккаунт через API:
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"email":"player@example.com","password":"secret123","playerTag":"#ABC123XYZ"}'
```

### Изменить статус:
```bash
curl -X PATCH http://localhost:3000/api/accounts/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Продан"}'
```

### Обновить данные аккаунта:
```bash
curl -X PUT http://localhost:3000/api/accounts/{id} \
  -H "Content-Type: application/json" \
  -d '{"email":"newemail@example.com","password":"newpass456"}'
```

## Структура проекта

```
coc-account-manager/
├── server.js           # Серверная часть (Node.js + Express)
├── accounts.json       # Файл с данными аккаунтов (создается автоматически)
├── package.json        # Зависимости проекта
├── public/
│   ├── index.html      # Веб-интерфейс
│   └── app.js          # Клиентская логика
└── README.md           # Документация
```

## Технологии

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Хранение данных**: JSON файл
- **API**: Clash of Clans Official API

## Безопасность

⚠️ **Внимание**: Это приложение хранит пароли в открытом виде. Используйте его только в локальной сети или обеспечьте дополнительную защиту данных.

## Лицензия

MIT
