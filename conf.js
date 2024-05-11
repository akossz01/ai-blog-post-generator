// I don't recommend changing anything here unless you know what you're doing
const keywordExtractPrompt = "You are an assistant designed to reply with 2-3 keywords based on the user's prompt. Do not reply with anything else, only closely related keywords separated by commas. Make the most imporant keyword be the first in the list.";

// You can fine tune the blog prompt to your liking, but make sure to keep the [Image: description] format for images
const blogPrompt = "You are a blog writer assistant. Write a blog post based on the user's prompt and the given keywords. The blog post should be at least 750 words long. Do not reply with anything else, only the blog post. Please study all the keywords and the prompt carefully before writing the blog post. This post will be used to increase the SEO ranking of the user's website. Only write the blog post, do not include the title or any other information. Insert images in the following format: [Image: description] where needed, but DO NOT add markdown images, add this custom tag.";

// How many posts to fetch from Reddit
const postsToFetch = 6;

// How many comments to read under each post
const commentsToFetch = 15;

// Choose how old the posts should be
// Possible values are: hour, day, week, month, year, all
const postAge = 'month'; 

export { keywordExtractPrompt, blogPrompt, postsToFetch, commentsToFetch, postAge };
