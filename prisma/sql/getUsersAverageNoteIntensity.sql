SELECT
    l."ownerId",
    ROUND(AVG(n.intensity)::NUMERIC, 2) as "average"
FROM
    "Note" n
LEFT JOIN
    "Language" l ON n."languageId" = l.id
GROUP BY
    l."ownerId"