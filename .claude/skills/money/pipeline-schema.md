# بنية `income/pipeline.json`

```jsonc
{
  "currency": "USD",
  "floor": 1500,                    // الأرضية المستهدفة
  "contracts": [
    {
      "id": "C01",
      "client": "اسم الجهة",
      "type": "maintenance",        // maintenance | retainer | contract | project
      "amount": 150,                // الشهري (أو الإجمالي لو type=project)
      "status": "prospect",         // prospect | pitched | negotiating | active | ended
      "started": "2026-09-01",      // فارغ لو لم يبدأ
      "ended": null,
      "notes": "…"
    }
  ],
  "applications": [
    { "date": "2026-08-21", "company": "…", "role": "…", "channel": "linkedin",
      "status": "sent" }           // sent | replied | interview | offer | rejected
  ]
}
```

**قواعد:**
- `type: "project"` **لا يُحتسب** بالدخل المتكرر — بقصد.
- `status: "active"` فقط هو ما يُحتسب.
- `amount` بالدولار شهرياً للأنواع المتكررة.
- لا تحذف عقداً منتهياً — غيّر `status` إلى `ended` وضع `ended`. التاريخ يعلّمك.
