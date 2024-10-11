import { ItemPostRequestDTO } from "./dtos/item-post-request.dto";
import { prisma } from "../../prisma/client";

async function getAllItems() {
  const items = await prisma.item.findMany();

  return { items };
}

async function getItemById(id: string) {
  const item = await prisma.item.findUnique({ where: { id } });

  return { item };
}

async function createItem(itemData: ItemPostRequestDTO) {
  const item = await prisma.item.create({ data: itemData });

  return { item };
}

export default { getAllItems, createItem, getItemById };
