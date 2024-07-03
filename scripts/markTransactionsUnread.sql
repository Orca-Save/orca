UPDATE public."Transaction"
SET read = false
WHERE "userId" = '7a168e2d-0d60-4c24-be8c-6059616d0281'
  AND date >= (CURRENT_DATE - INTERVAL '10 days');