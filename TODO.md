# TODO

## Plan checklist
- [ ] Analyze why listing deletion doesn’t delete associated reviews.
- [x] Fix Mongoose middleware / schema logic in `models/listing.js` to cascade-delete reviews reliably.

- [ ] Ensure middleware runs for `findByIdAndDelete`/`findOneAndDelete` paths and uses correct review ids.
- [ ] Add minimal defensive code (handle missing reviews, correct hook/query).
- [ ] Run quick verification steps: create listing with reviews, delete listing, confirm reviews removed from DB.

