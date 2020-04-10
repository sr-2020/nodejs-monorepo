SELECT
  COUNT(*),
  json_array_elements(implants) ->> 'id' AS id
FROM "sr2020-character"
GROUP BY
  id
