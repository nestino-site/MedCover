# Plan Recommendation

Get AI-powered health insurance plan recommendations tailored to a user's needs on MedCover.

## Usage

```
POST https://www.medcover.io/api/insurance/recommend
Content-Type: application/json
```

### Request Body

```json
{
  "age": 30,
  "family_size": 1,
  "budget": 500000,
  "needs": ["outpatient", "dental"]
}
```

### Fields

- `age` (required): primary insured person's age
- `family_size` (required): number of people to cover
- `budget` (required): maximum monthly premium in IRR
- `needs` (optional): array of coverage priorities

### Response

Returns a ranked JSON array of recommended plans with `plan_id`, `name`, `score`, `premium`, and `reason` fields.
