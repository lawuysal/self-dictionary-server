import { supabase } from "../db/supabase";
import { ItemPostRequestDTO } from "./dtos/item-post-request.dto";

async function getAllItems() {
  const { data, error } = await supabase.from("items").select();

  return { data, error };
}

async function getItemById(id: string) {
  const { data, error } = await supabase.from("items").select().eq("id", id);

  return { data, error };
}

async function createItem(item: ItemPostRequestDTO) {
  const { data, error } = await supabase.from("items").insert([item]).select();

  return { data, error };
}

export default { getAllItems, createItem, getItemById };
