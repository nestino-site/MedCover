# Insurance Plan Comparison

Compare health insurance plans across providers available on MedCover.

## Usage

Send a GET request with the plan identifiers to compare:

```
GET https://www.medcover.io/api/insurance/compare?plans={plan_ids}
```

### Parameters

- `plans` (required): comma-separated plan IDs to compare

### Response

Returns a JSON array of plan objects, each with `provider`, `name`, `premium`, `coverage`, and `deductible` fields.

## Example

```
GET https://www.medcover.io/api/insurance/compare?plans=plan-a,plan-b
```
