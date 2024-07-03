UPDATE public."GoalTransfer"
SET "plaidCategory" = CASE 
    WHEN "categoryId" = '9e6aad48-c434-4c3d-85f9-ce68701c7213' THEN 'RENT_AND_UTILITIES'
    WHEN "categoryId" = '82cf28b0-c62e-4e9b-854f-7bb716535124' THEN 'RENT_AND_UTILITIES'
    WHEN "categoryId" = '658f543f-d1b9-46b8-983d-752b6aafd924' THEN 'RENT_AND_UTILITIES'
    WHEN "categoryId" = 'a1a9bae0-110b-47da-9842-8e6c714d485b' THEN 'TRANSPORTATION'
    WHEN "categoryId" = '48bdb28d-05be-4822-9047-22889684cf5b' THEN 'FOOD_AND_DRINK'
    WHEN "categoryId" = '009e7974-af05-4ee8-ba64-bf7d09332cd3' THEN 'GENERAL_MERCHANDISE'
    WHEN "categoryId" = 'ee6f1893-67c3-4098-a1dc-044b4dbfa054' THEN 'MEDICAL'
    WHEN "categoryId" = 'a952cda0-9e3e-42b2-a9e9-e6db70874c19' THEN 'MEDICAL'
    WHEN "categoryId" = '507b834b-afea-43b3-beff-33a818b23418' THEN 'MEDICAL'
    WHEN "categoryId" = '6bf945e4-cb4e-4870-a23e-429d54936817' THEN 'LOAN_PAYMENTS'
    WHEN "categoryId" = 'cd6bbc95-e8ee-4529-9d89-adcfb0a5bd63' THEN 'FOOD_AND_DRINK'
    WHEN "categoryId" = '4a40fa82-4544-4fad-90eb-8001012d6e7b' THEN 'FOOD_AND_DRINK'
    WHEN "categoryId" = '90254c85-6bff-4c6c-93be-b6d50353748a' THEN 'ENTERTAINMENT'
    ELSE NULL
END,
"initialTransfer" = CASE 
    WHEN "categoryId" IN ('faed4327-3a9c-4837-a337-c54e9704d60f') THEN TRUE
    ELSE FALSE
END;

UPDATE public."Goal"
SET "plaidCategory" = CASE 
    WHEN "categoryId" = '9e6aad48-c434-4c3d-85f9-ce68701c7213' THEN 'RENT_AND_UTILITIES'
    WHEN "categoryId" = '82cf28b0-c62e-4e9b-854f-7bb716535124' THEN 'RENT_AND_UTILITIES'
    WHEN "categoryId" = '658f543f-d1b9-46b8-983d-752b6aafd924' THEN 'RENT_AND_UTILITIES'
    WHEN "categoryId" = 'a1a9bae0-110b-47da-9842-8e6c714d485b' THEN 'TRANSPORTATION'
    WHEN "categoryId" = '48bdb28d-05be-4822-9047-22889684cf5b' THEN 'FOOD_AND_DRINK'
    WHEN "categoryId" = '009e7974-af05-4ee8-ba64-bf7d09332cd3' THEN 'GENERAL_MERCHANDISE'
    WHEN "categoryId" = 'ee6f1893-67c3-4098-a1dc-044b4dbfa054' THEN 'MEDICAL'
    WHEN "categoryId" = 'a952cda0-9e3e-42b2-a9e9-e6db70874c19' THEN 'MEDICAL'
    WHEN "categoryId" = '507b834b-afea-43b3-beff-33a818b23418' THEN 'MEDICAL'
    WHEN "categoryId" = '6bf945e4-cb4e-4870-a23e-429d54936817' THEN 'LOAN_PAYMENTS'
    WHEN "categoryId" = 'cd6bbc95-e8ee-4529-9d89-adcfb0a5bd63' THEN 'FOOD_AND_DRINK'
    WHEN "categoryId" = '4a40fa82-4544-4fad-90eb-8001012d6e7b' THEN 'FOOD_AND_DRINK'
    WHEN "categoryId" = '90254c85-6bff-4c6c-93be-b6d50353748a' THEN 'ENTERTAINMENT'
    ELSE NULL
END;