# Микросервис экономики

[![Build Status](https://travis-ci.org/sr-2020/billing.svg?branch=master)](https://travis-ci.org/sr-2020/billing)

## Сборка

Для сборки docker-образа нужно выполнить

```
docker build -t billing:latest
```

## Запуск

Запуск собранного docker-образа выполняется с помощью

```
docker run -p 3000:3000 -e MYSQL_HOST=<...> -e MYSQL_PASSWORD=<...> billing:latest
```

Дополнительные параметры которые можно передать через `-e`:

- MYSQL_USER (по умолчанию root)
- MYSQL_DATABASE (по умолчанию billing)

## Доступные методы

После запуска команды выше, на http://localhost:3000/explorer/ будет доступна Swagger-документация.

### Запрос баланса и истории операций

Осуществляется через GET запрос на `http://localhost:3000/account_info/<sin>`

Пример ответа:

```
{
  "balance": 0,
  "history": [
    {
      "id": 0,
      "created_at": "2019-05-16T21:36:07.523Z",
      "sin_from": 1,
      "sin_to": 2,
      "amount": 100,
      "comment": "For cookies",
    }
  ]
}
```

### Разовый перевод

Осуществляется через POST запрос на http://localhost:3000/transfer

Пример запроса:

```
{
  "sin_from": 1,
  "sin_to": 2,
  "amount": 100,
  "comment": "For cookies" // Optional field
}
```

Ответ пустой (`{}`).
В случае некорректного перевода (`sin_from == sin_to`, отрицательный `amount` или попытка перевести больше денег, чем имеется) - ошибка 400.

### Прямой доступ к базе

Есть набор методов позволяющих читать/писать базу (без каких либо проверок).
Только для внутреннего использования/отладки.
Доступны на `http://localhost:3000/transactions/<method>`. Подробности - см. Swagger-доку.
