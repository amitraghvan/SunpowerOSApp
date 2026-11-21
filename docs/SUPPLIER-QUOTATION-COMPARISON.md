# Supplier Quotation Comparison & Award Matrix

## Evaluation Methodology
The `compareQuotesForRFQ` service evaluates all quotes submitted for a given RFQ using a multi-parameter commercial algorithm:

```typescript
// Bid Ranking Algorithm
const sorted = quotes.sort((a, b) => {
  // Sort primarily by lowest total amount (L1, L2... Ln)
  if (a.totalAmount !== b.totalAmount) {
    return Number(a.totalAmount) - Number(b.totalAmount);
  }
  // Secondary sort by shortest delivery lead time
  return Number(a.deliveryLeadTimeDays) - Number(b.deliveryLeadTimeDays);
});
```

## Comparison Matrix Output
The generated matrix provides:
1. **Commercial Comparison**: Base price, GST tax, total evaluated quote, and savings versus target benchmark.
2. **Rank Allocation**:
   - `rank: 1`: Lowest evaluated bidder (L1) highlighted with `isLowestBid: true`.
   - `rank: 2..N`: Competing secondary bidders.
3. **Operational Metrics**: Quoted delivery lead times in days and commercial payment terms (`NET_30`, `ADVANCE_100`).
4. **Award Execution**: When `awardRFQ` is called, the winning quote is marked `isWinning: true` and status `ACCEPTED`, while all other competing quotes are transitioned to `REJECTED`.
