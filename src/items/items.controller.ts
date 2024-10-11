import { Router, Request } from "express";
import itemsRepository from "./items.repository";
import { StatusCodes } from "http-status-codes";
import { ItemPostRequestDTO } from "./dtos/item-post-request.dto";
import { authGuard } from "../auth/middlewares/authGuard.middleware";

const router = Router();

// Get all items
// GET: /api/items
router.route("/").get(authGuard("USER"), async (req, res) => {
  const items = await itemsRepository.getAllItems();

  res.status(StatusCodes.OK).json(items);
});

// Get an item by id
// GET: /api/items/:id
router.route("/:id").get(async (req, res) => {
  const item = await itemsRepository.getItemById(req.params.id);

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
    const item = await itemsRepository.createItem(req.body);

    res.status(StatusCodes.CREATED).json(item);
  });

export default router;
