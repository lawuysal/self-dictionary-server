import { Router, Request } from "express";
import itemsRepository from "./items.repository";
import { StatusCodes } from "http-status-codes";
import { ItemPostRequestDTO } from "./dtos/item-post-request.dto";

const router = Router();

// Get all items
// GET: /api/items
router.route("/").get(async (req, res) => {
  const { data: items, error } = await itemsRepository.getAllItems();

  if (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
    return;
  }

  res.status(StatusCodes.OK).json(items);
});

// Get an item by id
// GET: /api/items/:id
router.route("/:id").get(async (req, res) => {
  const { data: item, error } = await itemsRepository.getItemById(
    req.params.id,
  );

  if (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
    return;
  }

  if (!item) {
    res.status(StatusCodes.NOT_FOUND).json({ error: "Item not found" });
    return;
  }

  res.status(StatusCodes.OK).json(item);
});

// Create an item
// POST: /api/items
router
  .route("/")
  .post(async (req: Request<unknown, unknown, ItemPostRequestDTO>, res) => {
    const { data: item, error } = await itemsRepository.createItem(req.body);

    if (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
      return;
    }

    res.status(StatusCodes.CREATED).json(item);
  });

export default router;
