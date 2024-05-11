import { newBlogPost } from "./services/blogWriter.js";
import promptSync from "prompt-sync";

const prompt = promptSync();

async function main() {
  const title = prompt("Enter the title for the blog post: ");

  const promptText = prompt("Enter the blog prompt: ");

  await newBlogPost(title, promptText);
}

main();
