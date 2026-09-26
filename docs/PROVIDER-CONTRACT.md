# API-phi provider contract

API-phi converts provider-specific interfaces into a common callable boundary. Provider adapters implement `call(request)`. Authentication helpers construct headers but credentials remain outside normalized Quant data.

Provider responses can supply data and provenance. They cannot declare authoritative Quant lifecycle transitions, BLACK seals, or ownership transfers. Those remain with the appropriate Phi services.
