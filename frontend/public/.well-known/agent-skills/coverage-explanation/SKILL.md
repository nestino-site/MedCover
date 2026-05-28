# Coverage Explanation

Retrieve a detailed explanation of what a specific health insurance plan covers on MedCover.

## Usage

```
GET https://www.medcover.io/api/insurance/coverage/{plan_id}
```

### Parameters

- `plan_id` (required): unique identifier of the insurance plan

### Response

Returns a JSON object describing covered services, exclusions, co-pay amounts, annual limits, and provider network details.

## Example

```
GET https://www.medcover.io/api/insurance/coverage/plan-basic-2024
```
